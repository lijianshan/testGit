/**
 *
 * 这里重新封装了导航方法，navigate、redirect、switchTab、reLaunch分别对应着微信的导航方法，
 * 与微信提供的API不通过的是，这里参数data里面的path是静态配置，即app.json文件的页面路径；
 * params为链接查询参数；
 * @example
 * navigate({
 *      path:'pages/index/index',
 *      params:{
 *          id:123
 *      }
 * });//跳转到index页面，index页面的options可以读取到id。
 *
 * https://www.jianshu.com/p/ebfe6456cd6d
 */

let CURRENT_ROUTE = "";

/**
 * 封装后的 navigateTo 方法
 * @param {path：静态路径，params: {}}
 */
export function navigateTo(data = {
  path = "",
  params
} = {}) {
  return route(data, "navigateTo")
}

/**
 * 封装后的 redirectTo 方法
 * @param {path：静态路径，params: {}}
 */
export function redirectTo(data = {
  path = "",
  params
} = {}) {
  return route(data, "redirectTo")
}

/**
 * 封装后的 switchTab 方法
 * @param {path：静态路径，params: {}}
 */
export function switchTab(data = {
  path = "",
  params
} = {}) {
  return route(data, "switchTab");
}

/**
 * 封装后的 reLaunch 方法
 * @param {path：静态路径，params: {}}
 */
export function reLaunch(data = {
  path = "",
  params
} = {}) {
  return route(data, "reLaunch");
}

/**
 * 设置上一页面的数据，并返回
 */
export function navigateBack(data = {}) {
  if (data) {
    const length = getCurrentPages().length;
    var prePage = getCurrentPages()[length - 2]
    if (prePage) {
      prePage.setData(data)
    }
  }
  wx.navigateBack()
}


function route(data, method) {
  try {
    const length = getCurrentPages().length;
    const currentRoute = getCurrentPages()[length - 1].route;
    if (currentRoute == CURRENT_ROUTE) {
      //防止在用一个事件下多次导航到同一个页面
      return;
    }
    CURRENT_ROUTE = currentRoute;
    clearCurrent();
    if (data.path == currentRoute) {
      //不能导航到自己
      return;
    }

    const pathIndex = currentRoute.split('/').length;
    const path = joinPath(pathIndex, data.path)
    const url = joinParams(data.params, path)
    const obj = {
      ...data,
      url
    };

    //调用微信的router方法
    wx[method].call(null, obj);

  } catch (e) {
    console.log(`error in router: +${e}`)
  }
}

function joinPath(index, url) {
  let str = ""
  for (let i = 0; i < index - 1; i++) {
    str += "../";
  }
  return str + url;
}

function joinParams(params, url) {

  //没有参数，直接返回url
  if (!params) {
    return url;
  }

  let keys = Object.keys(params);
  let finalUrl = ""

  //参数没有key 返回url
  if (keys.length == 0) {
    return url;

  } else {

    //url没有拼接 ？
    if (url.indexOf("?") === -1) {
      finalUrl = keys.reduce((url, key) => {
        return url + key + "=" + params[key] + "&";
      }, url + "?");
    } else {

      //url以 ？ 号结尾
      if (url.endsWith("?")) {
        finalUrl = keys.reduce((url, key) => {
          return url + key + "=" + params[key] + "&";
        }, url);

      } else {

        //url以 & 结尾
        if (url.endsWith("&")) {
          finalUrl = keys.reduce((url, key) => {
            return url + key + "=" + params[key] + "&";
          }, url);

        } else {

          //直接拼接
          finalUrl = keys.reduce((url, key) => {
            return url + key + "=" + params[key] + "&";
          }, url + "&")
        }
      }
    }
  }

  return finalUrl.endsWith("&") ?
    finalUrl.slice(0, finalUrl.length - 1) :
    finalUrl;
}


function clearCurrent() {
  setTimeout(() => {
    CURRENT_ROUTE = "";
  }, 0);
}