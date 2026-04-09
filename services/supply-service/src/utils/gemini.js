const fetch = require('node-fetch');

const rankUrgency = async (type, description) => {
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
                  text: `You are a crisis supply coordinator. Analyze this supply request and respond ONLY with a JSON object like this:
{
  "urgency": <number 1-10>,
  "category": "FOOD | MEDICINE | BLOOD | SHELTER | OTHER"
}
Supply type: ${type}
Description: ${description}`
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
      return { urgency: 5, category: 'OTHER' };
    }

    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (err) {
    console.warn('Gemini failed, using defaults:', err.message);
    return { urgency: 5, category: 'OTHER' };
  }
};

module.exports = { rankUrgency };