import { Encoder, ErrorCorrectLevel } from '@nuintun/qrcode';

/**
 * 监听标签请求绘制二维码并返回
 */
chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
  if (request.action === 'GetTabURLQRCode') {
    const qrcode = new Encoder();

    qrcode.write(request.url);
    qrcode.setErrorCorrectLevel(ErrorCorrectLevel.M);

    try {
      qrcode.make();

      sendResponse({
        ok: true,
        src: qrcode.toDataURL()
      });
    } catch (error) {
      sendResponse({
        ok: false,
        message: error.message
      });
    }
  }
});

// /**
//  * 添加右键解析二维码菜单
//  */
// chrome.contextMenus.create({
//   id: 'QRDecode',
//   title: '解码所选图片',
//   contexts: ['image'],
//   onclick(data, tab) {
//     Sync.lock('CONTEXTMENUS-' + tab.id, unlock => {
//       const image = new Image();
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');

//       image.onload = () => {
//         canvas.width = image.width;
//         canvas.height = image.height;
//         ctx.drawImage(image, 0, 0, image.width, image.height);

//         let text = QRCode.QRDecode(canvas, () => {
//           chrome.tabs.sendRequest(tab.id, {
//             valid: false,
//             message: '图片解码失败，请选择标准二维码图片进行解码！',
//             menuItemId: data.menuItemId
//           });
//         });

//         text &&
//           chrome.tabs.sendRequest(tab.id, {
//             text: text,
//             valid: true,
//             menuItemId: data.menuItemId
//           });

//         // 解锁
//         unlock();
//       };

//       image.onerror = () => {
//         chrome.tabs.sendRequest(tab.id, {
//           valid: false,
//           message: '图片加载失败，无法获取图片数据！',
//           menuItemId: data.menuItemId
//         });

//         // 解锁
//         unlock();
//       };

//       image.src = data.srcUrl;
//     });
//   }
// });

// /**
//  * 添加右键编码链接地址
//  */
// chrome.contextMenus.create({
//   id: 'QREncodeLink',
//   title: '编码所选链接',
//   contexts: ['link'],
//   onclick(data, tab) {
//     Sync.lock('CONTEXTMENUS-' + tab.id, unlock => {
//       QRCode.QREncode({
//         text: data.linkUrl,
//         moduleSize: 3,
//         margin: 2,
//         logo: 'images/qrlogo.ico',
//         success(canvas) {
//           chrome.tabs.sendRequest(tab.id, {
//             valid: true,
//             menuItemId: data.menuItemId,
//             srcUrl: canvas.toDataURL('image/png')
//           });

//           // 解锁
//           unlock();
//         },
//         error(e) {
//           var message = e.errorCode === 2 ? '网址长度超过了二维码的最大存储上限！' : '编码错误，请刷新重试！';

//           chrome.tabs.sendRequest(tab.id, {
//             valid: false,
//             message: message,
//             menuItemId: data.menuItemId
//           });

//           // 解锁
//           unlock();
//         }
//       });
//     });
//   }
// });

// /**
//  * 添加右键编码选中文本
//  */
// chrome.contextMenus.create({
//   id: 'QREncodeSelection',
//   title: '编码所选文本',
//   contexts: ['selection'],
//   onclick(data, tab) {
//     Sync.lock('CONTEXTMENUS-' + tab.id, unlock => {
//       QRCode.QREncode({
//         text: data.selectionText,
//         moduleSize: 3,
//         margin: 2,
//         logo: 'images/qrlogo.ico',
//         success(canvas) {
//           chrome.tabs.sendRequest(tab.id, {
//             valid: true,
//             menuItemId: data.menuItemId,
//             srcUrl: canvas.toDataURL('image/png')
//           });

//           // 解锁
//           unlock();
//         },
//         error(e) {
//           const message = e.errorCode === 2 ? '文本长度超过了二维码的最大存储上限！' : '编码错误，请刷新重试！';

//           chrome.tabs.sendRequest(tab.id, {
//             valid: false,
//             message: message,
//             menuItemId: data.menuItemId
//           });

//           // 解锁
//           unlock();
//         }
//       });
//     });
//   }
// });
