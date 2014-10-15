var TimeUUID, // 计算器标识
    QRDialog = {
        dialog: $(),
        // 弹窗模板
        template: [
            '<div class="qruri-dialog">',
            '  <div class="qruri-dialog-inner">',
            '    <a href="javascript:;" class="qruri-dialog-close" title="关闭"></a>',
            '    <div class="qruri-dialog-content"></div>',
            '  </div>',
            '</div>'
        ].join('')
    };

/**
 * 初始化弹窗
 */
QRDialog.init = function (){
    // 初始化弹窗数据
    QRDialog.dialog = $(QRDialog.template);
    QRDialog.inner = QRDialog.dialog.find('.qruri-dialog-inner');
    QRDialog.content = QRDialog.dialog.find('.qruri-dialog-content');

    // 绑定关闭按钮事件
    QRDialog.dialog.on('click', '.qruri-dialog-close', function (e){
        e.preventDefault();
        QRDialog.hide();
    });

    // 监听动画结束事件
    QRDialog.inner.on('webkitTransitionEnd', function (e){
        e.originalEvent.propertyName === 'opacity'
        && !QRDialog.dialog.hasClass('qruri-dialog-show')
        && QRDialog.remove();
    });

    // 添加弹窗到DOM树
    QRDialog.dialog.appendTo(document.body);
};

/**
 * 移除弹窗
 */
QRDialog.remove = function (){
    QRDialog.inner.off('webkitTransitionEnd');
    QRDialog.dialog.off('click');
    QRDialog.dialog.remove();
};

/**
 * 显示弹窗
 * @param content
 */
QRDialog.show = function (content){
    // 当前DOM树没有弹窗时初始化
    !$.contains(document.body, QRDialog.dialog[0]) && QRDialog.init();

    // 清除计时器
    clearTimeout(TimeUUID);

    TimeUUID = setTimeout(function (){
        QRDialog.content.html(content);
        QRDialog.dialog.addClass('qruri-dialog-show');
    }, 16);
};

/**
 * 关闭弹窗
 */
QRDialog.hide = function (){
    QRDialog.dialog.removeClass('qruri-dialog-show');
};

/**
 * 监听右键菜单事件
 */
chrome.extension.onRequest.addListener(function (response){
    if (response.valid) {
        switch (response.menuItemId) {
            // 解码图片
            case 'QRDecode':
                QRDialog.show('<textarea class="qruri-decode-text">' + response.text + '</textarea>');
                break;
            // 编码连接
            case 'QREncodeLink':
                QRDialog.show('<img src="' + response.srcUrl + '"/>');
                break;
            // 编码文本
            case 'QREncodeSelection':
                QRDialog.show('<img src="' + response.srcUrl + '"/>');
                break;
            default :
                break;
        }
    } else {
        QRDialog.show('<span class="qruri-error-tips">' + response.message + '</span>');
    }
});