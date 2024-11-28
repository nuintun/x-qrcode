const { commands, contextMenus, i18n, runtime, tabs } = chrome;

const enum MenuIds {
  ENCODE_SELECTION_TEXT = 'encode-selection-text',
  DECODE_SELECT_CAPTURE_AREA = 'decode-select-capture-area'
}

type DataURL = [mime: string, encoding: string, data: string];

function getSelectionText(): string | void {
  const selection = document.getSelection();

  if (selection !== null) {
    const selectionText = selection.toString();

    selection.removeAllRanges();

    return selectionText;
  }
}

function parseDataURL(url: string): DataURL {
  const match = url.match(/^data:(.+?)(?:;(.+?))?,(.*)$/i) || [];
  const [, mime = 'text/plain', encoding = 'none', data = ''] = match;

  return [mime, encoding, data];
}

function dataURLToBlob(url: string) {
  const [mime, encoding, data] = parseDataURL(url);

  switch (encoding) {
    case 'none':
      return new Blob([data], { type: mime });
    case 'base64':
      const binary = globalThis.atob(data);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      return new Blob([bytes], { type: mime });
    default:
      throw new Error('unsupported encoding: ' + encoding);
  }
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    // 监听加载完成事件
    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('failed to read Blob as Data URL'));
    };

    // 开始读取 Blob
    reader.readAsDataURL(blob);
  });
}

runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['selection'],
    id: MenuIds.ENCODE_SELECTION_TEXT,
    title: i18n.getMessage('encodeSelectionText')
  });

  contextMenus.create({
    contexts: ['page', 'action'],
    id: MenuIds.DECODE_SELECT_CAPTURE_AREA,
    title: i18n.getMessage('decodeSelectCaptureArea')
  });
});

commands.onCommand.addListener((command, tab) => {
  const tabId = tab?.id;

  switch (command) {
    case MenuIds.DECODE_SELECT_CAPTURE_AREA:
      if (tabId != null) {
        tabs.sendMessage(tabId, {
          type: 'capture'
        });
      }
      break;
  }
});

contextMenus.onClicked.addListener(async (info, tab) => {
  const tabId = tab?.id;

  if (tabId != null) {
    switch (info.menuItemId) {
      case MenuIds.ENCODE_SELECTION_TEXT:
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
      case MenuIds.DECODE_SELECT_CAPTURE_AREA:
        if (tabId != null) {
          tabs.sendMessage(tabId, {
            type: 'capture'
          });
        }
        break;
    }
  }
});

async function resolveMessage(message: any): Promise<any> {
  switch (message.type) {
    case 'selectedArea':
      const { x, y, width, height } = message.rect;
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');

      if (context != null) {
        const screenshot = dataURLToBlob(
          await tabs.captureVisibleTab({
            format: 'png'
          })
        );

        const bitmap = await createImageBitmap(screenshot, x, y, width, height);

        context.drawImage(bitmap, 0, 0);

        const blob = await canvas.convertToBlob();

        return await blobToDataURL(blob);
      }
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
