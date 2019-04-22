/**
 * @module popup
 * @author nuintun
 */

import '../css/popup.css';
import { escapeHTML } from './utils';

const stage = document.getElementById('stage');

chrome.tabs.getSelected(tab => {
  chrome.extension.sendRequest(
    {
      data: tab.url,
      action: 'GetQRCode'
    },
    response => {
      if (response.ok) {
        stage.innerHTML = `<img src="${response.src}" alt="QRCode" />`;
      } else {
        stage.innerHTML = `<pre class="error">${escapeHTML(response.message)}</pre>`;
      }
    }
  );
});

document.addEventListener('contextmenu', e => e.preventDefault(), false);
