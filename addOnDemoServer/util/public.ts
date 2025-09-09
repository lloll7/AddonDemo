import axios, { type CancelToken, type AxiosRequestConfig } from "axios";
import { getAt } from "./api";
import EReqMethod from "../ts/enum/EReqMethod";
import type IResponse from "../ts/class/CResponse";
import { tokenStore } from "../db/tokenStore";
import { env } from "../ts/env";
// import { apiUrl } from "@/config";
// import { useDisconnect } from "@/hooks/useDisconnect";
// 初始化axios设置
axios.defaults.baseURL = env.IHOST_OPENAPI_ADDRESS;
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

export function createNoce() {
  let result = "";
  for (let i = 0; i < 8; i++) {
    const num = Math.ceil(Math.random() * (chars.length - 1));
    result += chars[num];
  }
  return result;
}

export function createCommonHeader(
  type: EReqMethod,
  params: object,
  at: string | null
) {
  const auth = at ? `Bearer ${at}` : "";
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Nonce: createNoce(),
    Authorization: auth,
  };
}

export function beforeLoginRequest<T>(
  url: string,
  params: object,
  methodType: EReqMethod
) {
  return _httpGetPOSTPutDeleteRequest<T>(url, params, methodType);
}

export async function afterLoginRequest<T>(
  url: string,
  params: object,
  methodType: EReqMethod,
  cancelToken?: CancelToken
) {
  const at: string = await getAt();

  if (!at) {
    console.warn(`调用此接口(${url})，必须先登录 或者 登录才能获取完整数据!`);
  }
  return _httpGetPOSTPutDeleteRequest<T>(
    url,
    params,
    methodType,
    at,
    cancelToken
  );
}

async function _httpGetPOSTPutDeleteRequest<T>(
  url: string,
  params: object,
  methodType: EReqMethod,
  at: string | null = null,
  cancelToken?: CancelToken
) {
  const headers = createCommonHeader(methodType, params, at);

  const axiosConfig = {
    url,
    method: methodType,
    headers,
    params,
    cancelToken,
  } as AxiosRequestConfig;

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
    const result = await axios(axiosConfig);

    // const { data, status } = result;
    // console.log(`http请求结束 url:${url}`, `method:${methodType}`, 'params:', params);
    return result ? (result.data as IResponse<T>) : ({} as IResponse<T>);
  } catch (error) {
    // 报错中包含网络错误，即后端接口失效
    // const etcStore = useEtcStore();
    const errorStr = JSON.stringify(error);
    if (errorStr.includes("Network Error") || errorStr.includes("code 502")) {
      // etcStore.setIsLoading(true)
      // window.location.reload();
      //   useDisconnect().startReconnect();
    } else {
      //   etcStore.setIsLoading(false);
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
