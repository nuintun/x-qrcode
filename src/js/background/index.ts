/**
 * @module background
 */

import { decode } from '/js/common/decode';
import { encode } from '/js/common/encode';
import { locate } from '/js/common/locate';
import { ActionType } from '/js/common/action';
import { bitmapToDataURL } from '/js/common/url';
import { getImageBitmap } from '/js/common/image';
import { sendResponse } from '/js/common/message';
import { getSelectionsText } from '/js/common/selection';

const { commands, contextMenus, i18n, runtime, tabs } = chrome;

runtime.onInstalled.addListener(() => {
  const { runtime } = chrome;
  const manifest = runtime.getManifest();
  const matches = manifest.host_permissions;

  contextMenus.create({
    contexts: ['link'],
    documentUrlPatterns: matches,
    id: ActionType.ENCODE_SELECT_LINK,
    title: i18n.getMessage(ActionType.ENCODE_SELECT_LINK)
  });

  contextMenus.create({
    contexts: ['image'],
    documentUrlPatterns: matches,
    id: ActionType.DECODE_SELECT_IMAGE,
    title: i18n.getMessage(ActionType.DECODE_SELECT_IMAGE)
  });

  contextMenus.create({
    contexts: ['selection'],
    documentUrlPatterns: matches,
    id: ActionType.ENCODE_SELECTION_TEXT,
    title: i18n.getMessage(ActionType.ENCODE_SELECTION_TEXT)
  });

  contextMenus.create({
    contexts: ['page'],
    documentUrlPatterns: matches,
    id: ActionType.DECODE_SELECT_CAPTURE_AREA,
    title: i18n.getMessage(ActionType.DECODE_SELECT_CAPTURE_AREA)
  });

  contextMenus.create({
    contexts: ['action'],
    id: ActionType.OPEN_ADVANCED_TOOLBOX,
    title: i18n.getMessage(ActionType.OPEN_ADVANCED_TOOLBOX)
  });
});

commands.onCommand.addListener((command, tab) => {
  const tabId = tab?.id;

  if (tabId != null) {
    switch (command) {
      case ActionType.DECODE_SELECT_CAPTURE_AREA:
        sendResponse(tabId, {
          action: ActionType.DECODE_SELECT_CAPTURE_AREA
        });
        break;
      default:
        break;
    }
  }
});

contextMenus.onClicked.addListener(async (info, tab) => {
  const tabId = tab?.id;

  if (tabId != null) {
    switch (info.menuItemId) {
      case ActionType.ENCODE_SELECT_LINK:
        const { linkUrl } = info;

        if (linkUrl) {
          sendResponse(tabId, {
            payload: encode(linkUrl),
            action: ActionType.ENCODE_SELECT_LINK
          });
        }
        break;
      case ActionType.ENCODE_SELECTION_TEXT:
        sendResponse(tabId, {
          action: ActionType.ENCODE_SELECTION_TEXT,
          payload: encode(await getSelectionsText(tabId))
        });
        break;
      case ActionType.DECODE_SELECT_IMAGE:
        const { srcUrl } = info;

        if (srcUrl) {
          const bitmap = await getImageBitmap(srcUrl);
          const decoded = await decode(bitmap);

          if (decoded !== null) {
            const located = await locate(bitmap, decoded);
            const image = located ?? srcUrl;

            sendResponse(tabId, {
              type: 'ok',
              payload: {
                image,
                decoded
              },
              action: ActionType.DECODE_SELECT_IMAGE
            });
          } else {
            sendResponse(tabId, {
              type: 'error',
              action: ActionType.DECODE_SELECT_IMAGE,
              message: i18n.getMessage('decode_error')
            });
          }

          bitmap.close();
        }
        break;
      case ActionType.DECODE_SELECT_CAPTURE_AREA:
        sendResponse(tabId, {
          action: ActionType.DECODE_SELECT_CAPTURE_AREA
        });
        break;
      case ActionType.OPEN_ADVANCED_TOOLBOX:
        tabs.create({
          url: 'https://nuintun.github.io/qrcode/packages/examples/app/index.html'
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
      const { x, y, width, height } = message.rect;
      const screenshot = await tabs.captureVisibleTab({
        format: 'png'
      });
      const bitmap = await getImageBitmap(screenshot, x, y, width, height);
      const decoded = await decode(bitmap);

      if (decoded !== null) {
        const located = await locate(bitmap, decoded);
        const image = located ?? (await bitmapToDataURL(bitmap));

        bitmap.close();

        return {
          type: 'ok',
          payload: {
            image,
            decoded
          }
        };
      }

      bitmap.close();

      return {
        type: 'error',
        message: i18n.getMessage('decode_error')
      };
    case ActionType.ENCODE_TAB_LINK:
      const { payload } = message;
      const [error, url] = encode(payload);

      if (error !== null) {
        return {
          type: 'error',
          message: i18n.getMessage('encode_error')
        };
      }

      return {
        type: 'ok',
        payload: url
      };
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
