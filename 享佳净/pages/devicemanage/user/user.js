var util = require('../../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: '',
    loginName: '',
    NormalUserItems: [{
      loginName: '无'
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      deviceInfo: app.globalData.mainDeviceInfo,
      loginName: wx.getStorageSync('userInfo').loginName,
    })
    this.sendQuerySlaveUserrequest()
  },

  // 管理员查询设备用户的接口
  sendQuerySlaveUserrequest: function(devicename) {
    var that = this
    util.request({
      url: "/user/equipment/querySlaveUser",
      data: {
        equipmentUID: that.data.deviceInfo.UID,
        token: wx.getStorageSync('token'),
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          if (result.data.data.length != 0) {
            that.setData({
              NormalUserItems: result.data.data
            })
          }
          util.showToast("获取设备用户成功")
        }
      },
    }, true)
  },
})