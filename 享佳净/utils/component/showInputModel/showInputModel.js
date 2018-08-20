Component({

  // 组件的属性列表
  properties: {
    // 弹窗标题
    title: { // 属性名
      type: String, //String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '提示'
    },
    // input隐性内容
    placeholder: {
      type: String,
      value: '请输入修改参数'
    },
    // input初始参数
    inputText: {
      type: String,
      value: ''
    },
    // 取消按钮文字
    cancelButtonText: {
      type: String,
      value: '取消'
    },
    // 确认按钮文字
    sureButtonText: {
      type: String,
      value: '确定'
    }
  },

  // 私有数据, 组件的初始数据
  data: {
    // 弹窗显示控制
    isShow: false,
    inputText: ''
  },
  // 组件的方法列表
  methods: {

    /* 公有方法 */
    //隐藏弹框
    hide() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //展示弹框
    show() {
      this.setData({
        isShow: !this.data.isShow
      })
    },

    /* 内部私有方法建议以下划线开头   
       triggerEvent 用于触发事件 */
    _cancelEvent() {
      this.triggerEvent("Cancel")
    },
    _sureEvent(e) {
      this.triggerEvent("Sure",this.data.inputText);

    },
    _inputChange(e) {
      this.setData({
        inputText: e.detail.value
      })
    }
  }
})