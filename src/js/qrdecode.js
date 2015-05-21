/**
 * QRDecode
 */
'use strict';

window.QRCode = window.QRCode || {};

(function ($, window, document, undefined){
  var QRCode = window.QRCode;

  /**
   * 二维码解码
   * @param canvas
   * @param error
   * @constructor
   */
  function Decode(canvas, error){
    this.text = this._init(this.getImageData(canvas), error);
  }

  Decode.prototype = {
    _init: function (imageData, error){
      var text = '',
        qr = new QRDecode();

      try {
        text = qr.decodeImageData(imageData, this.width, this.height);
      } catch (e) {
        $.isFunction(error) && error(e);
      }

      return text;
    },
    getImageData: function (canvas){
      var ctx;

      if (canvas.nodeName.toLowerCase() !== 'canvas') {
        canvas = $(canvas).find('canvas').get(0);

        if (!canvas) return null;
      }

      ctx = canvas.getContext('2d');
      this.width = canvas.width;
      this.height = canvas.height;

      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  };

  /**
   * 二维码解码
   * @param canvas
   * @param error
   * @returns {string}
   * @constructor
   */
  QRCode.QRDecode = function (canvas, error){
    return (new Decode(canvas, error)).text;
  };
})(jQuery, window, document);
