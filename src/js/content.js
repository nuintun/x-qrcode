var TimeUUID, // 计算器标识
    QRDialog = {
        // 弹窗模板
        template: [
            '<div class="qruri-dialog">',
            '  <div class="qruri-dialog-inner">',
            '    <a href="javascript:;" class="qruri-dialog-close">&#215;</a>',
            '    <div class="qruri-dialog-content"></div>',
            '  </div>',
            '</div>'
        ].join('')
    };

// 初始化弹窗属性
QRDialog.dialog = $(QRDialog.template);
QRDialog.inner = QRDialog.dialog.find('.qruri-dialog-inner');
QRDialog.content = QRDialog.dialog.find('.qruri-dialog-content');

// 监听动画结束事件
QRDialog.inner.on('webkitTransitionEnd', function (e){
    e.originalEvent.propertyName === 'opacity'
    && !QRDialog.dialog.hasClass('qruri-dialog-show')
    && QRDialog.dialog.removeClass('qruri-dialog-visible');
});

// 绑定关闭按钮事件
$(QRDialog.dialog).on('click', '.qruri-dialog-close', function (e){
    e.preventDefault();
    QRDialog.hide();
});

// 显示弹窗
QRDialog.show = function (content){
    !$.contains(document.body, QRDialog.dialog[0])
    && QRDialog.dialog.appendTo(document.body);

    clearTimeout(TimeUUID);

    TimeUUID = setTimeout(function (){
        QRDialog.content.html(content);
        QRDialog.dialog.addClass('qruri-dialog-visible qruri-dialog-show');
    }, 16);
};

// 关闭弹窗
QRDialog.hide = function (){
    QRDialog.dialog.removeClass('qruri-dialog-show');
};

// 监听右键菜单事件
chrome.extension.onRequest.addListener(function (response){
    if (response.valid) {
        switch (response.menuItemId) {
            case 'QRDecode':
                QRDialog.show('<textarea class="qruri-decode-text">' + response.text + '</textarea>');
                break;
            case 'QREncodeLink':
                QRDialog.show('<img src="' + response.srcUrl + '"/>');
                break;
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