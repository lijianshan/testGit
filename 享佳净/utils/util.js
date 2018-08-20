const app = getApp()
import {
  reLaunch,
  switchTab
} from "../utils/api/router/router.js"

//获取系统时间
function formatTime(date, style) {
  var dataTime = {}
  dataTime.year = date.getFullYear()
  dataTime.month = date.getMonth() + 1
  dataTime.day = date.getDate()

  dataTime.hour = date.getHours()
  dataTime.minute = date.getMinutes()
  dataTime.second = date.getSeconds()
  if (style == 1) {
    return dataTime
  } else {
    return [dataTime.year, dataTime.month, dataTime.day].join('/') + ' ' + [dataTime.hour, dataTime.minute, dataTime.second].join(':')
  }

}

// 显示Toast文字
function showToast(text) {
  wx.showToast({
    title: text,
    icon: 'none',
    duration: 1500
  })
}

// 将UID字符串提取出设备的秘钥
function uidToUIDKey(uidStr) {
  var uidBuff = hexStringToByte(uidStr)

  var oneBuff = [],
    zeroBuff = [],
    oneCount = 0,
    zeroCount = 0
  for (var i = 0; i < 2; i++)
    for (var j = 0; j < 8; j++) {
      if ((uidBuff[i] >> (7 - j)) & 0x01) {
        oneBuff[oneCount] = i * 8 + j
        oneCount++
      } else {
        zeroBuff[zeroCount] = i * 8 + j
        zeroCount++
      }
    }

  var keyBuff = []
  for (var i = 0; i < 5; i++) {
    if (oneCount >= 5) keyBuff[i] = uidBuff[oneBuff[i] + 2]
    else keyBuff[i] = uidBuff[zeroBuff[i] + 2]
  }

  var strBuff1 = keyBuff.slice(0, 3)
  var strBuff2 = keyBuff.slice(3)

  var chkBuff2 = uidBuff.slice(0, 2)
  var chkBuff1 = uidBuff.slice(17)

  strBuff1[0] ^= chkBuff1[0]
  strBuff1[1] ^= chkBuff1[1]
  strBuff1[2] ^= chkBuff1[2]
  strBuff2[0] ^= chkBuff2[0]
  strBuff2[1] ^= chkBuff2[1]

  keyBuff = strBuff1.concat(strBuff2)

  var keyStr = ''
  for (var i = 0; i < 5; i++) {
    keyStr = keyStr.concat(String.fromCharCode(keyBuff[i]))
  }

  return keyStr
}
// 根据设备秘钥得出设备的类型名称
function uidkeyToDeviceModel(uidkey) {
  var unknownModel = {
    'uidkey': 'unknown',
    'name': '未知设备',
    'id': 0
  }
  var devicemodel = [{
      'uidkey': 'DNKAA',
      'name': '807控制器',
      'id':1
    },
    {
      'uidkey': 'DNKAB',
      'name': '壁挂机',
      'id': 2
    },
    {
      'uidkey': 'DNKAC',
      'name': '806控制器',
      'id': 3
    },
    {
      'uidkey': 'DNKAL',
      'name': '817控制器',
      'id': 4
    },
    {
      'uidkey': 'DNKAO',
      'name': '827控制器',
      'id': 5
    },
  ]
  for (var i = 0; i < devicemodel.length;i++){
    if (uidkey == devicemodel[i].uidkey ) 
      return devicemodel[i]
  }
  
  return unknownModel
}
// 判断字符类型 返回类型 0未知 1数字 2小写字母 3大写字母
function checkISLetter(str) {
  var regLowerCase = new RegExp('[a-z]', 'g'); //判断用户输入的是否为小写字母
  var regCapitalLetter = new RegExp('[A-Z]', 'g'); //判断用户输入的是否为大写字母
  var regNum = new RegExp('[0-9]', 'g'); //判断用户输入的是否为数字
  var rsLowerCase = regLowerCase.exec(str);
  var rsCapitalLetter = regCapitalLetter.exec(str);
  var rsNum = regNum.exec(str);
  if (rsNum) {
    // console.log('数字')
    return 1
  } else if (rsLowerCase) {
    // console.log('小写字母')
    return 2
  } else if (rsCapitalLetter) {
    // console.log('大写字母')
    return 3
  } else {
    // console.log('未知')
    return 0
  }
}
// 输入的手机号码格式判断
function validatemobile(mobile) {
  if (mobile.length == 0) {
    this.showToast("请输入手机号！")
    return false;
  }
  if (mobile.length != 11) {
    this.showToast("手机号长度有误！")
    return false;
  }
  var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
  if (!myreg.test(mobile)) {
    this.showToast("手机号有误！")
    return false;
  }
  return true;
}
// 退出登陆状态
function quitelogin() {
  wx.setStorageSync('islogin', "no")
  reLaunch({
    path: "pages/loginAccount/loginAccount",
  })
}
// 判断是否返回错误
function checkError(data) {

  if (!data.hasOwnProperty('errorCode')) {
    wx.showToast({
      title: data,
      icon: 'none',
      duration: 3000
    })
    return false
  } else if (data.errorCode != null) {
    wx.showToast({
      title: data.errorMsg,
      icon: 'none',
      duration: 3000
    })
    //token过期，返回登陆页面
    if (data.errorCode == "ERR-9907") {
      this.quitelogin();
      // 设备不存在或是设备离线，返回列表页面重新刷新
    } else if ((data.errorCode == "ERR-1201") || (data.errorCode == "ERR-1202")) {
      switchTab({
        path: "pages/deviceList/deviceList",
      })
    }
    return false
  }
  return true
}

