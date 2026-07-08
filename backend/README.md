# Portfolio Contact Backend

This Express backend is kept as a Node/Nodemailer code sample and for optional local testing.

The production portfolio can be hosted as a static frontend on Vercel without deploying this server. In that setup, the contact form should use a static form service endpoint such as Formspree, configured in `index.html` through the `data-form-endpoint` attribute on `#contactForm`.

## Local Run

```bash
npm install
npm start
```

The server listens on `http://localhost:3000` by default and serves the portfolio from the repository root.

## Local Email Environment

Create a local `.env` file from `.env.example`.

Do not commit `.env`, `save.env`, Gmail app passwords, SMTP usernames, SMTP passwords, or `node_modules/`.
