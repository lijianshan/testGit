const app = getApp()
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: "",
    region: ["", ""],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    that.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
    that.setData({
      region: that.data.userInfo.userAddress.split("#")
    })
  },
  // 获取用户名
  nameInput: function (e) {
    this.setData({
      ['userInfo.name']: e.detail.value
    })
  },
  // 获取电话号码
  phoneInput: function (e) {
    this.setData({
      ['userInfo.phone']: e.detail.value
    })
  },

  // 选择省市区函数
  changeRegin(e) {
    var buff = e.detail.value
    buff.pop() //删除区,保留省市
    this.setData({
      region: buff,
      ['userInfo.userAddress']: buff.join("#")
    });
  },

  // 获取详细地址
  userAddressDetailsInput: function (e) {
    this.setData({
      ['userInfo.userAddressDetails']: e.detail.value
    })
  },

  //保存
  saveClk:function(){
    var that = this
    that.sendSaveUserInforequest(true)
  },
  // 修改用户信息接口
  sendSaveUserInforequest:function(){
    var that = this
    util.request({
      url: "/user/modifyInfo",
      data: {
        token: wx.getStorageSync('token'),
        name: that.data.userInfo.name,
        phone: that.data.userInfo.phone,
        userAddress: that.data.userInfo.userAddress,
        userAddressDetails: that.data.userInfo.userAddressDetails,
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          util.showToast("修改用户信息成功")
          wx.setStorageSync('userInfo', that.data.userInfo)
        }
      },
    },true)
  }
})