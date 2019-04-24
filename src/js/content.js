/**
 * @module content
 * @author nuintun
 */

import '../css/content.css';

class Popup {
  static current = null;

  constructor(content) {
    this.destroyed = false;

    this.mask = document.createElement('div');
    this.dialog = document.createElement('dialog');

    this.mask.classList.add('x-qrcode-dialog-mask');
    this.dialog.classList.add('x-qrcode-dialog-mask-open');
    this.dialog.classList.add('x-qrcode-dialog');
    this.dialog.classList.add('x-qrcode-dialog-open');

    this.content(content);

    const handleMaskClick = () => {
      this.mask.removeEventListener('click', handleMaskClick, false);

      this.close();
    };

    this.mask.addEventListener('click', handleMaskClick, false);

    document.body.appendChild(this.mask);
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

      Popup.current = this;
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

      document.body.removeChild(this.mask);

      this.destroyed = true;

      if (Popup.current === this) {
        Popup.current = null;
      }
    }
  }
}

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

  if (Popup.current) {
    Popup.current.close();
  }

  popup.show();
});
