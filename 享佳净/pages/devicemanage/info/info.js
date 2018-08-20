
var util = require('../../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo:"",
    infoItem_title: ["型号", "UID", "软件版本", "硬件版本","运行时间"],
    infoItem_value: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      deviceInfo: app.globalData.mainDeviceInfo
    })
    //获得showInputModel组件
    this.modifyEquipmentName = this.selectComponent("#modifyDeviceNameModel")

    this.sendGetDeviceOtherInforequest()

  },
  // 编辑设备名称点击
  modifyNameClk:function(){
    this.modifyEquipmentName.show()
  },
  // 修改设备名称取消
  modifyDeviceNameCancel: function () {
    this.modifyEquipmentName.hide()
  },
  // 修改设备名称确认
  modifyDeviceNameSure(e) {
    var that = this
    that.sendModifyDeviceNamerequest(e.detail)
    this.modifyEquipmentName.hide();
  },
  // 修改设备名称的接口
  sendModifyDeviceNamerequest: function (devicename) {
    var that = this
    util.request({
      url: "/equipment/define",
      data: {
        equipmentUID: that.data.deviceInfo.UID,
        equipmentAlias: devicename,
        token: wx.getStorageSync('token'),
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          app.globalData.mainDeviceInfo.name = devicename
          that.setData({
            deviceInfo: app.globalData.mainDeviceInfo
          })
          util.showToast("设备名称修改成功")
        }
      },
    }, true)
  },
  // 获取设备信息
  sendGetDeviceOtherInforequest: function () {
    var that = this
    util.request({
      url: "/equipment/query",
      data: {
        equipmentUID: that.data.deviceInfo.UID,
        token: wx.getStorageSync('token'),
      },
      success: function (result) {
        if (util.checkError(result.data) == true) {
          var uidkey = util.uidToUIDKey(result.data.data.equipmentUID)
          var modelname = util.uidkeyToDeviceModel(uidkey).name + ' (' + uidkey + ',' + result.data.data.equipmentModel +')' 
          that.setData({
            'infoItem_value[0]': modelname,
            'infoItem_value[1]': result.data.data.equipmentUID,
            'infoItem_value[2]': result.data.data.softwareVersion,
            'infoItem_value[3]': result.data.data.firmwareVersion,
            'infoItem_value[4]': result.data.data.equipmentWorktime,
            'infoItem_value[4]': that.data.deviceInfo.hasOwnProperty("usedTime") ?that.data.deviceInfo.usedTime + "小时":'设备离线无法获取该时间',
          })
          util.showToast("获取设备信息成功")
        }else{
          util.showToast("获取设备信息失败")
          setTimeout(function () { wx.navigateBack() }, 1500);
        }
      },
      fail:function(result){
        setTimeout(function () { wx.navigateBack() }, 1500);
      }
    }, true)
  },
})