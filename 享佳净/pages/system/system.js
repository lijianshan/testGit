var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    getuserinfoEnble:false,
    getuserinfoButtonText:'',
    systemItem: ["用户信息", "关于我们", "使用帮助"],
  },

  onShow: function(options) {
    var that =this
    that.checkUserInfo()

  },
  // 系统界面层级点击
  systemListClk: function(e) {
    switch (e.currentTarget.id){
      case "1":
        wx.navigateTo({
          url: '../system_userInfo/system_userInfo'
        })
      break;
      case "2":
        wx.navigateTo({
          url: '../system_aboutMe/system_aboutMe'
        })
        break;
      case "3":
        wx.navigateTo({
          url: '../system_help/system_help'
        })
        break;
      default:
      util.showToast("加速开发中")
      break;
    }
  },
  // 按退出按钮
  quiteClk: function(e) {
    this.sendLogoutequest();
  },
  // 发送用户退出登陆接口
  sendLogoutequest: function () {
    var that = this
    util.request({
      url: "/user/logout",
      data: {
        token: wx.getStorageSync('token'),
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          util.quitelogin();
        }
      },
    }, true)
  },
  //获取微信登陆相关信息
  getUserInfoClk:function(e){
    var that =this
    console.log(e.detail.userInfo)
    that.checkUserInfo()
  },
  //微信信息授权情况判断
  checkUserInfo:function(){
    var that =this
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          that.setData({
            getuserinfoEnble: true,
            getuserinfoButtonText: "已得到微信授权"
          })
        } else {
          that.setData({
            getuserinfoEnble: true,
            getuserinfoButtonText: "获取微信授权登录信息"
          })
        }
      }
    })
  }
})