/**
 * @module background
 */

import { decode } from '/js/common/decode';
import { encode } from '/js/common/encode';
import { ActionType } from '/js/common/action';
import { bitmapToDataURL } from '/js/common/url';
import { getImageBitmap } from '/js/common/image';
import { getSelectionText } from '/js/common/selection';

const { commands, contextMenus, i18n, runtime, tabs } = chrome;

runtime.onInstalled.addListener(() => {
  contextMenus.removeAll(() => {
    contextMenus.create({
      contexts: ['link'],
      id: ActionType.ENCODE_SELECT_LINK,
      title: i18n.getMessage('encodeSelectLink')
    });

    contextMenus.create({
      contexts: ['image'],
      id: ActionType.DECODE_SELECT_IMAGE,
      title: i18n.getMessage('decodeSelectImage')
    });

    contextMenus.create({
      contexts: ['selection'],
      id: ActionType.ENCODE_SELECTION_TEXT,
      title: i18n.getMessage('encodeSelectionText')
    });

    contextMenus.create({
      contexts: ['page', 'action'],
      id: ActionType.DECODE_SELECT_CAPTURE_AREA,
      title: i18n.getMessage('decodeSelectCaptureArea')
    });
  });
});

commands.onCommand.addListener((command, tab) => {
  const tabId = tab?.id;

  switch (command) {
    case ActionType.DECODE_SELECT_CAPTURE_AREA:
      if (tabId != null) {
        tabs.sendMessage(tabId, {
          type: ActionType.DECODE_SELECT_CAPTURE_AREA
        });
      }
      break;
    default:
      break;
  }
});

contextMenus.onClicked.addListener(async (info, tab) => {
  const tabId = tab?.id;

  if (tabId != null) {
    switch (info.menuItemId) {
      case ActionType.ENCODE_SELECT_LINK:
        const { linkUrl } = info;

        if (linkUrl) {
          tabs.sendMessage(tabId, {
            action: ActionType.ENCODE_SELECT_LINK,
            payload: encode(linkUrl, {
              level: 'H',
              fnc1: 'None',
              mode: 'Auto',
              quietZone: 8,
              moduleSize: 2,
              aimIndicator: 0,
              version: 'Auto',
              charset: 'UTF_8',
              background: '#ffffff',
              foreground: '#000000'
            })
          });
        }
        break;
      case ActionType.DECODE_SELECT_IMAGE:
        const { srcUrl } = info;

        if (srcUrl) {
          const bitmap = await getImageBitmap(srcUrl);

          const decoded = await decode(bitmap, {
            invert: false,
            strict: false
          });

          bitmap.close();

          if (decoded.type === 'ok') {
            const { payload: items } = decoded;

            tabs.sendMessage(tabId, {
              action: ActionType.DECODE_SELECT_IMAGE,
              payload: {
                ...decoded,
                payload: {
                  items,
                  image: srcUrl
                }
              }
            });
          } else {
            tabs.sendMessage(tabId, {
              action: ActionType.DECODE_SELECT_IMAGE,
              payload: decoded
            });
          }
        }
        break;
      case ActionType.ENCODE_SELECTION_TEXT:
        const { frameId } = info;
        const frameIds = frameId ? [frameId] : undefined;

        const selections = await chrome.scripting.executeScript({
          target: {
            tabId,
            frameIds
          },
          func: getSelectionText,
          injectImmediately: true
        });

        const text = selections.reduce((text, { result }) => {
          if (result) {
            text += result;
          }

          return text;
        }, '');

        tabs.sendMessage(tabId, {
          action: ActionType.ENCODE_SELECTION_TEXT,
          payload: encode(text, {
            level: 'H',
            fnc1: 'None',
            mode: 'Auto',
            quietZone: 8,
            moduleSize: 2,
            aimIndicator: 0,
            version: 'Auto',
            charset: 'UTF_8',
            background: '#ffffff',
            foreground: '#000000'
          })
        });
        break;
      case ActionType.DECODE_SELECT_CAPTURE_AREA:
        tabs.sendMessage(tabId, {
          action: ActionType.DECODE_SELECT_CAPTURE_AREA
        });
        break;
      default:
        break;
    }
  }
});

async function resolveMessage(message: any): Promise<any> {
  switch (message.action) {
    case ActionType.DECODE_SELECT_CAPTURE_AREA:
      const url = await tabs.captureVisibleTab({
        format: 'png'
      });

      const { x, y, width, height } = message.rect;

      const bitmap = await getImageBitmap(url, x, y, width, height);

      const decoded = await decode(bitmap, {
        invert: false,
        strict: false
      });

      if (decoded.type === 'ok') {
        const { payload: items } = decoded;
        const image = await bitmapToDataURL(bitmap);

        bitmap.close();

        return {
          ...decoded,
          payload: {
            image,
            items
          }
        };
      }

      bitmap.close();

      return decoded;
    case ActionType.ENCODE_TAB_LINK:
      const { payload } = message;

      return encode(payload.content, payload);
    default:
      break;
  }
}

runtime.onMessage.addListener((message, _sender, sendResponse) => {
  resolveMessage(message)
    .then(sendResponse)
    .catch((error: Error) => {
      console.error(error);
    });

  return true;
});
