var util = require('../../../utils/util.js')
var _wxcharts = require('../../../utils/api/wxcharts/wxcharts.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currtab: 0,
    chartView: {
      width: '',
      height: '',
    },
    swipertab: ['PM2.5', 'CO2', '空气质量'],
    pm25monthnull: false,
    grademonthnull: false,
    weekData: [],
    pm25Month: [{
        name: '优',
        color: "#24c87f",
        data: 1
      },
      {
        name: '良',
        color: "#157cf9",
        data: 1,
      },
      {
        name: '轻度污染',
        color: "#d7fb35",
        data: 1,
      },
      {
        name: '中度污染',
        color: "#fd9025",
        data: 1,
      },
      {
        name: '重度污染',
        color: "#ac401e",
        data: 1,
      },
      {
        name: '严重污染',
        color: "red",
        data: 1,
      }
    ],
    pm25Week: [],
    co2MonthTitle: ['350-450\n(同一般室内环境)', '450-1000\n(空气清新、呼吸顺畅)', '>1000\n(感觉开启浑浊，并开始觉得昏昏欲睡)', '>2000\n(感觉头痛、嗜睡、呆滞、注意力无法集中、恶心)', '>5000\n(可能导致严重缺氧、造成永久性损失、昏迷、甚至死亡)'],
    co2Month: [],
    co2Week: [],
    gradeMonth: [{
        name: '优',
        color: "#24c87f",
        data: 1
      },
      {
        name: '良',
        color: "#d7fb35",
        data: 1,
      },
      {
        name: '差',
        color: "red",
        data: 1,
      }
    ],
    gradeWeek: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var info = JSON.parse(options.info)
    this.getStatisticDataList(info)
    this.getChartStyle()
    // this.graphShow()  //得到得到画布宽高后才能显示，故必须放this.getChartStyle()里面
  },

  //获取统计数据列表
  getStatisticDataList: function(info) {
    var that = this
    var co2Month = []

    for (var i = 0; i < 7; i++) {
      that.data.weekData[i] = info.getDateList[i].substr(5)
    }

    that.data.pm25Month[0].data = parseInt(info.excellentP)
    that.data.pm25Month[1].data = parseInt(info.fineP)
    that.data.pm25Month[2].data = parseInt(info.slightlyP)
    that.data.pm25Month[3].data = parseInt(info.middleP)
    that.data.pm25Month[4].data = parseInt(info.heavyP)
    that.data.pm25Month[5].data = parseInt(info.seriousP)
    var sum = 0
    for (var i = 0; i < 6; i++) {
      sum += that.data.pm25Month[i].data
    }
    if (sum == 0) that.data.pm25monthnull = true

    for (var i = 0; i < 7; i++) {
      if (info.PMList[i] == "")
        that.data.pm25Week[i] = 0
      else
        that.data.pm25Week[i] = parseInt(info.PMList[i])
    }

    co2Month[0] = parseInt(info.freshC)
    co2Month[1] = parseInt(info.normalC)
    co2Month[2] = parseInt(info.turbidC)
    co2Month[3] = parseInt(info.mildC)
    co2Month[4] = parseInt(info.seriousC)
    that.setData({
      co2Month: co2Month
    })

    for (var i = 0; i < 7; i++) {
      if (info.CO2List[i] == "")
        that.data.co2Week[i] = 0
      else
        that.data.co2Week[i] = parseInt(info.CO2List[i])
    }

    that.data.gradeMonth[0].data = parseInt(info.gradeExcellent)
    that.data.gradeMonth[1].data = parseInt(info.gradeFine)
    that.data.gradeMonth[2].data = parseInt(info.gradeBad)
    var sum = 0
    for (var i = 0; i < 3; i++) {
      sum += that.data.gradeMonth[i].data
    }
    if (sum == 0) that.data.grademonthnull = true

    for (var i = 0; i < 7; i++) {
      if (info.airqualityList[i] == "")
        that.data.gradeWeek[i] = 0
      else
        that.data.gradeWeek[i] = parseInt(info.airqualityList[i])
    }
  },

  // 获取canvas节点信息，得到画布的宽高
  getChartStyle: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#chartStyleView').boundingClientRect()
    query.exec(function(res) {
      console.log(res);
      that.data.chartView.width = res[0].width
      that.data.chartView.height = res[0].height
      // 必须在得到得到画布的宽高后才能显示
      that.graphShow()
    })
  },

  // 选项卡切换
  tabSwitch: function(e) {
    var that = this
    if (this.data.currtab === e.target.dataset.current) {
      return false
    } else {
      that.setData({
        currtab: e.target.dataset.current
      })
      that.graphShow()
    }
  },

  //图表显示
  graphShow: function() {
    let that = this
    switch (this.data.currtab) {
      case 0:
        if (that.data.pm25monthnull == true) {
          util.showToast("月统计为空")
        } else {
          that.pm25PieShow()
        }
        that.pm25AreaShow()
        break
      case 1:
        that.co2AreaShow()
        break
      case 2:
        if (that.data.grademonthnull == true) {
          util.showToast("月统计为空")
        } else {
          that.gradePieShow()
        }
        that.gradeBarShow()
        break
    }
  },

  // PM2.5饼图
  pm25PieShow: function() {
    var that = this
    let pie = {
      canvasId: 'pm25PieGraph',
      type: 'pie',
      series: that.data.pm25Month,
      width: that.data.chartView.width,
      height: that.data.chartView.height,
      dataLabel: true
    }
    new _wxcharts(pie)
  },

  // PM2.5区域图
  pm25AreaShow: function() {
    var that = this
    let area = {
      canvasId: 'pm25AreaGraph',
      type: 'area',
      categories: that.data.weekData,
      series: [{
        name: 'PM2.5',
        data: that.data.pm25Week,
      }],
      width: that.data.chartView.width,
      height: that.data.chartView.height,
    }
    new _wxcharts(area)
  },

  // CO2区域图
  co2AreaShow: function() {
    var that = this
    let area = {
      canvasId: 'co2AreaGraph',
      type: 'area',
      categories: that.data.weekData,
      series: [{
        name: 'CO2',
        data: that.data.co2Week,
      }],
      width: that.data.chartView.width,
      height: that.data.chartView.height,
    }
    new _wxcharts(area)
  },

  // 空气等级饼图
  gradePieShow: function() {
    var that = this
    let pie = {
      canvasId: 'gradePieGraph',
      type: 'pie',
      series: that.data.gradeMonth,
      width: that.data.chartView.width,
      height: that.data.chartView.height,
      dataLabel: true
    }
    new _wxcharts(pie)
  },

  // 空气等级柱状图
  gradeBarShow: function() {
    var that = this
    let bar = {
      canvasId: 'gradeBarGraph',
      type: 'column',
      categories: that.data.weekData,
      series: [{
        name: '空气质量(优3 良2 差1)',
        data: that.data.gradeWeek
      }],
      width: that.data.chartView.width,
      height: that.data.chartView.height
    }
    new _wxcharts(bar)
  },


})