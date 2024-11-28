/**
 * @module background
 */

import { decode } from '/js/common/decode';
import { encode } from '/js/common/encode';
import { ActionType } from '/js/common/action';
import { getImageBitmap } from '/js/common/image';
import { getSelectionText } from '/js/common/selection';
import { bitmapToDataURL } from '../common/url';

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
          type: 'capture'
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
        console.log(info);
        break;
      case ActionType.DECODE_SELECT_IMAGE:
        const { srcUrl: image } = info;

        if (image) {
          const bitmap = await getImageBitmap(image);

          const decoded = await decode(bitmap, {
            invert: false,
            strict: false
          });

          bitmap.close();

          if (decoded.type === 'ok') {
            const { payload: items } = decoded;

            tabs.sendMessage(tabId, {
              type: ActionType.DECODE_SELECT_IMAGE,
              payload: {
                ...decoded,
                payload: {
                  image,
                  items
                }
              }
            });
          } else {
            tabs.sendMessage(tabId, {
              type: ActionType.DECODE_SELECT_IMAGE,
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

        console.log(text);
        break;
      case ActionType.DECODE_SELECT_CAPTURE_AREA:
        tabs.sendMessage(tabId, {
          type: 'capture'
        });
        break;
      default:
        break;
    }
  }
});

async function resolveMessage(message: any): Promise<any> {
  switch (message.type) {
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
