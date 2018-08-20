const app = getApp()
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    slipEditing: {
      items: [],
      startX: 0, //开始坐标
      startY: 0
    },
    userImages: [
      "../../images/user1.png",
      "../../images/user2.png",
      "../../images/user3.png"
    ],
    deviceImages: [
      "../../images/deviceList_device0.png", //未知
      "../../images/deviceList_device1.png", //807
      "../../images/deviceList_device0.png", //壁挂机
      "../../images/deviceList_device1.png", //806
      "../../images/deviceList_device4.png", //817
      "../../images/deviceList_device5.png"  //827
    ],
    aqiTitle: ['差','良','优'],
    getDeviceListInterval: "",
    deviceStateList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    that.sendGetDeviceListrequest(true);

    this.data.getDeviceListInterval = setInterval(function() {
      that.sendGetDeviceListrequest(false);
    }, 20000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(this.data.getDeviceListInterval);
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.getDeviceListInterval);
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    var that = this
    //开始触摸时 重置所有删除
    for (var i = 0; i < that.data.slipEditing.items.length; i++) {
      that.data.slipEditing.items[i] = false
    }
    this.setData({
      ['slipEditing.startX']: e.changedTouches[0].clientX,
      ['slipEditing.startY']: e.changedTouches[0].clientY,
      ['slipEditing.items']: this.data.slipEditing.items
    })
  },
  //滑动事件处理
  touchmove: function(e) {
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      startX = that.data.slipEditing.startX, //开始X坐标
      startY = that.data.slipEditing.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });
    for (var i = 0; i < that.data.slipEditing.items.length; i++) {
      that.data.slipEditing.items[i] = false
      //                     滑动超过30度角                  左滑
      if ((i == index) && (Math.abs(angle) < 30) && (touchMoveX < startX)) {
        that.data.slipEditing.items[i] = true
      }
    }
    that.setData({
      ['slipEditing.items']: that.data.slipEditing.items
    })
  },
  // 计算滑动角度  start 起点坐标 end 终点坐标
  angle: function(start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  // 设备管理
  manageClk: function(e) {
    var that = this
    var clkNum = e.currentTarget.dataset.id
    app.globalData.mainDeviceInfo = that.data.deviceStateList[clkNum]
    var info = {
      line: that.data.deviceStateList[clkNum].line,
      temp: that.data.deviceStateList[clkNum].temp,
      clean: that.data.deviceStateList[clkNum].clean,
    }
    wx.navigateTo({
      url: '../devicemanage/devicemanage?info=' + JSON.stringify(info)
    })
  },
  // 添加设备
  deviceAddClk:function(){
    wx.navigateTo({
      url: '../deviceListAdd/deviceListAdd'
    })
  },
  //
  aboutClk:function(){
    wx.navigateTo({
      url: '../deviceListAbout/deviceListAbout'
    })
  },
  //设备列表页点击
  deviceListClk: function(e) {
    var that = this
    var clkNum = e.currentTarget.dataset.id

    if (that.data.deviceStateList[clkNum].line == "off") {
      util.showToast('设备离线！')
    } else {
      app.globalData.mainDeviceInfo = that.data.deviceStateList[clkNum]
      wx.navigateTo({
        url: '../deviceMain/deviceMain'
      })
    }
  },
  //获取设备列表接口
  sendGetDeviceListrequest: function(isshow) {
    var that = this;
    util.request({
      url: "/user/equipment/list",
      data: {
        token: wx.getStorageSync('token')
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          that.sendGetDeviceListStaterequest(result.data.data, isshow)
        }
      },
    }, isshow)
  },
  // 获取设备列表各设备的状态接口
  sendGetDeviceListStaterequest: function(list, isshow) {
    var that = this
    var UIDList = []

    for (var i = 0; i < list.length; i++) {
      UIDList.push(list[i].equipmentUID)
    }
    util.request({
      url: "/equipment/runState",
      data: {
        token: wx.getStorageSync('token'),
        equipmentUIDs: UIDList
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          that.getDeviceListState(list, result.data.data)
        }
      },
    }, isshow)
  },
  // 根据请求的数据，得到设备列表的状态数据
  getDeviceListState: function(list, runstate) {
    var that = this
    var state = {}
    var buff = []
    var info={}
    for (var i = 0; i < list.length; i++) {
      that.data.slipEditing.items[i] = false

      state.name = list[i].equipmentAlias
      var uidkey = util.uidToUIDKey(list[i].equipmentUID)
      state.modelId = util.uidkeyToDeviceModel(uidkey).id
      state.user = list[i].isSuper == "true" ? 0 : (list[i].isSuper == "false" ? 1 : 2)
      state.UID = list[i].equipmentUID
      state.line = runstate[i].errorCode == 'ERR-1202' ? 'off' : 'on'
      if(state.line=='on'){
        info = that.analysisRunState(util.hexStringToByte(runstate[i].equipmentRunState))
        state.aqi = that.data.aqiTitle[info.air - 1] 
        state.pm25 = info.pm25
        state.fan = info.powerswitch == 0 ? '关' : info.fanspeed
        state.temp = info.temp
        state.clean =info.clean
        state.usedTime = info.devicelife_used
      }else{
        state.aqi = '-'
        state.pm25 = '-'
        state.fan = '-'
        state.temp = 0
        state.clean = 0
      }

      //必须加这个，理由未知
      wx.setStorageSync("test", state)
      buff[i] = wx.getStorageSync("test")
    }
    that.setData({
      deviceStateList: buff,
      ['slipEditing.items']: that.data.slipEditing.items
    })
  },
  //心跳包解析
  analysisRunState: function(runStateBuff) {
    var that = this
    var temp
    var info = {}
    temp = (runStateBuff[46] & 0x40) >> 6 ? ((runStateBuff[46] & 0x3f) + 0.5) : (runStateBuff[46] & 0x3f)
    temp = (runStateBuff[46] & 0x80) >> 7 ? ((runStateBuff[46] & 0x3f) * -1) : (runStateBuff[46] & 0x3f)

    info.powerswitch = runStateBuff[31]
    info.runmode = runStateBuff[32]
    info.fanspeed = runStateBuff[34]
    info.loopmode = runStateBuff[35]
    info.clean = runStateBuff[36]
    info.devicelife_used=(runStateBuff[48] << 8)|runStateBuff[49]
    info.devicelife_all = runStateBuff[53] * 10
    info.smartswitch1 = runStateBuff[50]
    info.smartswitch2 = runStateBuff[51]
    info.smartswitch3 = runStateBuff[52]
    info.offtime_H = runStateBuff[54]
    info.offtime_M = runStateBuff[55]

    info.air = runStateBuff[37]
    info.tvoc = runStateBuff[39]
    info.pm25 = (runStateBuff[40] << 8) | (runStateBuff[41])
    info.co2 = (runStateBuff[42] << 8) | (runStateBuff[43])
    info.temp = temp, 
    info.humidity = runStateBuff[47]

    return info
  },
})