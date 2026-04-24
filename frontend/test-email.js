const fs = require('fs');
const nodemailer = require('nodemailer');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts.shift().trim();
    let val = parts.join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

console.log('SMTP_HOST:', env.SMTP_HOST);
console.log('SMTP_PORT:', env.SMTP_PORT);
console.log('SMTP_USER:', env.SMTP_USER);
console.log('SMTP_PASS lengths:', env.SMTP_PASS ? env.SMTP_PASS.length : 0);
console.log('SMTP_PASS: [' + env.SMTP_PASS + ']');

// Gmail app passwords sometimes fail if they contain spaces.
// Let's test both with and without spaces.

async function testAuth(pass, label) {
  console.log(`\nTesting with ${label}...`);
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_PORT === '465',
    auth: {
      user: env.SMTP_USER,
      pass: pass,
    },
  });

  return new Promise((resolve) => {
    transporter.verify(function (error) {
      if (error) {
        console.log(`[${label}] VERIFY ERROR:`, error.message);
        resolve(false);
      } else {
        console.log(`[${label}] Server is ready to take our messages`);
        resolve(true);
      }
    });
  });
}

async function run() {
  const withSpaces = env.SMTP_PASS;
  const noSpaces = env.SMTP_PASS ? env.SMTP_PASS.replace(/\s+/g, '') : '';
  
  await testAuth(withSpaces, "original (with spaces)");
  if (withSpaces !== noSpaces) {
    await testAuth(noSpaces, "stripped (without spaces)");
  }
}

run();
