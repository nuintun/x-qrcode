import '../css/content.css';

// let TimeUUID; // 计算器标识
// const QRDialog = {
//   frame: {
//     wrap: $()
//   },
//   // 弹窗模板
//   template: [
//     '<div class="qruri-dialog">',
//     '  <div class="qruri-dialog-inner">',
//     '    <a href="javascript:;" class="qruri-dialog-close" title="关闭"></a>',
//     '    <div class="qruri-dialog-content"></div>',
//     '  </div>',
//     '</div>'
//   ].join('')
// };

// /**
//  * 初始化弹窗
//  */
// QRDialog.init = function() {
//   // 初始化弹窗数据
//   QRDialog.frame.wrap = $(QRDialog.template);
//   QRDialog.frame.inner = QRDialog.frame.wrap.find('.qruri-dialog-inner');
//   QRDialog.frame.close = QRDialog.frame.inner.find('.qruri-dialog-close');
//   QRDialog.frame.content = QRDialog.frame.inner.find('.qruri-dialog-content');

//   // 设置关闭按钮图标
//   QRDialog.frame.close.css({
//     backgroundImage: 'url(' + chrome.extension.getURL('images/close.png') + ')'
//   });

//   // 绑定关闭按钮事件
//   QRDialog.frame.close.on('click', function(e) {
//     e.preventDefault();
//     QRDialog.hide();
//   });

//   // 监听动画结束事件
//   QRDialog.frame.inner.on('webkitTransitionEnd', function(e) {
//     e.target === this &&
//       e.originalEvent.propertyName === 'opacity' &&
//       !QRDialog.frame.wrap.hasClass('qruri-dialog-show') &&
//       QRDialog.remove();
//   });

//   // 添加弹窗到DOM树
//   QRDialog.frame.wrap.appendTo(document.body);
// };

// /**
//  * 移除弹窗
//  */
// QRDialog.remove = function() {
//   // 只有当前DOM树有弹窗时才能做移除处理
//   if ($.contains(document.body, QRDialog.frame.wrap[0])) {
//     QRDialog.frame.inner.off('webkitTransitionEnd');
//     QRDialog.frame.close.off('click');
//     QRDialog.frame.wrap.remove();
//   }
// };

// /**
//  * 显示弹窗
//  * @param content
//  */
// QRDialog.show = function(content) {
//   // 移除弹窗
//   QRDialog.remove();

//   // 初始化弹窗
//   QRDialog.init();

//   // 清除计时器
//   clearTimeout(TimeUUID);

//   // 异步添加内容和动画类，否则无动画效果
//   TimeUUID = setTimeout(function() {
//     QRDialog.frame.content.html(content);
//     QRDialog.frame.wrap.addClass('qruri-dialog-show');
//   }, 16);
// };

// /**
//  * 关闭弹窗
//  */
// QRDialog.hide = function() {
//   QRDialog.frame.wrap.removeClass('qruri-dialog-show');
// };

// /**
//  * 监听右键菜单事件
//  */
// chrome.extension.onRequest.addListener(function(response) {
//   if (response.valid) {
//     switch (response.menuItemId) {
//       // 解码图片
//       case 'QRDecode':
//         QRDialog.show('<textarea readonly class="qruri-decode-text">' + response.text + '</textarea>');
//         break;
//       // 编码连接
//       case 'QREncodeLink':
//         QRDialog.show('<img src="' + response.srcUrl + '" alt="QRCode"/>');
//         break;
//       // 编码文本
//       case 'QREncodeSelection':
//         QRDialog.show('<img src="' + response.srcUrl + '" alt="QRCode"/>');
//         break;
//       default:
//         break;
//     }
//   } else {
//     QRDialog.show('<span class="qruri-error-tips">' + response.message + '</span>');
//   }
// });
