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
 * 获取当前标签网址并生成二维码图片
 */
chrome.tabs.getSelected(function (tab){
    QRBox.QREncode({
        text: tab.url,
        moduleSize: 3,
        logo: 'images/qrlogo.ico',
        error: function (e){
            var message = e.errorCode === 2
                ? '网址长度超过了二维码的最大存储上限，请使用短链接服务生成短链接后重试！'
                : e.message;

            showError(message)
        }
    });
});