const app = getApp()
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyInfo:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that =this
    that.setData({
      companyInfo: wx.getStorageSync("companyInfo")
    })
  },

  /**
   * 生命周期函数--监听页面显示lel
   */
  onShow: function() {

  },
  // 拨打电话
  phoneClk:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.companyInfo.phone,
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
  // 复制官网网址
  copyurlClk:function(){
    wx.setClipboardData({
      data: this.data.companyInfo.oem_url,
      success: function (res) {
        util.showToast('网址成功到黏贴版');
      }
    })
  },
  // 复制地址
  copyaddressClk:function(){
    wx.setClipboardData({
      data: this.data.companyInfo.address,
      success: function (res) {
        util.showToast('地址成功到黏贴版');
      }
    })
  }
})