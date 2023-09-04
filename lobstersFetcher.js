const axios = require('axios');
const cheerio = require('cheerio');
const generateLoadMoreButton = require('./paginationUtils'); // Adjust the path if necessary

// Fetch Lobsters articles with pagination
async function fetchLobstersArticles(page) {

  if (typeof page !== 'string') {
    page = '1'; // Set a default page value of '1'
  }

  try {
    const url = `https://lobste.rs/page/${page}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Lobsters articles:', error);
    throw error;
  }
}

// Generate HTML for Lobsters articles with absolute URLs and "Load More" button
function generateLobstersHTML(html, currentPage) {
  const $ = cheerio.load(html);
  const elementsWithClass = $('.u-url');

  const articlesHTML = elementsWithClass
    .slice(0, 100)
    .map((i, el) => {
      const link = $(el).attr('href');
      const isRelativeUrl = link && !link.startsWith('http') && !link.startsWith('https');

      if (isRelativeUrl) {
        const absoluteUrl = `https://lobste.rs/${link}`;
        return `<tr><td><a href="${absoluteUrl}">${$(el).text()}</a></td></tr>`;
      } else {
        return `<tr><td><a href="${link}">${$(el).text()}</a></td></tr>`;
      }
    })
    .get()
    .join('');

  const proxyServerUrl = '/proxy'; // Adjust the URL if needed
  let num = parseInt(currentPage);
  const source = "lobsters";
  const lobsterButtonHTML = generateLoadMoreButton(proxyServerUrl, source, num, 'replaceLobsterMe', 'Load More...');

  return articlesHTML + lobsterButtonHTML;
}

module.exports = {
  fetchLobstersArticles,
  generateLobstersHTML,
};
