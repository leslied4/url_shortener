require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var dns = require("dns");
var bodyParser = require("body-parser");
// In-memory database to store URL mappings
const urlDatabase = {};
let urlCounter = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware for parsing POST request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint to create a short URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Check if URL is valid
  try {
    const urlObj = new URL(originalUrl);
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // Store the URL and assign a short URL
      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({ original_url: originalUrl, short_url: shortUrl });
    });
  } catch (e) {
    return res.json({ error: "invalid url" });
  }
});

// GET endpoint to redirect to the original URL
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl);

  // Check if the short URL exists
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
