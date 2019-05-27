/**
 * @module background
 * @author nuintun
 */

import { escapeHTML } from './utils';
import { Encoder, Decoder, QRByte, QRKanji, QRNumeric, QRAlphanumeric, ErrorCorrectionLevel } from '@nuintun/qrcode';

const TEST_NUMERIC = /^\d+$/;
const TEST_ALPHANUMERIC = /^[0-9A-Z$%*+-./: ]+$/;

function chooseModeData(data) {
  if (TEST_NUMERIC.test(data)) {
    return new QRNumeric(data);
  } else if (TEST_ALPHANUMERIC.test(data)) {
    return new QRAlphanumeric(data);
  }

  try {
    return new QRKanji(data);
  } catch (error) {
    return new QRByte(data);
  }
}

function encode(data) {
  return new Promise((resolve, reject) => {
    const qrcode = new Encoder();

    qrcode.setEncodingHint(false);
    qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.M);
    qrcode.write(chooseModeData(data));

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

  return qrcode.scan(src).then(qrcode => {
    qrcode.data = escapeHTML(qrcode.data);

    return qrcode;
  });
}

// 页面 popup 服务逻辑
chrome.runtime.onMessage.addListener((request, sender, response) => {
  switch (request.action) {
    case 'GetQRCode':
      encode(request.data)
        .then(image => {
          response({
            ok: true,
            src: image
          });
        })
        .catch(error => {
          response({
            ok: false,
            message: error
          });
        });
  }

  return true;
});

const getSelectionText = `
  function getSelectionText(){
    var selection = window.getSelection();
    var selectionText = selection.toString();

    selection.removeAllRanges();

    return selectionText;
  }

  getSelectionText();
`;

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'QRDecode',
    contexts: ['image'],
    title: chrome.i18n.getMessage('decodeSelectImage'),
    onclick(data, tab) {
      decode(data.srcUrl)
        .then(qrcode => {
          chrome.tabs.sendMessage(tab.id, {
            ok: true,
            data: qrcode.data,
            action: data.menuItemId
          });
        })
        .catch(error => {
          chrome.tabs.sendMessage(tab.id, {
            ok: false,
            message: error,
            action: data.menuItemId
          });
        });
    }
  });

  chrome.contextMenus.create({
    id: 'QREncodeLink',
    contexts: ['link'],
    title: chrome.i18n.getMessage('encodeSelectLink'),
    onclick(data, tab) {
      encode(data.linkUrl)
        .then(image => {
          chrome.tabs.sendMessage(tab.id, {
            ok: true,
            src: image,
            action: data.menuItemId
          });
        })
        .catch(error => {
          chrome.tabs.sendMessage(tab.id, {
            ok: false,
            message: error,
            action: data.menuItemId
          });
        });
    }
  });

  chrome.contextMenus.create({
    id: 'QREncodeSelection',
    contexts: ['selection'],
    title: chrome.i18n.getMessage('encodeSelectionText'),
    onclick(data, tab) {
      const script = {
        runAt: 'document_end',
        frameId: data.frameId,
        code: getSelectionText
      };

      chrome.tabs.executeScript(tab.id, script, selection => {
        encode(selection[0])
          .then(image => {
            chrome.tabs.sendMessage(tab.id, {
              ok: true,
              src: image,
              action: data.menuItemId
            });
          })
          .catch(error => {
            chrome.tabs.sendMessage(tab.id, {
              ok: false,
              message: error,
              action: data.menuItemId
            });
          });
      });
    }
  });
});
