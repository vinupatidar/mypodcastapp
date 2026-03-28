const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT, 10) || 5010;

// Setup Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ElevenLabs Configuration
const ELEVENLABS_API_KEY = (process.env.ELEVENLABS_API_KEY || '').trim();
const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam

app.use(cors());
app.use(express.json());

// Serve generated podcasts
const OUTPUTS_DIR = path.join(__dirname, 'outputs');
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR);
}
app.use('/outputs', express.static(OUTPUTS_DIR));

// DB Persistence setup
const DB_FILE = path.join(__dirname, 'db', 'episodes.json');
if (!fs.existsSync(path.join(__dirname, 'db'))) {
  fs.mkdirSync(path.join(__dirname, 'db'));
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Set up storage for uploaded files
const upload = multer({ dest: 'uploads/' });

/**
 * ElevenLabs TTS Integration - Updated with Speed and Multi-language support
 */
async function generateElevenLabsTTS(text, filename, speed = 1.0, voiceId = DEFAULT_VOICE_ID) {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
    console.warn("⚠️ ELEVENLABS_API_KEY is invalid or missing in .env.");
    return null;
  }

  // Normalize speed between 0.5 and 2.0
  const normalizedSpeed = Math.min(Math.max(speed, 0.5), 2.0);

  console.log(`🎙️ Generating TTS (Speed: ${normalizedSpeed}) for text (${text.length} chars) using ElevenLabs...`);

  try {
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        text: text,
        model_id: "eleven_multilingual_v2", // Supports 29 languages
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: normalizedSpeed // Added speed control
        }
      },
      responseType: 'stream'
    });

    const outputPath = path.join(OUTPUTS_DIR, filename);
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ TTS Generated: ${filename}`);
        resolve(filename);
      });
      writer.on('error', (err) => {
        console.error(`❌ Stream Save Error:`, err);
        reject(err);
      });
    });
  } catch (error) {
    if (error.response && error.response.data) {
      let errorData = '';
      try {
        for await (const chunk of error.response.data) {
          errorData += chunk.toString();
        }
      } catch (e) {
        errorData = 'Could not parse error stream';
      }
      console.error(`❌ ElevenLabs API Error (${error.response.status}):`, errorData);
    } else {
      console.error('❌ ElevenLabs Error Message:', error.message);
    }
    return null;
  }
}

/**
 * Helper to Save Episode to local JSON DB
 */
function saveEpisode(episode) {
  try {
    const episodes = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    episodes.push(episode);
    fs.writeFileSync(DB_FILE, JSON.stringify(episodes, null, 2));
  } catch (err) {
    console.error('❌ DB Save Error:', err);
  }
}

/**
 * Endpoint to Get All Saved Episodes
 */
app.get('/episodes', (req, res) => {
  try {
    const episodes = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json({ success: true, data: episodes });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch episodes' });
  }
});

/**
 * Main Sumarization Endpoint - Updated for Language and Category style
 */
app.post('/summarize', upload.single('file'), async (req, res) => {
  console.log(`⚡ Received summarize request for category: ${req.body.category}, language: ${req.body.language}`);
  try {
    const text = req.body.text;
    const category = req.body.category || 'General';
    const language = req.body.language || 'English (US)';
    const maxWords = parseInt(req.body.maxWords, 10) || 500;
    const speed = parseFloat(req.body.speed) || 1.0;
    const voiceId = req.body.voiceId || DEFAULT_VOICE_ID;
    const userId = req.body.userId;

    // 1. Credit Check Logic
    if (userId) {
        console.log(`💳 Checking real-time credits for User ID: ${userId}`);
        const { data: sub, error: subErr } = await supabase
            .from('user_subscriptions')
            .select('remaining_credits')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();

        if (subErr) {
            console.error('⚠️ DB Error checking credits:', subErr);
            return res.status(500).json({ error: 'db_error', message: 'Error verifying subscription. Please try again later.' });
        }

        if (!sub) {
            console.error('❌ Active subscription not found for credit check in DB');
            return res.status(403).json({ error: 'subscription_not_found', message: 'No active subscription found. Please subscribe to generate podcasts.' });
        }

        if (sub.remaining_credits <= 0) {
            console.warn('⚠️ User out of credits:', userId);
            return res.status(403).json({ error: 'out_of_credits', message: 'You are out of credits as per your plan. Please upgrade or buy more credits.' });
        }
    }

    let contentToSummarize = text || '';

    // Handle file upload
    if (req.file) {
      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      try {
        if (fileExt === '.pdf') {
          const dataBuffer = fs.readFileSync(filePath);
          const data = await pdf(dataBuffer);
          contentToSummarize = data.text;
        } else if (fileExt === '.docx') {
          const data = await mammoth.extractRawText({ path: filePath });
          contentToSummarize = data.value;
        } else if (fileExt === '.txt') {
          contentToSummarize = fs.readFileSync(filePath, 'utf8');
        }
      } catch (e) {
        console.error('❌ File Parsing Error:', e);
      } finally {
        fs.unlinkSync(filePath);
      }
    }

    if (!contentToSummarize || contentToSummarize.trim().length === 0) {
      return res.status(400).json({ error: 'No content provided.' });
    }

    console.log(`🤖 Summarizing content (${language}) in style: ${category}...`);

    // REFINEMENT: Explicit Language, Style and VALIDATION instruction for OpenAI
    const systemPrompt = `You are a professional podcast scriptwriter. 
    
    VALIDATION RULE:
    If the provided content is blank, consists only of greetings (e.g., "hi", "hello", "hey"), or contains random/insufficient text that cannot be summarized into a meaningful podcast format, you MUST NOT summarize it.
    Instead, return a JSON object with exactly:
    { "error": true, "message": "Please provide more details or a sufficient number of words for a proper podcast summary." }

    GENERAL TASK:
    If content is sufficient, summarize it into a podcast format.
    Style/Category: ${category} (Adjust tone, vocabulary, and pacing to match this style).
    Language: The entire response MUST be written in ${language}. 
    Length: Under ${maxWords} words.
    
    Output Format for valid summaries: MUST be a valid JSON object with:
    1. "summary": A clean editorial summary in ${language}.
    2. "voice_script": The summary optimized for natural podcast speech in ${language}.
    3. "error": false`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: contentToSummarize }],
      response_format: { type: "json_object" },
    });

    const responseData = JSON.parse(completion.choices[0].message.content);
    
    if (responseData.error) {
      console.log(`⚠️ OpenAI rejected input: ${responseData.message}`);
      return res.status(400).json({ error: responseData.message });
    }

    console.log(`✅ OpenAI Summary complete in ${language}.`);

    // Generate Audio with ElevenLabs - Passing Speed
    let audioUrl = null;
    let filename = `podcast_${Date.now()}.mp3`;
    const resultFile = await generateElevenLabsTTS(responseData.voice_script, filename, speed, voiceId);

    if (resultFile) {
      const host = req.get('host');
      audioUrl = `http://${host}/outputs/${resultFile}`;
      console.log(`🔗 Audio URL: ${audioUrl}`);
    } else {
      console.warn(`⚠️ Background audio generation failed.`);
    }

    console.log("reponse summary : ", responseData.summary)
    console.log("response voice script  : ", responseData.voice_script)
    const newEpisode = {
      id: Date.now().toString(),
      title: `${category} Hub - ${new Date().toLocaleDateString()} (${language})`,
      summary: responseData.summary,
      audioUrl: audioUrl,
      category: category,
      language: language,
      timestamp: new Date().toISOString()
    };
    saveEpisode(newEpisode);

    res.json({ success: true, data: newEpisode });

    // 4. Update Credits Logic
    if (userId) {
        console.log(`📉 Decrementing credits for User: ${userId}`);
        const { error: updateErr } = await supabase.rpc('decrement_credits', { x_user_id: userId });
        if (updateErr) {
            // Fallback to manual update if RPC is not defined
            console.warn('⚠️ RPC decrement_credits failed, attempting manual update', updateErr);
            const { data: currentSub } = await supabase
                .from('user_subscriptions')
                .select('remaining_credits')
                .eq('user_id', userId)
                .single();
            
            if (currentSub) {
                await supabase
                    .from('user_subscriptions')
                    .update({ remaining_credits: Math.max(0, currentSub.remaining_credits - 1) })
                    .eq('user_id', userId);
            }
        }
    }

  } catch (error) {
    console.error('❌ Summarization Error:', error);
    res.status(500).json({ error: 'Failed to process.' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

const server = app.listen(port, () => {
  console.log(`🚀 Backend listening at http://localhost:${port}`);
});

// GRACEFUL SHUTDOWN (Fixed Port issue)
const shutdown = () => {
    console.log('🛑 Shutting down server gracefully...');
    server.close(() => {
        console.log('✅ Server closed. Port released.');
        process.exit(0);
    });
    // Force exit after 3 seconds if not closed
    setTimeout(() => {
        console.warn('⚠️ Forcefully shutting down.');
        process.exit(1);
    }, 3000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
