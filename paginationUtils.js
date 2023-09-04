function generateLoadMoreButton(proxyServerUrl, source, num, targetId, buttonText) {
  const proxyUrl = `${proxyServerUrl}?source=${source}&page=${num + 1}`;
  return `
    <tr id="${targetId}">
      <td>
        <button class='fetch-button' hx-get="${proxyUrl}"
          hx-target="#${targetId}"
          hx-swap="outerHTML">
          ${buttonText} <img class="htmx-indicator" src="/bars.svg">
        </button>
      </td>
    </tr>
  `;
}

module.exports = generateLoadMoreButton;
