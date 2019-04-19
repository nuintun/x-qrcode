import '../css/content.css';

class Popup {
  constructor(content) {
    this.destroyed = false;

    this.dialog = document.createElement('dialog');

    this.dialog.classList.add('x-qrcode-dialog');

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
      this.dialog.close();

      document.body.removeChild(this.dialog);
      document.removeEventListener('click', this.handler, false);

      this.destroyed = true;
    }
  }
}

let popupActived = null;

chrome.extension.onRequest.addListener(response => {
  const popup = new Popup();

  if (response.ok) {
    switch (response.menuItemId) {
      case 'QRDecode':
        popup.content(`<pre>${response.data}</pre>`);
        break;
      case 'QREncodeLink':
      case 'QREncodeSelection':
        popup.content(`<img src="${response.src}" alt="qrcode" />`);
    }
  } else {
    popup.content(`<pre style="color: red;">${response.message}</pre>`);
  }

  popupActived && popupActived.close();

  popup.show();

  popupActived = popup;
});
