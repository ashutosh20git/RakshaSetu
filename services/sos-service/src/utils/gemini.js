const fetch = require('node-fetch');

const classifyEmergency = async (description) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
  console.log('Gemini raw response:', JSON.stringify(data, null, 2));
  
  const text = data.candidates[0].content.parts[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

module.exports = { classifyEmergency };