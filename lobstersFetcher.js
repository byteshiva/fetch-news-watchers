// Import necessary libraries and dependencies
const axios = require('axios');
const cheerio = require('cheerio');

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
    .slice(0, 100)
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

module.exports = {
	fetchLobstersArticles,
	generateLobstersHTML,
};

