/**
 * @module content
 * @author nuintun
 */

import '../css/content.css';

if (top === window) {
  class Popup {
    constructor(content) {
      this.destroyed = false;

      this.dialog = document.createElement('dialog');

      this.dialog.classList.add('x-qrcode-dialog');
      this.dialog.classList.add('x-qrcode-dialog-open');

      this.content(content);

      document.body.appendChild(this.dialog);
    }

    content(content) {
      if (!this.destroyed) {
        this.dialog.innerHTML = content;
      }
    }

    show() {
      if (!this.destroyed) {
        this.dialog.show();
      }
    }

    close() {
      if (!this.destroyed) {
        const handleAnimationEnd = () => {
          this.dialog.close();
          this.dialog.removeEventListener('animationend', handleAnimationEnd, false);

          document.body.removeChild(this.dialog);
        };

        this.dialog.addEventListener('animationend', handleAnimationEnd, false);

        this.dialog.classList.remove('x-qrcode-dialog-open');
        this.dialog.classList.add('x-qrcode-dialog-close');

        this.destroyed = true;
      }
    }
  }

  let currentPopup = null;

  const openPopup = popup => {
    currentPopup && currentPopup.close();

    popup.show();

    currentPopup = popup;
  };

  chrome.extension.onRequest.addListener(response => {
    const popup = new Popup();

    if (response.ok) {
      switch (response.action) {
        case 'QRDecode':
          popup.content(`<pre>${response.data}</pre>`);
          break;
        case 'QREncodeLink':
        case 'QREncodeSelection':
          popup.content(`<img src="${response.src}" alt="QRCode" />`);
      }
    } else {
      popup.content(`<pre class="error">${response.message}</pre>`);
    }

    openPopup(popup);
  });

  const handleClick = ({ target }) => {
    if (currentPopup && !currentPopup.destroyed) {
      if (target !== currentPopup.dialog && !currentPopup.dialog.contains(target)) {
        currentPopup.close();
      }
    }
  };

  const handleMessage = ({ data }) => {
    if (data.source === 'x-qrcode-detector' && data.action === 'ClosePopup') {
      if (currentPopup && !currentPopup.destroyed) {
        currentPopup.close();
      }
    }
  };

  document.addEventListener('click', handleClick, false);
  window.addEventListener('message', handleMessage, false);
} else {
  const handleClick = () => {
    top.postMessage({ source: 'x-qrcode-detector', action: 'ClosePopup' });
  };

  document.addEventListener('click', handleClick, false);
}
