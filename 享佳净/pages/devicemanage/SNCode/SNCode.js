var util = require('../../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    SNcodes: [{
      "devSnId": 0,
      "devSn": "无"
    }],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.sendQuerySNrequest()
  },

  // 修改设备SN码
  modifyBtnClk: function(e) {
    var that = this
    console.log(e.currentTarget.id)
    if (that.data.SNcodes[0].devSn == "无") {
      util.showToast("当前无设备SN码，请先添加SN码")
    } else {
      wx.scanCode({
        success: (res) => {
          if (that.checkScancodeText(res.result)) {
            this.senModifySNrequest(e.currentTarget.id,res.result)
          }
        },
        fail: (res) => {
          util.showToast("扫描二维码失败")
        }
      })
    }
  },

  // 添加设备SN码
  addBtnClk: function() {
    var that =this
    wx.scanCode({
      success: (res) => {
        if (that.checkScancodeText(res.result)) {
          that.sendAddSNrequest(res.result)
        }
      },
      fail: (res) => {
        util.showToast("扫描二维码失败")
      }
    })
  },

  // 检测扫描到的二维码的合法性 
  checkScancodeText: function(sncode) {
    if ((sncode.length > 20) && (sncode.substr(0, 2) == "SN") &&
       ((util.checkISLetter(sncode.substr(2, 1))  == 2) ||
       (util.checkISLetter(sncode.substr(2, 1))  == 3)) &&
       ((util.checkISLetter(sncode.substr(20, 1)) == 2) ||      
        (util.checkISLetter(sncode.substr(20, 1)) == 3))&&
       ((util.checkISLetter(sncode.substr(21, 1)) == 2) || 
        (util.checkISLetter(sncode.substr(21, 1)) == 3))) {

      return true
    } else {
      util.showToast("扫描的非设备SN二维码")
      return false
    }
  },

  // 查询设备SN码信息
  sendQuerySNrequest: function() {
    var that = this
    util.request({
      url: "/devSn/querySn",
      data: {
        token: wx.getStorageSync('token'),
        equipmentUID: app.globalData.mainDeviceInfo.UID,
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          that.setData({
            'SNcodes[0]': result.data.data
          })
        }
      },
    }, true)
  },

  // 添加设备SN码信息
  sendAddSNrequest: function(sncode) {
    var that = this
    util.request({
      url: "/devSn/addSn",
      data: {
        token: wx.getStorageSync('token'),
        equipmentUID: app.globalData.mainDeviceInfo.UID,
        sn:sncode
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          that.sendQuerySNrequest()
          util.showToast("添加成功")
        }
      },
    }, true)
  },

  // 修改设备SN码信息
  senModifySNrequest: function(id,sncode) {
    var that = this
    util.request({
      url: "/devSn/editSn",
      data: {
        token: wx.getStorageSync('token'),
        equipmentUID: app.globalData.mainDeviceInfo.UID,
        devSnId: that.data.SNcodes[id].devSnId,
        sn:sncode
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          that.sendQuerySNrequest()
          util.showToast("修改成功")
        }
      },
    }, true)
  },
})