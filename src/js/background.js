/**
 * 监听标签更新事件并显示扩展按钮
 */
chrome.tabs.onUpdated.addListener(function (uuid){
    chrome.pageAction.show(uuid);
});

/**
 * 监听标签请求绘制二维码并返回
 */
chrome.extension.onRequest.addListener(function (request, sender, sendResponse){
    if (request.action === 'QREncodeLink') {
        chrome.tabs.getSelected(function (tab){
            QRCode.QREncode({
                text: tab.url,
                moduleSize: 3,
                margin: 2,
                logo: 'images/qrlogo.ico',
                success: function (canvas){
                    sendResponse({
                        valid: true,
                        srcUrl: canvas.toDataURL('image/png')
                    });
                },
                error: function (e){
                    var message = e.errorCode === 2
                        ? '网址长度超过了二维码的最大存储上限，请使用短链接服务生成短链接后重试！'
                        : e.message;

                    sendResponse({
                        valid: false,
                        message: message
                    });
                }
            });
        });
    }
});

/**
 * 添加右键解析二维码菜单
 */
chrome.contextMenus.create({
    id: 'QRDecode',
    title: '解析二维码图片',
    contexts: ['image'],
    onclick: function (data, tab){
        var image = new Image(),
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        image.onload = function (){
            var text;

            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0, image.width, image.height);
            image.onload = null;

            text = QRCode.QRDecode(canvas, function (e){
                chrome.tabs.sendRequest(tab.id, {
                    valid: false,
                    message: e.message,
                    menuItemId: data.menuItemId
                });
            });

            text && chrome.tabs.sendRequest(tab.id, {
                text: text,
                valid: true,
                menuItemId: data.menuItemId
            });
        };

        image.src = data.srcUrl;
    }
});

/**
 * 添加右键编码链接地址
 */
chrome.contextMenus.create({
    id: 'QREncodeLink',
    title: '编码所选链接',
    contexts: ['link'],
    onclick: function (data, tab){
        QRCode.QREncode({
            text: data.linkUrl,
            moduleSize: 3,
            margin: 2,
            logo: 'images/qrlogo.ico',
            success: function (canvas){
                chrome.tabs.sendRequest(tab.id, {
                    valid: true,
                    menuItemId: data.menuItemId,
                    srcUrl: canvas.toDataURL('image/png')
                });
            },
            error: function (e){
                var message = e.errorCode === 2
                    ? '网址长度超过了二维码的最大存储上限，请使用短链接服务生成短链接后重试！'
                    : e.message;

                chrome.tabs.sendRequest(tab.id, {
                    valid: false,
                    message: message,
                    menuItemId: data.menuItemId
                });
            }
        });
    }
});

/**
 * 添加右键编码选中文本
 */
chrome.contextMenus.create({
    id: 'QREncodeSelection',
    title: '编码所选文本',
    contexts: ['selection'],
    onclick: function (data, tab){
        QRCode.QREncode({
            text: data.selectionText,
            moduleSize: 3,
            margin: 2,
            logo: 'images/qrlogo.ico',
            success: function (canvas){
                chrome.tabs.sendRequest(tab.id, {
                    valid: true,
                    menuItemId: data.menuItemId,
                    srcUrl: canvas.toDataURL('image/png')
                });
            },
            error: function (e){
                var message = e.errorCode === 2
                    ? '网址长度超过了二维码的最大存储上限，请使用短链接服务生成短链接后重试！'
                    : e.message;

                chrome.tabs.sendRequest(tab.id, {
                    valid: false,
                    message: message,
                    menuItemId: data.menuItemId
                });
            }
        });
    }
});