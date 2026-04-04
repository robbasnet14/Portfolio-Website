const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, 'save.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  if (process.env.EMAIL && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  throw new Error('Missing SMTP credentials. Set SMTP_* vars or EMAIL/EMAIL_PASSWORD.');
}

app.post('/api/contact', async (req, res) => {
  const fallbackEmail = process.env.CONTACT_TO || process.env.EMAIL || 'basnro01@gettysburg.edu';

  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const transporter = createTransporter();
    const toEmail = process.env.CONTACT_TO || process.env.EMAIL;
    if (!toEmail) {
      return res.status(500).json({
        error: `Contact service unavailable. Please email ${fallbackEmail}.`,
      });
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Portfolio Contact" <${process.env.SMTP_USER || process.env.EMAIL}>`,
      to: toEmail,
      replyTo: email,
      subject: `Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New Portfolio Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    const msg = String(error?.message || 'Unknown error');
    console.error('Contact API error:', msg);

    if (msg.toLowerCase().includes('missing smtp credentials')) {
      return res.status(503).json({
        error: `Contact service unavailable. Please email ${fallbackEmail}.`,
      });
    }

    return res.status(502).json({
      error: `Could not send message right now. Please email ${fallbackEmail}.`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
