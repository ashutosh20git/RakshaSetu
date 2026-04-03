const fs = require('fs');

const readSecret = (name) => {
  try {
    return fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
  } catch {
    return process.env[name];
  }
};

module.exports = readSecret;