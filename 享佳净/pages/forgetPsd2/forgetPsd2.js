var util = require('../../utils/util.js');
const app = getApp()

Page({

  data: {
    phone:"",
    modiPassword1: "",
    modiPassword2: ""
  },
  onLoad: function (options) {
    this.setData({
       phone: options.phone 
    })
  },

  // 修改密码1输入
  passwordInput: function (e) {
    this.setData({
      modiPassword1: e.detail.value
    })
  },
  // 修改密码2输入
  passwordAgainInput: function (e) {
    this.setData({
      modiPassword2: e.detail.value
    })
  },

  // 完成按钮
  finishClk: function () {
    var that = this;
    if ((that.data.modiPassword1.length == 0)||(that.data.modiPassword2.length == 0)) {
      util.showToast('请输入修改的密码')
    } else if (that.data.modiPassword1 != that.data.modiPassword2){
      util.showToast('2次输入的密码不一致')
    } else {
      that.sendPasswordReset()
    }
  },
  // 发送密码重置接口
  sendPasswordReset:function(){
    var that = this;
    util.request({
      url:"/user/password/reset",
      data: {
        nPassword: that.data.modiPassword1,
        loginName: that.data.phone,
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          util.showToast("密码修改成功")
          wx.navigateTo({
            url: '../loginAccount/loginAccount'
          })
        }
      },
    },true)
  }
})