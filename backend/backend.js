const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files like CSS
app.use(express.static(path.join(__dirname, '../')));  // Go one level up to serve style.css

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Intro.html')); // Go one level up to access Intro.html
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
