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
    this.mask.classList.add('x-qrcode-dialog-mask-open');
    this.dialog.classList.add('x-qrcode-dialog');
    this.dialog.classList.add('x-qrcode-dialog-open');

    if (!this.dialog.show) {
      this.dialog.show = () => (this.dialog.style.display = 'block');
    }

    if (!this.dialog.close) {
      this.dialog.close = () => (this.dialog.style.display = 'none');
    }

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
      const handleMaskAnimationEnd = () => {
        this.mask.removeEventListener('animationend', handleMaskAnimationEnd, false);

        document.body.removeChild(this.mask);
      };

      this.mask.addEventListener('animationend', handleMaskAnimationEnd, false);

      const handleDialogAnimationEnd = () => {
        this.dialog.close();
        this.dialog.removeEventListener('animationend', handleDialogAnimationEnd, false);

        document.body.removeChild(this.dialog);
      };

      this.dialog.addEventListener('animationend', handleDialogAnimationEnd, false);

      this.mask.classList.remove('x-qrcode-dialog-mask-open');
      this.mask.classList.add('x-qrcode-dialog-mask-close');
      this.dialog.classList.remove('x-qrcode-dialog-open');
      this.dialog.classList.add('x-qrcode-dialog-close');

      this.destroyed = true;

      if (Popup.current === this) {
        Popup.current = null;
      }
    }
  }
}

chrome.runtime.onMessage.addListener(response => {
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
