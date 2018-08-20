var util = require('../../../utils/util.js')
const app = getApp()

// udp桢打包成命令字符串
function getUDPCommandData(command, data) {
  var buffHeader = [0xaa, 0x55]
  var buffSystem = [0x01]
  var buffTaddr = [0x00, 0xff]
  var buffRaddr = [0x01, 0xff]
  var buffCommand = command
  var buffComType = [0x00]
  var buffLength = 13 + data.length
  var buffData = data

  var buff = []
  buff = buff.concat(buffHeader).concat(buffSystem).concat(buffTaddr).concat(buffRaddr).concat(buffCommand).concat(buffComType).concat(buffLength).concat(buffData)

  var checkSum = 0
  for (var i = 0; i < (11 + data.length); i++) {
    checkSum += buff[i]
  }
  var buffCheck = [(checkSum >> 8) & 0x00ff, checkSum & 0x00ff]

  buff = buff.concat(buffCheck)

  console.log("UDP桢:" + util.Bytes2Str(buff))
  return util.Bytes2Str(buff)
}

// 网络请求request控制设备命令
var requestHandler = {
  failHandler: function () { },
  successHandler: function () { },
}
function httpsRequest(uidStr, commandData, requestHandler) {
  wx.showLoading({
    title: "发送中",
    mask: true,
  })
  wx.request({
    //url: app.globalData.webUrl + "/equipment/sendCmd",
    url:"https://newwind.dnake-ehs.com/NewWindWeb/api/equipment/sendCmd",
    data: {
      token: wx.getStorageSync('token'),
      equipmentUID: uidStr,
      cmd: commandData
    },
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      wx.hideLoading();
      if (util.checkError(res.data) == true) {
        util.showToast("操作成功")
        if (requestHandler.hasOwnProperty('successHandler')){
          requestHandler.successHandler(res)  
        }        
      }else{
        // util.showToast("操作失败")
        requestHandler.failHandler(res)
      }
    },
    fail: function (res) {
      wx.hideLoading();
      util.showToast("网络异常，请检查网络:" + res.errMsg)  
      requestHandler.failHandler(res)  
    },
    complete: function () {
      // wx.hideLoading();  //如果在此处隐藏，会导致上面的showToast也被隐藏了
    }
  })
}
// 开关控制 
function sendUDP_powerSwitch(uidStr, powerswitch, requestHandler) {
  var combuff = [0x02, 0x01]
  var data = [powerswitch, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 模式控制
function sendUDP_runMode(uidStr, runMode, requestHandler) {
  var combuff = [0x02, 0x02]
  var data = [runMode<<4, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 风速控制
function sendUDP_fanSpeed(uidStr, fanSpeed, requestHandler) {
  var combuff = [0x02, 0x03]
  var data = [0x00, fanSpeed, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 循环控制
function sendUDP_runLoop(uidStr, runLoop, requestHandler) {
  var combuff = [0x02, 0x04]
  var data = [runLoop, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 请清洁复位
function sendUDP_Clean(uidStr, cleanType, requestHandler) {
  var combuff = [0x02, 0x05]
  var data = [cleanType, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 智能开关总控制
function sendUDP_smartSwitch(uidStr, sm1State, sm2State, sm3State, requestHandler) {
  var combuff = [0x02, 0x06]
  var data = [sm1State, sm2State, sm3State, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 定时关控制
function sendUDP_timeOff(uidStr, timH, timM, requestHandler) {
  var combuff = [0x02, 0x09]
  var data = [timH, timM, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 温度校准
function sendUDP_setTemp(uidStr, temp, requestHandler) {
  var combuff = [0x02, 0x10]
  var calibrationTemp =0
  if (temp < 0) {
    calibrationTemp |=0x80
    temp = -temp
  }
  if (((temp * 10) % 10) >= 5){
    calibrationTemp |=0x40
    temp -=0.5
  }
  calibrationTemp +=temp
  calibrationTemp = parseInt(calibrationTemp)

  var data = [calibrationTemp, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 日期更新
function sendUDP_updataTimeData(uidStr, year, month, day, hour, minute, second, requestHandler) {
  var combuff = [0x02, 0x11]
  var data = [year, month, day, hour, minute, second, 0x00, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 恢复出厂设置
function sendUDP_FactoryReset(uidStr, requestHandler) {
  var combuff = [0x02, 0x12]
  var data = [0x00, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 周时段设置
function sendUDP_weeks(uidStr, weeksObj, requestHandler) {
  var combuff = [0x02, 0x13]
  var data = [0]
  for (var i = 0; i < weeksObj.length; i++)
    for (var j = 0; j < weeksObj[i].times.length; j++){      
      data[i * 12 + j * 2 + 0] |= (weeksObj[i].times[j].enable)?0x80:0
      data[i * 12 + j * 2 + 0] |= (weeksObj[i].times[j].timeH << 2)
      data[i * 12 + j * 2 + 1] |= (weeksObj[i].times[j].timeM/10 << 5)
      data[i * 12 + j * 2 + 1] |=  weeksObj[i].times[j].fanspeed
    }
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// WI-FI设置
function sendUDP_SetWIFI(uidStr,wifinamestr,wifipasswordstr,requestHandler) {
  var str = '#' + wifinamestr + '#' + wifipasswordstr + '#'
  var buff = []
  buff = util.stringToASCIIByte(str)
  if (buff.length < 50) {
    var buff0 = []
    for (var i = 0; i < (50 - buff.length); i++) {
      buff0[i] = 0
    }
  }
  buff = buff.concat(buff0)

  var combuff = [0x02, 0x14]
  var data = buff
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 恢复出厂设置
function sendUDP_Restart(uidStr, requestHandler) {
  var combuff = [0x02, 0x17]
  var data = [0x00, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 获取设备的状态
function getUDP_deviceState(uidStr, requestHandler){
  var combuff = [0x03, 0x01]
  var data = [0x00, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}
// 获取设备的周时段信息
function getUDP_weeks(uidStr, requestHandler) {
  var combuff = [0x03, 0x02]
  var data = [0x00, 0x00, 0x00, 0x00]
  var databuff = []
  databuff = databuff.concat(util.hexStringToByte(uidStr)).concat(data)
  var commandData = []
  commandData = getUDPCommandData(combuff, databuff)
  httpsRequest(uidStr, commandData, requestHandler)
}

module.exports = {
  getUDPCommandData: getUDPCommandData,
  sendUDP_powerSwitch: sendUDP_powerSwitch,
  sendUDP_runMode: sendUDP_runMode,
  sendUDP_fanSpeed: sendUDP_fanSpeed,
  sendUDP_runLoop: sendUDP_runLoop,
  sendUDP_Clean: sendUDP_Clean,
  sendUDP_smartSwitch: sendUDP_smartSwitch,
  sendUDP_timeOff: sendUDP_timeOff,
  sendUDP_setTemp: sendUDP_setTemp,
  sendUDP_updataTimeData: sendUDP_updataTimeData,
  sendUDP_FactoryReset: sendUDP_FactoryReset,
  sendUDP_weeks: sendUDP_weeks,
  sendUDP_SetWIFI: sendUDP_SetWIFI,
  sendUDP_Restart: sendUDP_Restart,
  getUDP_deviceState: getUDP_deviceState,
  getUDP_weeks: getUDP_weeks,
}