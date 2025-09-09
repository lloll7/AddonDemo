import axios from "axios";
// import { getAt } from "./api";
import { Response } from "../ts/interface/IResponse";
import { aiBridgeTokenStore } from "../db/aiBridgeTokenStore";
import { env } from "../ts/env";

// 创建 axios 实例
const http = axios.create({
  baseURL: `http://${env.IHOST_OPENAPI_ADDRESS}/open-api/v2/rest`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 请求拦截器
http.interceptors.request.use(
  async (config) => {
    // 在发送请求之前做些什么
    // const at = await getAt();
    // console.log(at, "at");
    // if (at && !config.headers.Authorization) {
    //   config.headers.Authorization = `Bearer ${at}`;
    //   console.log(config.headers.Authorization, "config.headers.Authorization");
    // }
    const localBridgeToken = await aiBridgeTokenStore.getToken();
    if (localBridgeToken && localBridgeToken.access_token) {
      config.headers.Authorization = `Bearer ${localBridgeToken.access_token}`;
    }

    // console.log(
    //   `发送请求: ${config.method?.toUpperCase()} ${JSON.stringify(config)}`
    // );
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    console.log(`收到响应: ${response.status})}`);
    // 根据后端约定处理响应
    // if (response.data && response.data.error === 0) {
    //   return response.data;
    // } else if (response.data && response.data.error !== 0) {
    //   // 业务错误
    //   const errorMsg = response.data.msg || "业务错误";
    //   return Promise.reject(new Error(errorMsg));
    // }

    return response.data;
  },
  (error) => {
    // 对响应错误做点什么
    console.error("响应错误:", error);
    let errData = error;
    if (error.response) {
      // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
      switch (error.response.status) {
        case 401:
          errData = "未授权，请重新登录";
          break;
        case 403:
          errData = "拒绝访问";
          break;
        case 404:
          errData = "请求资源不存在";
          break;
        case 500:
          errData = "服务器内部错误";
          break;
        default:
          errData = `连接错误${error.response.status}`;
      }
      console.error("错误内容:", errData);
    } else if (error.request) {
      // 请求已经成功发起，但没有收到响应
      //   message.error("网络异常，请检查网络连接");
    } else {
      // 发送请求时出了点问题
      //   message.error("请求错误，请重试");
    }

    return Promise.reject(error);
  }
);

// 封装通用方法
export function get<T>(url, params = {}, config = {}): Promise<Response<T>> {
  return http.get(url, { params, ...config });
}

export async function post<T>(
  url,
  data = {},
  config = {}
): Promise<Response<T>> {
  return await http.post(url, data, config);
}

export function put(url, data = {}, config = {}) {
  return http.put(url, data, config);
}

export function del<T>(url, config = {}): Promise<Response<T>> {
  return http.delete(url, config);
}

export function patch(url, data = {}, config = {}) {
  return http.patch(url, data, config);
}
