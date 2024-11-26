chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['image'],
    id: 'decodeSelectImage',
    title: 'Decode select image'
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'decodeSelectImage') {
    console.log(info, tab);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'capture') {
    const windowId = sender.tab?.windowId;

    if (windowId != null) {
      chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 100 }, url => {
        console.log(url);
      });
    }
  }
});
