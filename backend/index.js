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
const port = process.env.PORT || 5001;

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_API_URL = "https://api.sarvam.ai/text-to-speech/stream";

app.use(cors());
app.use(express.json());

// Serve generated podcasts
const OUTPUTS_DIR = path.join(__dirname, 'outputs');
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR);
}
app.use('/outputs', express.static(OUTPUTS_DIR));

// Set up storage for uploaded files
const upload = multer({ dest: 'uploads/' });

/**
 * Sarvam AI TTS Integration
 */
async function generateTTS(text, filename) {
  if (!SARVAM_API_KEY) {
      console.warn("⚠️ SARVAM_API_KEY is missing in .env. Skipping audio generation.");
      return null;
  }

  try {
    const response = await axios({
      method: 'post',
      url: SARVAM_API_URL,
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        text: text,
        target_language_code: "en-IN",
        speaker: "tanya",
        model: "bulbul:v3",
        pace: 1.1,
        speech_sample_rate: 22050,
        output_audio_codec: "mp3",
        enable_preprocessing: true
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
    console.error('Sarvam AI Error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Main Sumarization Endpoint
 * Now also generates AI audio with Sarvam AI.
 */
app.post('/summarize', upload.single('file'), async (req, res) => {
  try {
    const text = req.body.text;
    const category = req.body.category || 'General';
    const maxWords = parseInt(req.body.maxWords, 10) || 500;
    
    let contentToSummarize = text || '';

    // Handle file upload if present
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
      return res.status(400).json({ error: 'No content provided for summarization.' });
    }

    // Prepare style-based system prompt
    let systemPrompt = `You are an expert podcast scriptwriter. 
    Summarize the provided content into a podcast format for the category: ${category || 'General'}.
    The summary must be under ${maxWords || 500} words.
    
    You must provide TWO distinct responses in a JSON format:
    1. "summary": A clean, editorial-style summary of the content.
    2. "voice_script": The exact same summary text, but optimized for TTS.
       IMPORTANT: Remove all internal markers like [pause] or [emphasis] for THIS particular voice script field. 
       Just clean, flowing speech that a TTS engine can read smoothly.
       
    The output MUST be a valid JSON object with keys "summary" and "voice_script".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contentToSummarize },
      ],
      response_format: { type: "json_object" },
    });

    const responseData = JSON.parse(completion.choices[0].message.content);
    
    // Generate TTS if voice_script is present
    let audioUrl = null;
    if (responseData.voice_script) {
        const timestamp = Date.now();
        const filename = `podcast_${timestamp}.mp3`;
        const resultFile = await generateTTS(responseData.voice_script, filename);
        if (resultFile) {
            // Dynamic host URL (works for local IP)
            const host = req.get('host');
            audioUrl = `http://${host}/outputs/${resultFile}`;
        }
    }

    res.json({
      success: true,
      data: {
          ...responseData,
          audioUrl: audioUrl
      },
      metadata: {
        category: category,
        maxWords: maxWords,
        originalLength: contentToSummarize.length
      }
    });

  } catch (error) {
    console.error('Summarization Error:', error);
    res.status(500).json({ error: 'Failed to process summarization. Check server logs.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Backend is up and running!' });
});

app.listen(port, () => {
  console.log(`MyPodcast Backend listening at http://localhost:${port}`);
});
