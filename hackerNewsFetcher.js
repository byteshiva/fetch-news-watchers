// Import necessary libraries and dependencies
const axios = require('axios');
const cheerio = require('cheerio');


// Define the URL of your proxy server
const proxyServerUrl = '/proxy'; // Adjust the URL if needed

// Function to generate the Hacker News URL with page number
function generateHackerNewsUrl(page) {
  const baseUrl = 'https://news.ycombinator.com/';
  return `${baseUrl}?p=${page}`;
}

// Fetch articles from Hacker News with Load More functionality
async function fetchHackerNewsArticles(page) {
  // console.log("calling fetchHackerNewsArticles method ");
  // Set the default value for page if it's not provided
  page = page || 1;

  try {
    // console.log(page);
    const hackerNewsUrl = generateHackerNewsUrl(page);
    
    const hackerNewsResponse = await axios.get(hackerNewsUrl);
    const $hackerNews = cheerio.load(hackerNewsResponse.data);
    const hackerNewsData = [];

    if(parseInt(page) == 1) {
	    const hackernewstitle = "News 1";
	    hackerNewsData.push(`<tr id="hackernews1"><th>${hackernewstitle}</th></tr>`);
    }

    $hackerNews('span.titleline').each((index, element) => {
      if (index < 100) {
        const aTag = $hackerNews(element).find('a').first();
        const href = aTag.attr('href'); // Get the href attribute of the anchor tag
        const isRelativeUrl = href && !href.startsWith('http') && !href.startsWith('https'); // Check if it's a relative URL

        if (isRelativeUrl) {
          const absoluteUrl = `${generateHackerNewsUrl(page)}${href}`; // Use the generateHackerNewsUrl function to get the URL
          hackerNewsData.push(`<tr><td><a href="${absoluteUrl}">${aTag.html()}</a></td></tr>`);
        } else {
          hackerNewsData.push(`<tr><td><a href="${href}">${aTag.html()}</a></td></tr>`);
        }
      }
    });

    // Check if there are more pages to load
    const hasNextPage = $hackerNews('a.morelink').length > 0;

     // If there's a next page, add the "Load More" button with the incremented page number
     if (hasNextPage) {
         let num = parseInt(page); // Convert the string to an integer
	  const proxyUrl = `${proxyServerUrl}?page=${num + 1}`;
	  hackerNewsData.push(`
	    <tr id="replaceMe">
	      <td>
		<button class='btn' hx-get="${proxyUrl}"
			hx-target="#replaceMe"
			hx-swap="outerHTML">
		  Load More Articles... <img class="htmx-indicator" src="/bars.svg">
		</button>
	      </td>
	    </tr>
	  `);
     }

    return hackerNewsData;
  } catch (error) {
    console.error('Error fetching Hacker News:', error);
    throw error;
  }
}

module.exports = fetchHackerNewsArticles;

