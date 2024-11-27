const { contextMenus, runtime, tabs } = chrome;

type DataURL = [mime: string, encoding: string, data: string];

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
  contextMenus.create({
    contexts: ['all'],
    id: 'decodeSelectArea',
    title: '解码所选截图区域(Ctrl+Alt+A)'
  });
});

contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'decodeSelectArea') {
    const tabId = tab?.id;

    if (tabId != null) {
      tabs.sendMessage(tabId, {
        type: 'capture'
      });
    }
  }
});

runtime.onMessage.addListener(async (message, { tab }) => {
  if (tab) {
    const { id, windowId } = tab;

    if (id != null && windowId != null) {
      switch (message.type) {
        case 'selectedArea':
          const { x, y, width, height } = message.rect;
          const canvas = new OffscreenCanvas(width, height);
          const context = canvas.getContext('2d');

          if (context != null) {
            const screenshot = dataURLToBlob(
              await tabs.captureVisibleTab(windowId, {
                format: 'png'
              })
            );

            const bitmap = await createImageBitmap(screenshot, x, y, width, height);

            context.drawImage(bitmap, 0, 0);

            const blob = await canvas.convertToBlob();

            await tabs.sendMessage(id, {
              type: 'capturedArea',
              url: await blobToDataURL(blob)
            });
          }
      }
    }
  }
});
