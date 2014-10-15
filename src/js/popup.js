var QRBox = $('#qr-box'), // 二维码显示区域
    ErrorTips = $('#error-tips'); // 错误信息显示区域

/**
 * 显示错误消息
 * @param message
 */
function showError(message){
    QRBox.hide();
    ErrorTips.html(message).show();
}

/**
 * 向背景页请求获取二维码
 */
chrome.extension.sendRequest({
    action: 'QREncodeLink'
}, function (response){
    if (response.valid) {
        QRBox.html('<img src="' + response.srcUrl + '" alt="QRCode"/>')
    } else {
        showError(response.message)
    }
});

/**
 * 禁用弹出页右键
 */
$(document).on('contextmenu', function (e){
    e.preventDefault();
});