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
