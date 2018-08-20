var util = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ["福建省", "厦门市"],
    yzm: '获取验证码',
    yzmDisabled: false,
    CAPTCHA: "",
    registerInfo: {
      "name": "",
      "phone": "",
      "password": "",
      "email": "",
      "userAddress": "福建省#厦门市",
      "addressDetails": "",
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  // 姓名
  nameInput: function(e) {
    this.setData({
      ['registerInfo.name']: e.detail.value
    })
  },
  // 电话
  phoneInput: function(e) {
    this.setData({
      ['registerInfo.phone']: e.detail.value
    })
  },
  // 密码
  passwordInput: function(e) {
    this.setData({
      ['registerInfo.password']: e.detail.value
    })
  },
  // email
  emailInput: function(e) {
    this.setData({
      ['registerInfo.email']: e.detail.value
    })
  },
  // 选择省市区
  changeRegin(e) {
    var buff = e.detail.value
    buff.pop() //删除区,保留省市
    this.setData({
      region: buff,
      ['registerInfo.userAddress']: buff.join("#")
    });
  },
  //详细地址
  addressDetailsInput: function(e) {
    this.setData({
      ['registerInfo.addressDetails']: e.detail.value
    })
  },
  // 验证码
  CAPTCHAInput: function(e) {
    this.setData({
      CAPTCHA: e.detail.value
    })
  },
  // 获取验证码按键点击
  getYzmClk: function() {
    var that = this;
    if (that.checkInputInformation() == true) {
      that.changeYzm()
      that.sendYZMrequest()
    }
  },
  // 注册按键点击
  registerClk: function () {
    var that = this;
    var length = that.data.CAPTCHA.length

    if (that.checkInputInformation() == false) {
      return
    }
    if(length==0){
      util.showToast("请输入验证码")
      return
    }
    that.sendCheckYZMrequest()
  },

  // 验证码按键逻辑
  changeYzm: function() {
    var that = this;
    var n = 60;

    that.setData({
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
  // 检测输入的信息接口
  checkInputInformation: function() {
    var that = this
    var length = that.data.registerInfo.name.length
    if ((length < 2) || (length > 20)) {
      util.showToast("姓名长度不符合要求")
      return false
    }
    if (util.validatemobile(that.data.registerInfo.phone) == false) {
      return false
    }
    length = that.data.registerInfo.password.length
    if ((length < 6) || (length > 20)) {
      util.showToast("密码长度不符合要求")
      return false
    }

    length = that.data.registerInfo.email.length
    if (length == 0) {
      util.showToast("请输入邮箱")
      return false
    }
    length = that.data.registerInfo.addressDetails.length
    if (length == 0) {
      util.showToast("请输入详细地址")
      return false
    }

    return true
  },
  // 验证码发送请求接口
  sendYZMrequest: function() {
    var that =this
    util.request({
      url: "/user/verificationCode/send",
      data: {
        phone: that.data.registerInfo.phone
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          util.showToast("验证码发送成功")
        }
      },
    },true)
  },
  // 发送验证码校验接口
  sendCheckYZMrequest: function () {
    var that = this
    util.request({
      url: "/user/verificationCode/check",
      data: {
        phone: that.data.registerInfo.phone,
        verificationCode: that.data.CAPTCHA,
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          that.sendRegisterRequest()
        }
        that.sendRegisterRequest()
      },
    },true)
  },
  // 发送注册接口
  sendRegisterRequest: function () {
    var that = this
    util.request({
      url: "/user/register",
      data: {
        name: that.data.registerInfo.name,
        phone: that.data.registerInfo.phone,
        password: that.data.registerInfo.password,
        email: that.data.registerInfo.email,
        userAddress: that.data.registerInfo.userAddress,
        addressDetails: that.data.registerInfo.addressDetails,
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          util.showToast("注册成功")
          wx.navigateTo({
            url: '../loginAccount/loginAccount'
          })
        }
      },
    },true)
  },
})