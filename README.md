# Portfolio Website

Personal portfolio for Rob Basnet, deployed as a static site on Vercel.

https://robbasnet.vercel.app

The production site is a static frontend. The Node/Express backend in `backend/` is kept as an optional code sample and for local SMTP testing, but it is not required for production hosting and is excluded from the Vercel deployment via `.vercelignore`.

## Stack

- HTML, CSS, and vanilla JavaScript for the frontend
- Static hosting on Vercel, auto-deployed from `main`
- Optional Node.js, Express, and Nodemailer backend sample

## Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
├── Image/
├── Icons/
├── Robs-Resume-Latest.pdf
└── backend/
    ├── backend.js
    ├── package.json
    └── .env.example
```

## Running Locally

Open the static site directly in a browser, or run the backend only if you want to test the optional Express/Nodemailer sample:

```bash
cd backend
npm install
npm start
```

The optional backend serves the portfolio from the repository root and listens on `http://localhost:3000` by default.

## Contact Form

The production contact form is handled entirely from the static frontend.

In `index.html`, the `#contactForm` element has a `data-form-endpoint` attribute. Paste a static form service endpoint there, for example a Formspree endpoint:

```html
<form id="contactForm" class="contact-form" data-form-endpoint="https://formspree.io/f/YOUR_FORM_ID">
```

`script.js` posts the visitor's name, email, and message to that endpoint. If no endpoint is configured, or if the service fails, the form honestly reports that email delivery is not configured and opens a prepared email to `basnro01@gettysburg.edu`.

The form also includes a hidden honeypot field named `_gotcha` for basic spam filtering.

Important: Vercel static hosting does not run the Express backend. Do not use `/api/contact` in production unless the backend is deployed separately.

## Environment Variables

Environment variables are needed only for the optional backend sample. Create `backend/.env` locally from `backend/.env.example` if you run it.

Do not commit `.env`, `save.env`, app passwords, SMTP credentials, or `node_modules/`.
