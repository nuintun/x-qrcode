/**
 * @module background
 */

import { decode } from '/js/common/decode';
import { encode } from '/js/common/encode';
import { locate } from '/js/common/locate';
import { ActionType } from '/js/common/action';
import { bitmapToDataURL } from '/js/common/url';
import { getImageBitmap } from '/js/common/image';
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
    console.log(command);

    switch (command) {
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
      case ActionType.ENCODE_SELECTION_TEXT:
        const content = await getSelectionsText(tabId);

        tabs.sendMessage(tabId, {
          action: ActionType.ENCODE_SELECTION_TEXT,
          payload: encode(content, {
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
      case ActionType.DECODE_SELECT_IMAGE:
        const { srcUrl } = info;

        if (srcUrl) {
          const bitmap = await getImageBitmap(srcUrl);
          const decoded = await decode(bitmap);

          if (decoded !== null) {
            const located = await locate(bitmap, decoded);
            const image = located ?? srcUrl;

            tabs.sendMessage(tabId, {
              type: 'ok',
              action: ActionType.DECODE_SELECT_IMAGE,
              payload: {
                image,
                decoded
              }
            });
          } else {
            tabs.sendMessage(tabId, {
              type: 'error',
              action: ActionType.DECODE_SELECT_IMAGE,
              message: i18n.getMessage('decode_error')
            });
          }

          bitmap.close();
        }
        break;
      case ActionType.DECODE_SELECT_CAPTURE_AREA:
        tabs.sendMessage(tabId, {
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
      const [error, url] = encode(payload.content, payload);

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
