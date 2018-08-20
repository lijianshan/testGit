var QR = require("../../../utils/api/qrcode/qrcode.js")

Page({
  data: {
    qrcodeImagePath: '',
    qrcodeSize:500,
    optionx:''
  },

  onLoad: function(options) {
    var value = JSON.parse(options.value)
    var deviceStr = this.getDeviceString(value.id, value.uid)
    this.createQrCode(deviceStr, "mycanvas")
  },

  //点击图片进行预览，长按保存分享图片
  previewImg: function(e) {
    var img = this.data.qrcodeImagePath
    console.log(img)
    wx.previewImage({
      current: img,
      urls: [img]
    })
  },

  // 创建二维码图片, 输出的图片地址
  createQrCode: function (str, canvasId) {
    //设置画布大小
    var size = this.setCanvasSize()
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(str, canvasId, size.w, size.h)
    setTimeout(() => {
      this.canvasToTempImage(canvasId)
    }, 200);
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var that = this
    var size = {}
    var res = wx.getSystemInfoSync();
    //不同屏幕下canvas的适配比例；设计稿是750宽
    var scale = 750 / this.data.qrcodeSize
    size.w = res.windowWidth / scale;
    //canvas画布为正方形
    size.h = size.w
    return size
  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function (canvasId) {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          qrcodeImagePath: tempFilePath,
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  // 得到设备二维码字符串
  getDeviceString(mode, uid) {
    var strbuff = ['DNKAC', '', '', '', 'ABCD']
    strbuff[1] = mode == 0 ? "A" : "B"
    strbuff[2] = Date.parse(new Date())
    strbuff[3] = uid
    var str = strbuff.join("&")
    return str
  },
})