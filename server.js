const express = require('express');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

// Endpoint to handle enhanced search
app.post('/api/ai-search', async (req, res) => {
  const userQuery = req.body.query;

  // 1. Use OpenAI to parse the query into structured search parameters
  const prompt = `
  You are an exercise and nutrition search assistant.
  Given a user query, extract exercise/nutrition types, keywords or dietary goals.
  Output JSON like: { "type": "yoga", "keyword": "beginner stretches" } or { "type": "nutrition", "keyword": "high protein" }
  
  Query: "${userQuery}"
  
  JSON:
  `;

  const aiResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 60,
    temperature: 0.0,
  });

  let searchParams;
  try {
    searchParams = JSON.parse(aiResponse.data.choices[0].text.trim());
  } catch(e) {
    return res.status(400).json({ error: "Unable to parse AI response" });
  }

  // 2. Call your Exercise or Nutrition API based on AI response
  let apiUrl;
  let headers = { 'X-Api-Key': process.env.API_NINJAS_KEY };
  if (searchParams.type === 'nutrition') {
    apiUrl = `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(searchParams.keyword)}`;
  } else {
    // Default or 'exercise'
    apiUrl = `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(searchParams.keyword)}`;
  }

  const apiResp = await axios.get(apiUrl, { headers });
  return res.json(apiResp.data);
});

app.listen(3000, () => console.log('Server running'));
