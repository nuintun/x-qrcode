import '../css/popup.css';

const stage = document.getElementById('stage');
const toast = document.getElementById('toast');

chrome.tabs.getSelected(tab => {
  chrome.extension.sendRequest(
    {
      url: tab.url,
      action: 'GetTabURLQRCode'
    },
    response => {
      if (response.ok) {
        stage.innerHTML = `<img src="${response.src}" alt="QRCode" />`;
      } else {
        toast.innerHTML = response.message;
      }
    }
  );
});

/**
 * 禁用弹出页右键
 */
document.addEventListener('contextmenu', e => e.preventDefault(), false);
