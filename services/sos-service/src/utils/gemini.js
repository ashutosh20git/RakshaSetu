const fetch = require('node-fetch');

const classifyEmergency = async (description) => {
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
                  text: `You are an emergency classifier for a crisis response app.
Given this emergency description, respond ONLY with a JSON object like this:
{
  "emergencyType": "MEDICAL | FIRE | VIOLENCE | TRAPPED | OTHER",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "routedTo": "MEDICAL | POLICE | FIRE_DEPT | VOLUNTEER"
}
Description: "${description}"`
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
      return { emergencyType: 'OTHER', severity: 'HIGH', routedTo: 'VOLUNTEER' };
    }

    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (err) {
    console.warn('Gemini classification failed, using defaults:', err.message);
    return { emergencyType: 'OTHER', severity: 'HIGH', routedTo: 'VOLUNTEER' };
  }
};

module.exports = { classifyEmergency };