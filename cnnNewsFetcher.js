// Import necessary libraries and dependencies
const axios = require('axios');
const cheerio = require('cheerio');

// Fetch articles from CNN
async function fetchCNNArticles() {
  try {
    const cnnResponse = await axios.get('https://lite.cnn.com/');
    const $cnn = cheerio.load(cnnResponse.data);
    const cnnArticles = [];

    const cnntitle = "CNN News";
    cnnArticles.push(`<tr><th>${cnntitle}</th></tr>`);

    $cnn('body > div.layout-homepage__lite > div > section > div > ul > li').each((index, element) => {
      if (index < 100) {
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


module.exports = fetchCNNArticles;
