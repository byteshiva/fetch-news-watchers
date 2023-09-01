const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');

const app = express();
const port = 3000;

app.use(express.static('public'));

// Fetch articles from CNN
async function fetchCNNArticles() {
  try {
    const cnnResponse = await axios.get('https://lite.cnn.com/');
    const $cnn = cheerio.load(cnnResponse.data);
    const cnnArticles = [];

    const cnntitle = "CNN News";
    cnnArticles.push(`<tr><th>${cnntitle}</th></tr>`);

    $cnn('body > div.layout-homepage__lite > div > section > div > ul > li').each((index, element) => {
      if (index < 10) {
        const articleHtml = $cnn(element).html();
        const articleWithFullUrl = articleHtml.replace(/href="/g, 'href="https://lite.cnn.com');
        cnnArticles.push(`<tr><td>${articleWithFullUrl}</td></tr>`);
      }
    });

    return cnnArticles;
  } catch (error) {
    console.error('Error fetching CNN news:', error);
    throw error;
  }
}

// Fetch articles from Hacker News with absolute URLs
function fetchHackerNewsArticles() {
  return new Promise((resolve, reject) => {
    const hackerNewsUrl = 'https://news.ycombinator.com/';

    request(hackerNewsUrl, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const $hackerNews = cheerio.load(body);
        const titlelineSpans = $hackerNews('span.titleline');
        const hackerNewsData = [];

        const hackernewstitle = "News 1";
        hackerNewsData.push(`<tr><th>${hackernewstitle}</th></tr>`);

        titlelineSpans.each((index, element) => {
          if (index < 10) {
            const aTag = $hackerNews(element).find('a').first();
            const href = aTag.attr('href'); // Get the href attribute of the anchor tag
            const isRelativeUrl = href && !href.startsWith('http') && !href.startsWith('https'); // Check if it's a relative URL
            const baseUrl = 'https://news.ycombinator.com'; // Base URL for Hacker News

            if (isRelativeUrl) {
              const absoluteUrl = `${baseUrl}/${href}`; // Create an absolute URL by combining the base URL and the relative URL
              hackerNewsData.push(`<tr><td><a href="${absoluteUrl}">${aTag.html()}</a></td></tr>`);
            } else {
              hackerNewsData.push(`<tr><td><a href="${href}"> ${aTag.html()}</a></td></tr>`);
            }
          }
        });

        resolve(hackerNewsData);
      } else {
        console.error('Error fetching Hacker News:', error);
        reject('Error fetching Hacker News');
      }
    });
  });
}

// Fetch Lobsters articles
async function fetchLobstersArticles() {
  try {
    const url = 'https://lobste.rs/';
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Lobsters articles:', error);
    throw error;
  }
}

// Generate HTML for Lobsters articles with absolute URLs
function generateLobstersHTML(html) {
  const $ = cheerio.load(html);
  const elementsWithClass = $('.u-url');

  return elementsWithClass
    .slice(0, 15)
    .map((i, el) => {
      const link = $(el).attr('href');
      const isRelativeUrl = link && !link.startsWith('http') && !link.startsWith('https'); // Check if it's a relative URL

      if (isRelativeUrl) {
        const absoluteUrl = `https://lobste.rs/${link}`; // Use the domain name as the base URL
        return `<tr><td><a href="${absoluteUrl}">${$(el).text()}</a></td></tr>`;
      } else {
        return `<tr><td><a href="${link}">${$(el).text()}</a></td></tr>`;
      }
    })
    .get()
    .join('');
}

// Start the Express server
app.get('/getNews', async (req, res) => {
  try {
    const [cnnArticles, lobstersHtml, hackerNewsData] = await Promise.all([
      fetchCNNArticles(),
      fetchLobstersArticles(),
      fetchHackerNewsArticles()
    ]);

    const lobstersContent = `
      <tr><th>News 2</th></tr>
      ${generateLobstersHTML(lobstersHtml)}
    `;

    const combinedArticles = cnnArticles.concat(hackerNewsData).concat(lobstersContent);

    const tableContent = `
      <style>
        th {
          text-align: left;
        }
      </style>
      <table>
        <tbody>${combinedArticles.join('')}</tbody>
      </table>`;
    res.send(tableContent);

  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).send('Error fetching news');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
