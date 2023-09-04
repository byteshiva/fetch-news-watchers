const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');

const fetchHackerNewsArticles = require('./hackerNewsFetcher'); // Adjust the path if necessary
// Your main application logic here
const { fetchLobstersArticles, generateLobstersHTML } = require('./lobstersFetcher'); // Adjust the path if necessary
const fetchCNNArticles = require('./cnnNewsFetcher'); // Adjust the path if necessary

const app = express();
const port = 3000;

// Middleware to handle CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Set the appropriate origin
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static('public'));

// Create a router for the proxy
const proxyRouter = express.Router();

// Define a route within the proxy router to handle requests with different page numbers
proxyRouter.get('/', async (req, res) => {
  try {
    // Get the source (e.g., "hackernews" or "lobsters") and page number from the query parameters
    const { source, page } = req.query;

    if (!source || !page) {
      return res.status(400).json({ error: 'Missing source or page parameter' });
    }

    let articles = [];

    if (source === 'hackernews') {
      articles = await fetchHackerNewsArticles(page);
      res.send(`${articles.join('')}`);
    } else if (source === 'lobsters') {
      articles = await fetchLobstersArticles(page);
      res.send(`${generateLobstersHTML(articles, page)}`);
    } else {
      return res.status(400).json({ error: 'Invalid source parameter' });
    }
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'Error proxying request' });
  }
});

// Mount the proxy router at the '/proxy' endpoint
app.use('/proxy', proxyRouter);

// Start the Express server
app.get('/getNews', async (req, res) => { 
  // console.log("calling getNews route ");
  try {
    const [cnnArticles, lobstersHtml, hackerNewsData] = await Promise.all([
      fetchCNNArticles(),
      fetchLobstersArticles(),
      fetchHackerNewsArticles()
    ]);

    const lobstersContent = `
      <tr><th>News 2</th></tr>
      ${generateLobstersHTML(lobstersHtml, 1)}
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
