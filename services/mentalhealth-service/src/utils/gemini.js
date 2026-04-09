const fetch = require('node-fetch');

const getSupportResponse = async (message) => {
  try {
    const GEMINI_API_KEY = require('fs').existsSync('/run/secrets/gemini_api_key') ? require('fs').readFileSync('/run/secrets/gemini_api_key', 'utf8').trim() : process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a calm, compassionate mental health support assistant for people in active crisis zones.
Your role is to provide emotional support, grounding techniques, and reassurance.
Keep responses short, warm, and practical. Never dismiss their feelings.
Never suggest they are overreacting. Always end with one simple actionable step.

User message: "${message}"`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.warn('Gemini error:', data.error.message);
      return "I hear you and I'm here with you. Take a slow deep breath. You are not alone in this.";
    }

    return data.candidates[0].content.parts[0].text;

  } catch (err) {
    console.warn('Gemini failed:', err.message);
    return "I hear you and I'm here with you. Take a slow deep breath. You are not alone in this.";
  }
};

module.exports = { getSupportResponse };