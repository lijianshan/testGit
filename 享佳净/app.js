//app.js
App({
  onLaunch: function () {
    // 只有请求后，openSetting才会出现授权界面
    wx.getLocation({
      type: 'wgs84',
      success: function (res) { },
      fail: function (res) { }
    })
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
   
        }
      }
    })
  },
  globalData: {
    webUrl:"https://newwind.dnake-ehs.com/NewWindWeb/DEI/101/api",
    userInfo: null,
    mainDeviceInfo:null
  }
})