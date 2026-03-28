const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Set up storage for uploaded files
const upload = multer({ dest: 'uploads/' });

/**
 * Main Sumarization Endpoint
 * Handles both direct text input and file uploads.
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

      // Cleanup uploaded file
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
    2. "voice_script": The exact same summary text, but enhanced with voice agent cues. 
       Add [pause] for short breaks (1s), [long-pause] for transitions (3s), and wrap [emphasis] around key words or phrases that need stronger delivery.
       The "voice_script" must follow the flow of the summary but be optimized for a natural, high-quality audio experience.
       
    The output MUST be a valid JSON object with keys "summary" and "voice_script".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or your preferred model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contentToSummarize },
      ],
      response_format: { type: "json_object" },
    });

    const responseData = JSON.parse(completion.choices[0].message.content);
    res.json({
      success: true,
      data: responseData,
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
