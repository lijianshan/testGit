const app = getApp()
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "",
    password: "",
    companyInfo: {
      "phone": "400-0670-168",
      "oem_url": "http://www.dnake-ehs.com",
      "address": "厦门市火炬高新区创新路2号",
      "links": "",
      "portrait_file_name": ""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 已经登陆状态的话，直接跳转到设备列表界面
    var islogin = wx.getStorageSync('islogin')
    if (islogin == "yes") {
      wx.switchTab({
        url: '../deviceList/deviceList'
      })
    }else{
      var userInfo = wx.getStorageSync('userInfo')
      this.setData({
        phone: userInfo.loginName
      })
    }
  },

  // 获取输入账号
  phoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 获取输入密码
  passwordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },
  // 忘记密码
  forgetPsdClk: function() {
    wx.navigateTo({
      url: '../forgetPsd1/forgetPsd1'
    })
  },
  // 注册
  registerClk: function() {
    wx.navigateTo({
      url: '../register/register'
    })
  },

  // 点击登录
  loginClk: function() {
    var that = this
    if (that.data.phone.length == 0 || that.data.password.length == 0) {
      util.showToast("用户名和密码不能为空")
    } else {
      that.checkLoginInfo()
    }
  },
  // 登陆核对接口
  checkLoginInfo: function() {
    var that = this;

    util.request({
      url: "/user/auth",
      data: {
        loginName: that.data.phone,
        password: that.data.password,
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          wx.setStorageSync('userInfo', result.data.data.userInfo)
          wx.setStorageSync('token', result.data.data.token)
          wx.setStorageSync('islogin', "yes")
          that.getCompanyInformation()
        }
      },
    },true)
  },
  // 获取公司信息接口
  getCompanyInformation: function() {
    var that = this
    util.request({
      url: "/oem/list",
      data: {
        token: wx.getStorageSync('token'),
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          wx.setStorageSync('companyInfo', result.data.data[0])
        }
        wx.switchTab({
          url: '../deviceList/deviceList'
        })
      },
      fail: function(result) {
        wx.switchTab({
          url: '../deviceList/deviceList'
        })
      }
    }, true)
  }
})