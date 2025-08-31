const axios = require("axios");
const api = require("../util/api.js");
const EReqMethod = require("../ts/enum/EReqMethod.js");

// 初始化axios设置
axios.defaults.baseURL = `https://cn-apia.coolkit.cn/v2`;
axios.defaults.timeout = 60000;

// 生成随机数
const chars = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

module.exports.createNoce = function () {
  let result = "";
  for (let i = 0; i < 8; i++) {
    const num = Math.ceil(Math.random() * (chars.length - 1));
    result += chars[num];
  }
  return result;
};

module.exports.createCommonHeader = function (type, params, at, headerOption) {
  // const auth = at ? `Bearer ${at}` : `Sign ` + getAuthSign(type, params); //登陆后 使用Bearer //登录前 使用Sign 当前只有post,没有get,get的处理方式不一样
  const auth = at ? `Bearer ${at}` : "";
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Nonce: module.exports.createNoce(),
    Authorization: auth,
    ...headerOption,
  };
};

module.exports.beforeLoginRequest = function (
  url,
  params,
  methodType,
  headerOption = {}
) {
  return _httpGetPOSTPutDeleteRequest(
    url,
    params,
    methodType,
    null,
    headerOption
  );
};

module.exports.afterLoginRequest = function (url, params, methodType) {
  const at = api.getAt();

  if (!at) {
    console.warn(`调用此接口(${url})，必须先登录 或者 登录才能获取完整数据!`);
  }
  return _httpGetPOSTPutDeleteRequest(url, params, methodType, at);
};

async function _httpGetPOSTPutDeleteRequest(
  url,
  params,
  methodType,
  at = null,
  headerOption = {}
) {
  const headers = module.exports.createCommonHeader(
    methodType,
    params,
    at,
    headerOption
  );
  console.log(headers, "headers");
  const axiosConfig = {
    url,
    method: methodType,
    headers,
    params,
    // cancelToken,
  };

  if (
    methodType === EReqMethod.POST ||
    methodType === EReqMethod.PUT ||
    methodType === EReqMethod.DELETE ||
    methodType === EReqMethod.OPTIONS
  ) {
    delete axiosConfig.params;
    axiosConfig["data"] = params;
  }

  // console.log('http请求参数', axiosConfig);

  try {
    console.log(axiosConfig, "axiosConfig");
    const result = await axios(axiosConfig);
    // console.log(result, "result");
    // const { data, status } = result;
    // console.log(`http请求结束 url:${url}`, `method:${methodType}`, 'params:', params);
    return result ? result.data : {};
  } catch (error) {
    // 报错中包含网络错误，即后端接口失效
    // const etcStore = useEtcStore();
    const errorStr = JSON.stringify(error);
    if (errorStr.includes("Network Error") || errorStr.includes("code 502")) {
      // etcStore.setIsLoading(true)
      // window.location.reload();
      // useDisconnect().startReconnect();
    } else {
      // etcStore.setIsLoading(false);
    }

    if (axios.isAxiosError(error)) {
      console.log("http request axios error: ", error.code, error.message);
      // 超时错误返回特定的msg
      const msg = error.message.includes("timeout") ? "timeout" : error.message;
      return {
        error: 500,
        msg,
      };
    }

    console.log("http request unknown error: ", error);
    return {
      error: 500,
      msg: "http api module unknown error",
    };
  }
}