//把16进制字符串转换成字节数组
function hexStringToByte(String) {
  var len = (String.length / 2);
  var achar = [];
  var result = [];

  for (var i = 0; i < len; i++) {
    var pos = i * 2;
    achar[i] = String.substring(pos, pos + 2)
    result[i] = parseInt(achar[i], 16);
  }
  // console.log("achar" + achar);
  return result;
}
//把字节数组转换成16进制字符串
function Bytes2Str(arr) {
  var str = "";
  for (var i = 0; i < arr.length; i++) {
    var tmp = arr[i].toString(16);
    if (tmp.length == 1) {
      tmp = "0" + tmp;
    }
    str += tmp;
  }
  return str;
}
//把字符串转成ASCII数组
function stringToASCIIByte(str) {
  var buff = []
  for (var i = 0; i < str.length; i++) {
    buff[i] = str.charAt(i).charCodeAt()
  }
  return buff
}
// 网络请求request
var requestHandler = {
  url: '',
  data: {},
  success: function(res) {},
  fail: function() {},
  complete: function() {}
}

function request(requestHandler, isshow) {
  var data = requestHandler.data;
  var url = requestHandler.url;
  if (isshow == true) {
    wx.showLoading({
      title: "加载中",
      mask: true,
    })
  }
  wx.request({
    url: app.globalData.webUrl + url,
    data: data,
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: function(res) {
      wx.hideLoading();
      requestHandler.success(res)
    },
    fail: function(res) {
      wx.hideLoading();
      showToast("网络异常，请检查网络")
      if (requestHandler.hasOwnProperty('fail')) {
        requestHandler.fail(res)
      }
    },
    complete: function() {
      // wx.hideLoading();  //如果在此处隐藏，会导致上面的showToast也被隐藏了
    }
  })
}

module.exports = {
  formatTime: formatTime,
  uidToUIDKey: uidToUIDKey,
  uidkeyToDeviceModel: uidkeyToDeviceModel,
  validatemobile: validatemobile,
  checkISLetter: checkISLetter,
  quitelogin: quitelogin,
  checkError: checkError,
  hexStringToByte: hexStringToByte,
  Bytes2Str: Bytes2Str,
  stringToASCIIByte: stringToASCIIByte,
  showToast: showToast,
  request: request
}