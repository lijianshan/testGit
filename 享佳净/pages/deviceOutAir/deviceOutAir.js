const app = getApp()
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    AQIspecificationShow: false,
    timer: '',
    circleViewWidth: '',
    circleViewWw:'',
    airData: '',
    airOPtionsList: [0, 1, 2, 3, 4, 5],
    airWeeks: '',
    airOptions: '',
    updataTime: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that =this

    that.getCircleViewStyle()

    that.setData({
      airData: JSON.parse(options.outDoorAirData)
    })

    that.setData({
      airWeeks: that.getAirWeeks(that.data.airData),
      airOptions: that.getAirOptions(that.data.airData),
      updataTime: that.getUpdataTime(that.data.airData.updateTime)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that =this
    // 必须在得到得到画布的宽高后才能显示
    that.showScoreAnimation(that.data.airWeeks[1].value, 500)
    that.setData({
      resultComment: that.data.airData.aqi
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.timer)
  },
  // AQI说明点击
  AQIspecificationClk: function () {
    var that =this
    that.setData({
      AQIspecificationShow: this.data.AQIspecificationShow ? false : true
    })

    if (that.data.AQIspecificationShow == false) {
      // 必须在得到得到画布的宽高后才能显示
      that.showScoreAnimation(that.data.airWeeks[1].value, 500)
      that.setData({
        resultComment: that.data.airData.aqi
      })
    }
  },
  // 获取canvas节点信息，得到画布的宽高
  getCircleViewStyle: function () {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#circleView').boundingClientRect()
    query.exec(function (res) {
      console.log(res);
      var w = res[0].width
      var h = res[0].height
      that.setData({
        circleViewWidth: parseInt(w > h ? h : w),
        circleViewWw: parseInt(w)
      })
    })
  },
  // 显示空气质量指数圆圈
  showScoreAnimation: function (rightItems, totalItems) {
    var that = this;
    var copyRightItems = 0;
    clearInterval(that.data.timer)
    that.setData({
      timer: setInterval(function () {
        copyRightItems++;
        if (copyRightItems == rightItems) {
          clearInterval(that.data.timer)
        } else {
          var circleLineW = 6
          var circleX = that.data.circleViewWidth / 2
          var circleY = that.data.circleViewWidth / 2
          var circleR = (that.data.circleViewWidth - circleLineW) / 2
          // 这部分是灰色底层
          var cxt_arc = wx.createCanvasContext('canvasArc');
          cxt_arc.setLineWidth(circleLineW); //绘线的宽度
          cxt_arc.setStrokeStyle('#d2d2d2'); //绘线的颜色
          cxt_arc.setLineCap('round'); //线条端点样式
          cxt_arc.beginPath(); //开始一个新的路径
          cxt_arc.arc(circleX, circleY, circleR, 0, 2 * Math.PI, false);
          cxt_arc.stroke(); //对当前路径进行描边

          //这部分进度部分
          cxt_arc.setLineWidth(circleLineW);
          cxt_arc.setStrokeStyle('#f70404');
          cxt_arc.setLineCap('round')
          cxt_arc.beginPath(); //开始一个新的路径
          cxt_arc.arc(circleX, circleY, circleR, -Math.PI * 1 / 2, 2 * Math.PI * (copyRightItems / totalItems) - Math.PI * 1 / 2, false);
          cxt_arc.stroke(); //对当前路径进行描边
          cxt_arc.draw();
        }
      }, 20)
    })
  },
  // 获取一周空气质量指数 等级 健康提示
  getAirWeeks: function (airData) {
    var weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六',]
    var air = {
      day: '',
      weekday: '',
      value: '',
      grades: '',
      title: '',
      tips: '',
      imageUrl: ''
    }
    var airWeeks = [air, air, air, air, air, air, air]
    //必须加这个，理由未知
    wx.setStorageSync("test", airWeeks)
    airWeeks = wx.getStorageSync("test")

    airWeeks[0].value = airData.aqiOne
    airWeeks[0].day = airData.dayOne
    airWeeks[1].value = airData.aqiTwo
    airWeeks[1].day = airData.dayTwo
    airWeeks[2].value = airData.aqiThree
    airWeeks[2].day = airData.dayThree
    airWeeks[3].value = airData.aqiFour
    airWeeks[3].day = airData.dayFour
    airWeeks[4].value = airData.aqiFive
    airWeeks[4].day = airData.dayFive
    airWeeks[5].value = airData.aqiSix
    airWeeks[5].day = airData.daySix
    airWeeks[6].value = airData.aqiSeven
    airWeeks[6].day = airData.daySeven

    var buff = []
    for (var i = 0; i < 7; i++) {
      buff = airWeeks[i].day.split(' ')
      if (i == 0) airWeeks[i].weekday = '昨天'
      else if (i == 1) airWeeks[i].weekday = '今天'
      else if (i == 2) airWeeks[i].weekday = '明天'
      else airWeeks[i].weekday = weekday[new Date(buff[0]).getDay()]
      buff = buff[0].split('-')
      buff.shift()
      airWeeks[i].day = buff.join('/')
    }
    for (var i = 0; i < 7; i++) {
      if (airWeeks[i].value <= 50) {
        airWeeks[i].grades = 0
        airWeeks[i].title = '优'
        airWeeks[i].tips = '各类人群可正常活动'
        airWeeks[i].imageUrl = "../../images/aqi1.png"
      } else if ((airWeeks[i].value > 50) && (airWeeks[i].value <= 100)) {
        airWeeks[i].grades = 1
        airWeeks[i].title = '良'
        airWeeks[i].tips = '极少数异常敏感人群应减少户外活动'
        airWeeks[i].imageUrl = "../../images/aqi2.png"
      } else if ((airWeeks[i].value > 100) && (airWeeks[i].value <= 150)) {
        airWeeks[i].grades = 2
        airWeeks[i].title = '轻度污染'
        airWeeks[i].tips = '儿童、老年人及心脏病、呼吸系统疾病者应减少长时间、高强度的户外锻炼'
        airWeeks[i].imageUrl = "../../images/aqi3.png"
      } else if ((airWeeks[i].value > 150) && (airWeeks[i].value <= 200)) {
        airWeeks[i].grades = 3
        airWeeks[i].title = '中度污染'
        airWeeks[i].tips = '儿童、老年人及心脏病、呼吸系统疾病者应减少长时间、高强度的户外锻炼，一般人群适量减少户外运动'
        airWeeks[i].imageUrl = "../../images/aqi4.png"
      } else if ((airWeeks[i].value > 200) && (airWeeks[i].value <= 300)) {
        airWeeks[i].grades = 4
        airWeeks[i].title = '中毒污染'
        airWeeks[i].tips = '老年人和心脏病、肺病患者应停留在室内。停止户外运动，一般人群减少户外运动'
        airWeeks[i].imageUrl = "../../images/aqi5.png"
      } else {
        airWeeks[i].grades = 5
        airWeeks[i].title = '严重污染'
        airWeeks[i].tips = '老年人和病人应留在室内，避免体力小号，一般人群应避免户外活动'
        airWeeks[i].imageUrl = "../../images/aqi6.png"
      }
    }
    // 支持7天，目前只用5天即可
    airWeeks.pop()
    airWeeks.pop()
    return airWeeks
  },
  //获取6大空气质量指标的参数
  getAirOptions: function (airData) {
    var option = {
      name: '',
      value: ''
    }
    var options = [option, option, option, option, option, option]
    //必须加这个，理由未知
    wx.setStorageSync("test", options)
    options = wx.getStorageSync("test")

    options[0].name = 'PM2.5'
    options[0].value = airData.pm25
    options[1].name = 'PM10'
    options[1].value = airData.pm10
    options[2].name = 'SO2'
    options[2].value = airData.so2
    options[3].name = 'NO2'
    options[3].value = airData.no2
    options[4].name = 'O3'
    options[4].value = airData.o3
    options[5].name = 'CO'
    options[5].value = airData.co

    return options
  },
  //更新时间转换格式
  getUpdataTime(timeStr) {
    var buff = []
    var d, t

    buff = timeStr.split(' ')
    buff = buff[0].split('-')
    buff.shift()
    d = buff.join('/')

    buff = timeStr.split(' ')
    buff = buff[1].split(':')
    buff.pop()
    t = buff.join(':')

    return d.concat(" ").concat(t)
  },

})