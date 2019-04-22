/**
 * @module content
 * @author nuintun
 */

import '../css/content.css';
import { escapeHTML } from './utils';

class Popup {
  constructor(content) {
    this.destroyed = false;

    this.dialog = document.createElement('dialog');

    this.dialog.classList.add('x-qrcode-dialog');
    this.dialog.classList.add('x-qrcode-dialog-open');

    this.content(content);

    this.handler = ({ target }) => target !== this.dialog && !this.dialog.contains(target) && this.close();

    document.body.appendChild(this.dialog);
    document.addEventListener('click', this.handler, false);
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

      document.removeEventListener('click', this.handler, false);

      this.dialog.addEventListener('animationend', handleAnimationEnd, false);

      this.dialog.classList.remove('x-qrcode-dialog-open');
      this.dialog.classList.add('x-qrcode-dialog-close');

      this.destroyed = true;
    }
  }
}

let popupActived = null;

chrome.extension.onRequest.addListener(response => {
  const popup = new Popup();
  const openPopup = () => {
    popupActived && popupActived.close();

    popup.show();

    popupActived = popup;
  };

  if (response.action === 'GetSelectionText') {
    const selectionText = window.getSelection().toString();

    chrome.extension.sendRequest({ data: selectionText, action: 'GetQRCode' }, response => {
      if (response.ok) {
        popup.content(`<img src="${response.src}" alt="QRCode" />`);
      } else {
        popup.content(`<pre class="error">${escapeHTML(response.message)}</pre>`);
      }

      openPopup();
    });
  } else {
    if (response.ok) {
      switch (response.action) {
        case 'QRDecode':
          popup.content(`<pre>${escapeHTML(response.data)}</pre>`);
          break;
        case 'QREncodeLink':
          popup.content(`<img src="${response.src}" alt="QRCode" />`);
      }
    } else {
      popup.content(`<pre class="error">${escapeHTML(response.message)}</pre>`);
    }

    openPopup();
  }
});
