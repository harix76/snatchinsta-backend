const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Invalid Instagram URL' });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const mediaUrl = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        return video.src; // Return video URL if it exists
      }

      const image = document.querySelector('img[srcset]');
      if (image) {
        return image.src; // Return image URL
      }

      return null;
    });

    await browser.close();

    if (mediaUrl) {
      res.json({ downloadUrl: mediaUrl });
    } else {
      res.status(404).json({ error: 'Failed to extract media. Make sure the URL is public.' });
    }
  } catch (error) {
    console.error('Error scraping Instagram:', error);
    res.status(500).json({ error: 'An error occurred while processing the URL.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
