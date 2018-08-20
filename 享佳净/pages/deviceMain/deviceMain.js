const app = getApp()
var util = require('../../utils/util.js');
var UDPCom = require('../../utils/api/UDPCom/UDPCom.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    getDeviceStateInterval: "",
    deviceInfo:'',
    roomAirStateInfo: {
      air: "",
      tvoc: "",
      pm25: "",
      co2: "",
      temp: "",
      humidity: "",
    },
    roomControlInfo: {
      powerswitch: "",
      runmode: "",
      fanspeed: "",
      loopmode: "",
      clean: "",
      smartswitch1: "",
      smartswitch2: "",
      smartswitch3: "",
      devicelife_used: "",
      devicelife_all: "",
      offtime_H: "",
      offtime_M: "",
    },
    airTitle: ["空气很差", "空气一般", "空气很棒"],

    runmodeimages: [
      ["../../images/ssilence.png", "../../images/ssilence_on.png"],
      ["../../images/sjog.png", "../../images/sjog_on.png"],
      ["../../images/sauto.png", "../../images/sauto_on.png"],
      ["../../images/scapacity.png", "../../images/scapacity_on.png"]
    ],
    loopmodeimages: [
      ["../../images/sinner_loop.png", "../../images/sinner_loop_on.png"],
      ["../../images/soutside_loop.png", "../../images/soutside_loop_on.png"]
    ],
    smartswitchimages: [
      ["../../images/ssmartswitch_one.png", "../../images/ssmartswitch_one_on.png"],
      ["../../images/ssmartswitch_two.png", "../../images/ssmartswitch_two_on.png"],
      ["../../images/ssmartswitch_three.png", "../../images/ssmartswitch_three_on.png"],
    ],
    powerSwitchimages: [
      "../../images/mainswitch_close.png", "../../images/mainswitch_open.png"
    ],
    outDoorAirData:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;

    this.setData({
      deviceInfo: app.globalData.mainDeviceInfo
    })

    this.startTap(true)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(this.data.getDeviceStateInterval);
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.getDeviceStateInterval);
  },

  // 20s定时采集设备信息
  startTap: function (start) {
    var that =this
    if(start == true){
      that.sendGetDeviceStaterequest(true);
    }
    that.data.getDeviceStateInterval = setInterval(function () {
      that.sendGetDeviceStaterequest(false);
    }, 20000)
  },
  // 复位定时采集
  restartTap:function(){
    var that = this
    clearInterval(that.data.getDeviceStateInterval);
    that.data.getDeviceStateInterval =''
    that.startTap(false)
  },
  // 发送获取设备的状态接口
  sendGetDeviceStaterequest: function (isshow) {
    var that = this
    util.request({
      url: "/equipment/runState",
      data: {
        token: wx.getStorageSync('token'),
        equipmentUIDs: that.data.deviceInfo.UID
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          var errcode = result.data.data[0].errorCode
          if ((errcode == "ERR-1201") || (errcode == "ERR-1202")) {
            wx.switchTab({
              url: '../deviceList/deviceList'
            })
          } else {
            var buff = util.hexStringToByte(result.data.data[0].equipmentRunState)
            that.analysisRunState(buff)
            that.sendGetRoomOutAirParameterStaterequest(isshow)
          }
        }
      },
    }, isshow)
  },
  //心跳包解析
  analysisRunState: function(runStateBuff) {
    var that = this
    var temp
    temp = (runStateBuff[46] & 0x40) >> 6 ? ((runStateBuff[46] & 0x3f) + 0.5) : (runStateBuff[46] & 0x3f)
    temp = (runStateBuff[46] & 0x80) >> 7 ? ((runStateBuff[46] & 0x3f) * -1) : (runStateBuff[46] & 0x3f)
    that.setData({
      ['roomControlInfo.powerswitch']: runStateBuff[31],
      ['roomControlInfo.runmode']: runStateBuff[32],
      ['roomControlInfo.fanspeed']: runStateBuff[34],
      ['roomControlInfo.loopmode']: runStateBuff[35],
      ['roomControlInfo.clean']: runStateBuff[36],
      ['roomControlInfo.devicelife_used']: parseInt((((runStateBuff[48] << 8) | runStateBuff[49]) / 24)),
      ['roomControlInfo.devicelife_all']: runStateBuff[53] * 10,
      ['roomControlInfo.smartswitch1']: runStateBuff[50],
      ['roomControlInfo.smartswitch2']: runStateBuff[51],
      ['roomControlInfo.smartswitch3']: runStateBuff[52],
      ['roomControlInfo.offtime_H']: runStateBuff[54],
      ['roomControlInfo.offtime_M']: runStateBuff[55],

      ['roomAirStateInfo.air']: runStateBuff[37],
      ['roomAirStateInfo.tvoc']: runStateBuff[39],
      ['roomAirStateInfo.pm25']: (runStateBuff[40] << 8) | (runStateBuff[41]),
      ['roomAirStateInfo.co2']: (runStateBuff[42] << 8) | (runStateBuff[43]),
      ['roomAirStateInfo.temp']: temp, //runStateBuff[46],
      ['roomAirStateInfo.humidity']: runStateBuff[47],
    })
  },
  // 获取设备所在地室外空气状态
  sendGetRoomOutAirParameterStaterequest: function (isshow) {
    var that = this
    util.request({
      url:"/device/outdoors",
      data: {
        token: wx.getStorageSync('token'),
        deviceUid: that.data.deviceInfo.UID
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          that.setData({
            outDoorAirData: result.data.data
          })
        }
      },
    }, isshow)
  },
  //点击查看室外空气质量详情
  outdoorAirClk:function(){
    var that =this
    wx.navigateTo({
      url: '../deviceOutAir/deviceOutAir?outDoorAirData='+JSON.stringify(that.data.outDoorAirData)
    })
  },
  //设备管理按键点击
  deviceManageClk:function(){
    var that =this
    var info={
      line:'on',
      temp: that.data.roomAirStateInfo.temp,
      clean: that.data.roomControlInfo.clean
    }
    wx.navigateTo({
      url: '../devicemanage/devicemanage?info=' + JSON.stringify(info)
    })
  },
  //运行模式选择
  runModeClk: function(e) {
    var that = this
    var clkNum = e.currentTarget.dataset.id

    if (that.data.roomControlInfo.powerswitch == 0) {
      util.showToast("设备关闭，无法控制")
      return
    }

    var lastValue = that.data.roomControlInfo.runmode
    this.restartTap()
    this.setData({
      ['roomControlInfo.runmode']: clkNum + 1,
    })
    UDPCom.sendUDP_runMode(that.data.deviceInfo.UID, that.data.roomControlInfo.runmode, {
      failHandler: function (result) {
        that.setData({
          ['roomControlInfo.runmode']: lastValue,
        })
      }
    }) 
  },
  controlViewMaskClk: function(){
    util.showToast("您为家长查看权限，无法控制设备!")
  },
  //循环模式选择
  loopModeClk: function(e) {
    var that = this
    var clkNum = e.currentTarget.dataset.id
    if (that.data.roomControlInfo.powerswitch == 0) {
      util.showToast("设备关闭，无法控制")
      return
    }

    var lastValue = that.data.roomControlInfo.loopmode
    this.restartTap()
    this.setData({
      ['roomControlInfo.loopmode']: clkNum + 1,
    })
    UDPCom.sendUDP_runLoop(that.data.deviceInfo.UID, that.data.roomControlInfo.loopmode, {
      failHandler: function (result) {
        that.setData({
          ['roomControlInfo.loopmode']: lastValue,
        })
      }
    }) 
  },
  //智能开关1
  smartSwitch1CLk: function() {
    var that = this
    var lastValue = that.data.roomControlInfo.smartswitch1
    this.restartTap()
    this.setData({
      ['roomControlInfo.smartswitch1']: that.data.roomControlInfo.smartswitch1 == 1 ? 0 : 1,
    })
    UDPCom.sendUDP_smartSwitch(that.data.deviceInfo.UID, that.data.roomControlInfo.smartswitch1, that.data.roomControlInfo.smartswitch2, that.data.roomControlInfo.smartswitch3, {
      failHandler: function (result) {
        that.setData({
          ['roomControlInfo.smartswitch1']: lastValue,
        })
      }
    }) 
  },
  //智能开关2
  smartSwitch2CLk: function() {
    var that = this
    var lastValue = that.data.roomControlInfo.smartswitch2
    this.restartTap()
    this.setData({
      ['roomControlInfo.smartswitch2']: that.data.roomControlInfo.smartswitch2 == 1 ? 0 : 1,
    })
    UDPCom.sendUDP_smartSwitch(that.data.deviceInfo.UID, that.data.roomControlInfo.smartswitch1, that.data.roomControlInfo.smartswitch2, that.data.roomControlInfo.smartswitch3, {
      failHandler: function (result) {
        that.setData({
          ['roomControlInfo.smartswitch2']: lastValue,
        })
      }
    }) 
  },
  //智能开关3
  smartSwitch3CLk: function() {
    var that = this
    var lastValue = that.data.roomControlInfo.smartswitch3
    this.restartTap()
    this.setData({
      ['roomControlInfo.smartswitch3']: that.data.roomControlInfo.smartswitch3 == 1 ? 0 : 1,
    })
    UDPCom.sendUDP_smartSwitch(that.data.deviceInfo.UID, that.data.roomControlInfo.smartswitch1, that.data.roomControlInfo.smartswitch2, that.data.roomControlInfo.smartswitch3, {
      failHandler: function (result) {
        that.setData({
          ['roomControlInfo.smartswitch3']: lastValue,
        })
      }
    }) 
  },
  //定时关选择
  offTimeChange: function(e) {
    var that = this
    var buffer = e.detail.value.split(":");
    var lastValueH = parseInt(buffer[0])
    var lastValueM = parseInt(buffer[1])
    this.restartTap()
    this.setData({
      ['roomControlInfo.offtime_H']: parseInt(buffer[0]),
      ['roomControlInfo.offtime_M']: parseInt(buffer[1])
    })
    UDPCom.sendUDP_timeOff(that.data.deviceInfo.UID, that.data.roomControlInfo.offtime_H, that.data.roomControlInfo.offtime_M, {
      failHandler: function (result) {
        that.setData({
          ['roomControlInfo.offtime_H']: lastValueH,
          ['roomControlInfo.offtime_M']: lastValueM,
        })
      }
    }) 
  },
  offtomeViewClk: function() {
    var that = this
    if (that.data.roomControlInfo.powerswitch == 0) {
      util.showToast("设备关闭，无法控制")
    }
  },
  //总开关
  powerClk: function() {
    var that = this
    var lastValue = that.data.roomControlInfo.powerswitch
    this.restartTap()
    this.setData({
      ['roomControlInfo.powerswitch']: that.data.roomControlInfo.powerswitch == 1 ? 0 : 1,
    })
    UDPCom.sendUDP_powerSwitch(that.data.deviceInfo.UID, that.data.roomControlInfo.powerswitch, {
      failHandler: function (result) {
        that.setData({
          ['roomControlInfo.powerswitch']: lastValue,
        })
      }
    })
  },
  //风速控制
  fanspeedClk: function(e) {
    var that = this
    var lastValue = that.data.roomControlInfo.fanspeed
    this.restartTap()
    this.setData({
      ['roomControlInfo.fanspeed']: e.detail.value,
    })
    UDPCom.sendUDP_fanSpeed(that.data.deviceInfo.UID, that.data.roomControlInfo.fanspeed, {
      failHandler: function (result) {
        that.setData({
          ['roomControlInfo.fanspeed']: lastValue,
        })
      }
    }) 
  },
  fanspeedViewClk: function() {
    var that = this
    if (that.data.roomControlInfo.powerswitch == 0) {
      util.showToast("设备关闭，无法控制")
    }
  },
})