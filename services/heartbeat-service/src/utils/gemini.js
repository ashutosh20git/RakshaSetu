const fetch = require('node-fetch');

const composeDistressMessage = async (name, phone, latitude, longitude, description) => {
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
                  text: `You are a crisis alert system. Compose a short, urgent distress message for emergency contacts.
User details:
- Name: ${name}
- Phone: ${phone}
- Last known location: ${latitude}, ${longitude}
- Last activity: ${description || 'No description provided'}

Write a 2-3 sentence urgent alert message that emergency contacts should receive. Be direct and clear.`
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
      return `URGENT: ${name} has gone silent. Last known location: ${latitude}, ${longitude}. Please check on them immediately.`;
    }

    return data.candidates[0].content.parts[0].text;

  } catch (err) {
    console.warn('Gemini failed, using default message:', err.message);
    return `URGENT: ${name} has gone silent. Last known location: ${latitude}, ${longitude}. Please check on them immediately.`;
  }
};

module.exports = { composeDistressMessage };