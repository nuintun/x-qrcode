var QRWrap = $('<div style="position: fixed; top: 30px; left: 50%;z-index: 9999; display: none;"/>'),
    QRBox = $('<div style="position: relative; top: 0; left: -50%; padding: 9px; border-radius: 6px; background-color: rgba(0, 0, 0, .7); line-height: 0;"/>');

QRWrap.append(QRBox);
QRWrap.appendTo(document.body);

chrome.extension.onRequest.addListener(function (response){
    if (response.valid) {
        switch (response.menuItemId) {
            case 'QRDecode':
                QRBox.html('<textarea style="width: 500px; height: 300px; font-size: 14px;">' + response.text + '</textarea>');
                QRWrap.show();
                break;
            case 'QREncodeLink':
                QRBox.html('<img src="' + response.srcUrl + '"/>');
                QRWrap.show();
                break;
            case 'QREncodeSelection':
                QRBox.html('<img src="' + response.srcUrl + '"/>');
                QRWrap.show();
                break;
            default :
                break;
        }
    } else {
        QRBox.html('<span style="line-height: 23px; color: #f00; padding: 6px 9px; font-size: 14px;">'
            + response.message + '</span>');
        QRWrap.show();
    }
});