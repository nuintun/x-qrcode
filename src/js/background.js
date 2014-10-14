/**
 * 监听标签更新事件并显示扩展按钮
 */
chrome.tabs.onUpdated.addListener(function (uuid){
    chrome.pageAction.show(uuid);
});