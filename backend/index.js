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

dotenv.config();

const app = express();
const port = process.env.PORT || 5006;

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ElevenLabs Configuration
const ELEVENLABS_API_KEY = (process.env.ELEVENLABS_API_KEY || '').trim();
const ELEVEN_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam - Standard Free Tier Voice

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
async function generateElevenLabsTTS(text, filename, speed = 1.0) {
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
      url: `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}/stream`,
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

    // REFINEMENT: Explicit Language and Style instruction for OpenAI
    const systemPrompt = `You are a professional podcast scriptwriter. 
    Task: Summarize the provided content into a podcast format.
    Style/Category: ${category} (Adjust tone, vocabulary, and pacing to match this style).
    Language: The entire response MUST be written in ${language}. 
    Length: Under ${maxWords} words.
    
    Output Format: MUST be a valid JSON object with:
    1. "summary": A clean editorial summary in ${language}.
    2. "voice_script": The summary optimized for natural podcast speech in ${language}.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: contentToSummarize }],
      response_format: { type: "json_object" },
    });

    const responseData = JSON.parse(completion.choices[0].message.content);
    console.log(`✅ OpenAI Summary complete in ${language}.`);

    // Generate Audio with ElevenLabs - Passing Speed
    let audioUrl = null;
    let filename = `podcast_${Date.now()}.mp3`;
    const resultFile = await generateElevenLabsTTS(responseData.voice_script, filename, speed);

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

  } catch (error) {
    console.error('❌ Summarization Error:', error);
    res.status(500).json({ error: 'Failed to process.' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.listen(port, () => {
  console.log(`🚀 Backend listening at http://localhost:${port}`);
});
