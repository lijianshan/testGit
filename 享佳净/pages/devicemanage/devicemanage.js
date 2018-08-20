var util = require('../../utils/util.js')
var UDPCom = require('../../utils/api/UDPCom/UDPCom.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    on_off: 'on',
    devicemanageItem1: [
      "设备时钟同步", "温度校准", "周时段设置", "滤芯使用寿命复位", "修改WI-FI信息", "恢复出厂设置",
    ],
    devicemanageItem2: [
      "设备信息", "显示历史统计", "设备二维码", "设备用户", "更新设备新风主机SN码"
    ],
    tempPickerArry: [],
    tempPickerIndex: 152,
    cleanEnble: false,
    deviceInfo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var info = JSON.parse(options.info)

    //离线设备 直接设备管理相关功能屏蔽
    if (info.line == 'off') {
      this.setData({
        on_off: 'off'
      })
    } else {
      // 温度校准相关组件
      this.setData({
        tempPickerIndex: (info.temp + 50) / 0.5
      })
      var tempPicker = []
      for (var i = 0; i <= 200; i++) {
        tempPicker[i] = -50 + 0.5 * i + '°C'
      }
      this.setData({
        tempPickerArry: tempPicker
      })
      this.setData({
        cleanEnble: info.clean ? true : false
      })
    }

    this.setData({
      deviceInfo: app.globalData.mainDeviceInfo
    })
  },

  // 设备管理界面_设备端层级点击
  devicemanageList1Clk: function(e) {
    var that = this
    switch (e.currentTarget.id) {
      case "1":
        wx.showModal({
          title: '确定同步系统时间为设备时间?',
          content: '当前系统时间' + util.formatTime(new Date()),
          success: function(res) {
            if (res.confirm) {
              var times = util.formatTime(new Date(), 1)
              UDPCom.sendUDP_updataTimeData(that.data.deviceInfo.UID, times.year % 100, times.month, times.day, times.hour, times.minute, times.second, {
                failHandler: function(result) {}
              })
            }
          }
        })
        break;
      case "2":
        break;
      case "3":
        wx.navigateTo({
          url: '../devicemanage/Weeks/Weeks'
        })
        break;
      case "4":
        break;
      case "5":
        wx.navigateTo({
          url: '../devicemanage/wifi/wifi'
        })
        break;
      case "6":
        wx.showModal({
          title: '是否确定恢复出厂设置?',
          content: '所有设置恢复出厂状态',
          confirmText: '确定恢复',
          confirmColor: '#FF0000',
          success: function(res) {
            if (res.confirm) {
              UDPCom.sendUDP_FactoryReset(that.data.deviceInfo.UID, {
                failHandler: function(result) {}
              })
              console.log('确定恢复出厂设置')
            }
          }
        })
        break;
      default:
        util.showToast("加速开发中")
        break;
    }
  },
  // 设备管理界面_服务器层级点击
  devicemanageList2Clk: function(e) {
    var that = this
    console.log(e.currentTarget.id);
    switch (e.currentTarget.id) {
      case "1":
        wx.navigateTo({
          url: '../devicemanage/info/info'
        })
        break;
      case "2":
        that.sendStatisticsrequest()
        break;
      case "3":
        wx.showActionSheet({
          itemList: ['标准模式二维码', '家长模式二维码'],
          itemColor: "#545454",
          success: function(res) {
            var sendvalue = {
              id: res.tapIndex,
              uid: that.data.deviceInfo.UID
            }
            var value = JSON.stringify(sendvalue)
            wx.navigateTo({
              url: '../devicemanage/QRCode/QRCode?value=' + value
            })
          },
          fail: function(res) {
            console.log(res.errMsg)
          }
        })
        break;
      case "4":
        wx.navigateTo({
          url: '../devicemanage/user/user'
        })
        break;
      case "5":
        wx.navigateTo({
          url: '../devicemanage/SNCode/SNCode'
        })
        break;
    }
  },
  // 删除设备按键点击
  removeDeviceClk: function() {
    var that = this
    wx.showModal({
      title: '是否删除该设备?',
      content: '删除设备后需要重新添加的！',
      confirmText: '删除设备',
      confirmColor: '#FF0000',
      success: function(res) {
        if (res.confirm) {
          that.sendRemoveDevicerequest()
        }
      }
    })
  },
  // 温度校准
  changeTempClk: function(e) {
    var that = this
    var temp = -50 + 0.5 * e.detail.value
    this.setData({
      tempPickerIndex: e.detail.value
    })
    console.log('选择的温度是' + temp + '°C')
    UDPCom.sendUDP_setTemp(that.data.deviceInfo.UID, temp, {
      failHandler: function(result) {}
    })
  },
  //请清洁标志清除
  CleanClk: function(e) {
    var that = this
    if (this.data.cleanEnble == false) {
      util.showToast("还未到清洁时间无需复位")
      that.setData({
        cleanEnble: false
      })
    } else {
      wx.showModal({
        title: '是否复位滤芯使用寿命?',
        content: '请确认已经更换匹配的新滤芯',
        confirmText: '确定复位',
        confirmColor: '#FF0000',
        success: function(res) {
          if (res.confirm) {
            console.log('清洁复位,携带值为:', e.detail.value)
            that.setData({
              cleanEnble: false
            })
            UDPCom.sendUDP_Clean(that.data.deviceInfo.UID, 0, {
              failHandler: function(result) {
                that.setData({
                  cleanEnble: true
                })
              }
            })
          } else {
            that.setData({
              cleanEnble: true
            })
          }
        }
      })
    }
  },

  // 获取设备参数历史数据的接口
  sendStatisticsrequest: function() {
    var that = this
    util.request({
      url: "/statistics/list",
      data: {
        deviceUid: that.data.deviceInfo.UID,
        token: wx.getStorageSync('token'),
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          var info = JSON.stringify(result.data.data)
          wx.navigateTo({
            url: '../devicemanage/chart/chart?info=' + info
          })
          util.showToast("获取成功")
        }
      },
    }, true)
  },
  // 删除设备接口
  sendRemoveDevicerequest: function() {
    var that = this
    util.request({
      url: "/user/equipment/remove",
      data: {
        equipmentUID: that.data.deviceInfo.UID,
        token: wx.getStorageSync('token'),
      },
      success: function(result) {
        if (util.checkError(result.data) == true) {
          util.showToast("设备删除成功")
          wx.switchTab({
            url: '../deviceList/deviceList'
          })
        }
      },
    }, true)
  },
})