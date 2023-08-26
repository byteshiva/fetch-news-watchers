const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');

const app = express();
const port = 3000;

app.use(express.static('public'));

// Fetch CNN articles
async function fetchCNNArticles() {
  const cnnResponse = await axios.get('https://lite.cnn.com/');
  const $cnn = cheerio.load(cnnResponse.data);
  const cnnArticles = [];

  cnntitle = "CNN News";
  cnnArticles.push(`<tr><td>${cnntitle}</td></tr>`);

  $cnn('body > div.layout-homepage__lite > div > section > div > ul > li').each((index, element) => {
    if (index < 10) {
      const articleHtml = $cnn(element).html();
      const articleWithFullUrl = articleHtml.replace(/href="/g, 'href="https://lite.cnn.com');
      cnnArticles.push(`<tr><td>${articleWithFullUrl}</td></tr>`);
    }
  });

  return cnnArticles;
}

// Fetch Hacker News articles
function fetchHackerNewsArticles(callback) {
  const hackerNewsUrl = 'https://news.ycombinator.com/';

  request(hackerNewsUrl, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const $hackerNews = cheerio.load(body);
      const titlelineSpans = $hackerNews('span.titleline');
      const hackerNewsData = [];

      hackernewstitle = "News Ycombinator";
      hackerNewsData.push(`<tr><td>${hackernewstitle}</td></tr>`);

      titlelineSpans.each((index, element) => {
        if (index < 10) {
          const aTag = $hackerNews(element).find('a').first();
          const aTagHtml = $hackerNews.html(aTag);
          hackerNewsData.push(`<tr><td>${aTagHtml}</td></tr>`);
        }
      });

      callback(null, hackerNewsData);
    } else {
      console.error('Error fetching Hacker News:', error);
      callback('Error fetching Hacker News');
    }
  });
}

app.get('/getNews', async (req, res) => {
  try {
    const cnnArticles = await fetchCNNArticles();

    fetchHackerNewsArticles((hackerNewsError, hackerNewsData) => {
      if (hackerNewsError) {
        res.status(500).send('Error fetching Hacker News');
        return;
      }

      const combinedArticles = cnnArticles.concat(hackerNewsData);

      const tableContent = `<table><thead><tr><th>News Articles from different sources</th></tr></thead><tbody>${combinedArticles.join('')}</tbody></table>`;
      res.send(tableContent);
    });

  } catch (error) {
    console.error('Error fetching CNN news:', error);
    res.status(500).send('Error fetching CNN news');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

