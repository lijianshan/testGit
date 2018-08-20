var util = require('../../../utils/util.js')
var UDPCom = require('../../../utils/api/UDPCom/UDPCom.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: '',
    weekDays: ["一", "二", "三", "四", "五", "六", "日", ],
    weektimePicker: [],
    weekIndex: 0,
    weeks: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.weektimePickerInit()

    this.setData({
      deviceInfo: app.globalData.mainDeviceInfo
    })

    this.weeksInit()

  },
  // 星期几切换选择
  weekdaySwitch: function(e) {
    var that = this
    if (this.data.weekIndex != e.target.id) {
      that.setData({
        weekIndex: e.target.id
      })
    }
  },

  //使能点击
  enableClk: function(e) {
    var that=this
    that.data.weeks[that.data.weekIndex].times[e.target.id].enable = e.detail.value
    that.setData({
      weeks: that.data.weeks
    })
  },

  //时间选择
  timeChange: function(e) {
    this.data.weeks[this.data.weekIndex].times[e.target.id].timeH = e.detail.value[0]
    this.data.weeks[this.data.weekIndex].times[e.target.id].timeM = e.detail.value[1] * 10
    this.setData({
      weeks: this.data.weeks
    })
  },

  //风量点击
  fanspeedClk: function(e) {
    this.data.weeks[this.data.weekIndex].times[e.target.id].fanspeed = e.detail.value
    this.setData({
      weeks: this.data.weeks
    })
  },

  //保存设置
  saveClk: function() {
    var that =this
    UDPCom.sendUDP_weeks(that.data.deviceInfo.UID, that.data.weeks, {
      failHandler: function (result) {},
      successHandler: function (result) { util.showToast("周时段设置成功")}
    })
  },

  //时间点选择器参数初始化
  weektimePickerInit: function() {
    var timeH = []
    for (var i = 0; i < 24; i++) {
      timeH[i] = i + "时"
    }
    var timeM = []
    for (var i = 0; i < 6; i++) {
      timeM[i] = i * 10 + "分"
    }
    this.setData({
      weektimePicker: [timeH, timeM]
    })
  },
  // 周时段参数初始化
  weeksInit: function() {
    var that = this
    var time = {
      "enable": false,
      "timeH": 0,
      "timeM": 0,
      "fanspeed": 1
    }
    var times = [time, time, time, time, time, time]
    var weeks = [{
      "times": times
    }, {
      "times": times
    }, {
      "times": times
    }, {
      "times": times
    }, {
      "times": times
    }, {
      "times": times
    }, {
      "times": times
    }]
    //**此处必须用此转换，要不然会有异常，原因未知
    wx.setStorageSync("test", weeks)
    weeks = wx.getStorageSync("test")

    UDPCom.getUDP_weeks(that.data.deviceInfo.UID, {
      failHandler: function (result) {
        util.showToast("获取周时段失败！")
        setTimeout(function () {wx.navigateBack()}, 1500);
      },
      successHandler: function (result) {
        var recDataStr = result.data.data
        if ((recDataStr.substr(0, 6) == 'aa5501') && (recDataStr.substr(14, 8) == '03020175')){
          var weeksDataStr = recDataStr.substr(62, 84 * 2)
          var weeksDataBuff = util.hexStringToByte(weeksDataStr)
          for (var i = 0; i < 42; i++){
            var w = parseInt(i/6)
            var t = parseInt(i%6)
            weeks[w].times[t].enable = weeksDataBuff[2*i]&0x80?true:false
            weeks[w].times[t].timeH = (weeksDataBuff[2*i]>>2)&0x1f
            weeks[w].times[t].timeM = (weeksDataBuff[2*i+1]>>5)*10
            var speed = weeksDataBuff[2*i+1]&0x0f
            if((speed==0)||(speed>7)){
                speed =1;
            }
            weeks[w].times[t].fanspeed = speed
          }
          that.setData({
            weeks: weeks
          })
        }else{
          util.showToast("获取到的周时段数据异常！")
          setTimeout(function () { wx.navigateBack() }, 1500);
        }
      }
    })
  },
})