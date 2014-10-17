/**
 * 获取初始化标签并显示pageAction按钮
 */
chrome.tabs.getSelected(function (tab){
    chrome.pageAction.show(tab.id);
});

/**
 * 监听标签的选择变更事件并显示pageAction按钮
 */
chrome.tabs.onSelectionChanged.addListener(function (uuid){
    chrome.pageAction.show(uuid);
});

/**
 * 监听标签的状态更新事件并显示pageAction按钮
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
                        ? '网址长度超过了二维码的最大存储上限！'
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
    title: '解码所选图片',
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

            text = QRCode.QRDecode(canvas, function (){
                chrome.tabs.sendRequest(tab.id, {
                    valid: false,
                    message: '图片解码失败，请选择标准二维码图片进行解码！',
                    menuItemId: data.menuItemId
                });
            });

            text && chrome.tabs.sendRequest(tab.id, {
                text: text,
                valid: true,
                menuItemId: data.menuItemId
            });
        };

        image.onerror = function (){
            chrome.tabs.sendRequest(tab.id, {
                valid: false,
                message: '图片加载失败，无法获取图片数据！',
                menuItemId: data.menuItemId
            });

            image.onerror = null;
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
                    ? '网址长度超过了二维码的最大存储上限！'
                    : '编码错误，请刷新重试！';

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
                    ? '文本长度超过了二维码的最大存储上限！'
                    : '编码错误，请刷新重试！';

                chrome.tabs.sendRequest(tab.id, {
                    valid: false,
                    message: message,
                    menuItemId: data.menuItemId
                });
            }
        });
    }
});