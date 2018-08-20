var util = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    yzm: '获取验证码',
    yzmDisabled: false,
    phone: "",
    CAPTCHA: "",
  },

  // 电话输入框获取
  phoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 验证码输入框获取
  CAPTCHAInput: function(e) {
    this.setData({
      CAPTCHA: e.detail.value
    })
  },

  // 获取验证码
  getYzmClk: function() {
    var that = this;
    if (util.validatemobile(that.data.phone) == true) {
      that.sendYZMrequest()
      that.changeYzm()
    }
  },
  // 验证码按键逻辑
  changeYzm: function() {
    var that = this;
    var n = 60;

    that.setData({
      //禁用button
      yzmDisabled: true,
      yzm: n,
    })

    var yzmInterval = setInterval(function() {
      if (that.data.yzm <= 0) {
        that.setData({
          yzm: '获取验证码',
          yzmDisabled: false,
        })
        clearInterval(yzmInterval);
      } else {
        n = n - 1;
        that.setData({
          yzm: n,
        })
      }
    }, 1000)
  },

  // 下一步按键点击
  nextClk: function() {
    var that = this;
    if (that.data.CAPTCHA.length == 0) {
      util.showToast("请输入验证码")
    } else {
      that.sendCheckYZMrequest()
    }
  },
  // 验证码发送请求接口
  sendYZMrequest: function () {
    var that = this
    util.request({
      url: "/user/verificationCode/send",
      data: {
        phone: that.data.phone
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          util.showToast("验证码发送成功")
        }
      },
    },true)
  },
  // 发送验证码校验接口
  sendCheckYZMrequest:function(){
    var that =this
    util.request({
      url: "/user/verificationCode/check",
      data: {
        phone: that.data.phone,
        verificationCode: that.data.CAPTCHA,
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          wx.navigateTo({
            url: '../forgetPsd2/forgetPsd2?phone=' + that.data.phone
          })
        }
      },
    },true)
  }
})