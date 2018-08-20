var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  
  // 扫码添加按键点击
  scancodeClk: function () {
    var that = this
    wx.scanCode({
      success: (res) => {
        var scancodebuff = res.result.split("&")
        if (that.checkScancodeText(scancodebuff)) {
          that.sendAddSlaverequest(scancodebuff)
        }
      },
      fail: (res) => {
        util.showToast("扫描二维码失败")
      }
    })
  },
  // 检测扫描到的二维码的合法性
  checkScancodeText: function (scancodebuff) {
    if ((scancodebuff.length != 5) || (scancodebuff[0] != "DNKAC")) {
      util.showToast("扫描的非设备二维码")
      return false
    }
    return true
  },
  // 添加普通用户
  sendAddSlaverequest: function (scancodebuff) {
    util.request({
      url: "/equipment/addSlave",
      data: {
        token: wx.getStorageSync('token'),
        equipmentUID: scancodebuff[3],
        timestamp: scancodebuff[2],
        isHouseHolder: scancodebuff[1] == "A" ? "false" : "houseHolder"
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          util.showToast("扫码添加设备成功")
          wx.switchTab({
            url: '../deviceList/deviceList'
          })
        }
      },
    }, true)
  }
})