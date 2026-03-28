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
const port = process.env.PORT || 5003;

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// SARVAM AI (Commented out as requested)
/*
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_API_URL = "https://api.sarvam.ai/text-to-speech/stream";
*/

// ElevenLabs Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - Default Voice

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
 * ElevenLabs TTS Integration
 */
async function generateElevenLabsTTS(text, filename) {
  if (!ELEVENLABS_API_KEY) {
      console.warn("⚠️ ELEVENLABS_API_KEY is missing in .env. Skipping audio generation.");
      return null;
  }

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
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      responseType: 'stream'
    });

    const outputPath = path.join(OUTPUTS_DIR, filename);
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filename));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('ElevenLabs Error:', error.response?.data?.toString() || error.message);
    return null;
  }
}

/**
 * Helper to Save Episode to local JSON DB
 */
function saveEpisode(episode) {
    const episodes = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    episodes.push(episode);
    fs.writeFileSync(DB_FILE, JSON.stringify(episodes, null, 2));
}

/**
 * Endpoint to Get All Saved Episodes
 */
app.get('/episodes', (req, res) => {
    const episodes = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json({ success: true, data: episodes });
});

/**
 * Main Sumarization Endpoint
 * Generates summary with OpenAI and audio with ElevenLabs.
 */
app.post('/summarize', upload.single('file'), async (req, res) => {
  try {
    const text = req.body.text;
    const category = req.body.category || 'General';
    const maxWords = parseInt(req.body.maxWords, 10) || 500;
    
    let contentToSummarize = text || '';

    // Handle file upload
    if (req.file) {
      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();
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
      fs.unlinkSync(filePath);
    }

    if (!contentToSummarize) {
      return res.status(400).json({ error: 'No content provided.' });
    }

    const systemPrompt = `You are an expert podcast scriptwriter. 
    Summarize the provided content into a podcast format for the category: ${category}.
    The summary must be under ${maxWords} words.
    
    You must provide TWO distinct responses in a JSON format:
    1. "summary": A clean, editorial-style summary of the content.
    2. "voice_script": The same summary text, optimized for TTS (natural speech flow).
       
    The output MUST be a valid JSON object with keys "summary" and "voice_script".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: contentToSummarize }],
      response_format: { type: "json_object" },
    });

    const responseData = JSON.parse(completion.choices[0].message.content);
    
    // Generate Audio with ElevenLabs
    let audioUrl = null;
    let filename = `podcast_${Date.now()}.mp3`;
    const resultFile = await generateElevenLabsTTS(responseData.voice_script, filename);
    
    if (resultFile) {
        const host = req.get('host');
        audioUrl = `http://${host}/outputs/${resultFile}`;
    }

    // Persist Episode for Library
    const newEpisode = {
        id: Date.now().toString(),
        title: category + " Podcast - " + new Date().toLocaleDateString(),
        summary: responseData.summary,
        audioUrl: audioUrl,
        category: category,
        timestamp: new Date().toISOString()
    };
    saveEpisode(newEpisode);

    res.json({
      success: true,
      data: newEpisode // Return the full episode object
    });

  } catch (error) {
    console.error('Summarization Error:', error);
    res.status(500).json({ error: 'Failed to process.' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
