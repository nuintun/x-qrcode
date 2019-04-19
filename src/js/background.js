import { Encoder, Decoder, ErrorCorrectLevel } from '@nuintun/qrcode';

function encode(data) {
  return new Promise((resolve, reject) => {
    const qrcode = new Encoder();

    qrcode.write(data);
    qrcode.setErrorCorrectLevel(ErrorCorrectLevel.M);

    try {
      qrcode.make();

      resolve(qrcode.toDataURL());
    } catch (error) {
      reject(error);
    }
  });
}

function decode(src) {
  const qrcode = new Decoder();

  return qrcode.scan(src);
}

chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
  if (request.action === 'GetTabURLQRCode') {
    encode(request.url)
      .then(image => {
        sendResponse({
          ok: true,
          src: image
        });
      })
      .catch(error => {
        sendResponse({
          ok: false,
          message: error
        });
      });
  }
});

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'QRDecode',
    title: '解码当前图片',
    contexts: ['image'],
    onclick(data, tab) {
      decode(data.srcUrl)
        .then(qrcode => {
          chrome.tabs.sendRequest(tab.id, {
            ok: true,
            data: qrcode.data,
            menuItemId: data.menuItemId
          });
        })
        .catch(error => {
          chrome.tabs.sendRequest(tab.id, {
            ok: false,
            message: error,
            menuItemId: data.menuItemId
          });
        });
    }
  });

  chrome.contextMenus.create({
    id: 'QREncodeLink',
    title: '编码当前链接',
    contexts: ['link'],
    onclick(data, tab) {
      encode(data.linkUrl)
        .then(image => {
          chrome.tabs.sendRequest(tab.id, {
            ok: true,
            src: image,
            menuItemId: data.menuItemId
          });
        })
        .catch(error => {
          chrome.tabs.sendRequest(tab.id, {
            ok: false,
            message: error,
            menuItemId: data.menuItemId
          });
        });
    }
  });

  chrome.contextMenus.create({
    id: 'QREncodeSelection',
    title: '编码当前文本',
    contexts: ['selection'],
    onclick(data, tab) {
      encode(data.selectionText)
        .then(image => {
          chrome.tabs.sendRequest(tab.id, {
            ok: true,
            src: image,
            menuItemId: data.menuItemId
          });
        })
        .catch(error => {
          chrome.tabs.sendRequest(tab.id, {
            ok: false,
            message: error,
            menuItemId: data.menuItemId
          });
        });
    }
  });
});
