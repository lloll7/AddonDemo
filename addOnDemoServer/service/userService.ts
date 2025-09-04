import { type eweLinkAppToken } from "../ts/interface/ILogin";
import crypto from "crypto";
import { createNoce } from "../util/public";
import { post, del } from "../util/http";
import { tokenStore } from "../db/tokenStore";
// 导入设备服务器管理器
import { deviceServerManager } from "../webscoketServer/deviceServerManager";

export async function loginService(body: any) {
  let buffer = Buffer.from(JSON.stringify(body), "utf-8");
  // const appSecret = "V0LmoW0cd2cg38i1eIM0P5Z29GjES4PA";
  const theSign = crypto
    .createHmac("sha256", process.env.EWELINK_APP_APPSECRET)
    .update(buffer)
    .digest("base64");

  console.log(JSON.parse(JSON.stringify(body)), "Request.body");
  console.log(theSign, JSON.stringify(body), "theSign");

  const result = await post<eweLinkAppToken>(
    "/user/login",
    JSON.stringify(body),
    {
      headers: {
        "X-CK-Appid": process.env.EWELINK_APP_APPID,
        Authorization: `Sign ${theSign}`,
      },
    }
  );
  console.log(result, "res");

  // 如果登录成功，存储token
  if (result && result.data.at) {
    await tokenStore.setToken(
      result.data.at,
      result.data.rt,
      result.data.user.apikey,
      result.data.region,
      result.data.user.phoneNumber
        ? result.data.user.phoneNumber
        : result.data.user.email
    );
    console.log(
      result.data.at,
      result.data.rt,
      result.data.user.apikey,
      "Token已存储到数据库"
    );
    // 在登录成功后与设备服务器进行握手
    try {
      if (deviceServerManager.isConnected()) {
        const handShakeResult = await deviceServerManager.performHandshake({
          action: "userOnline",
          version: 8,
          at: result.data.at,
          userAgent: "app",
          apikey: result.data.user.apikey,
          appid: process.env.EWELINK_APP_APPID,
          nonce: createNoce(),
          sequence: String(Date.now()),
        });
        console.log("设备服务器握手成功:", handShakeResult);
      } else {
        console.log("设备服务器未连接，跳过握手");
      }
    } catch (error) {
      console.log("握手失败", error);
    }
  }
  const returnToken = {
    at: result.data.at,
    rt: result.data.rt,
    apiKey: result.data.user.apikey,
    region: result.data.region,
    account: result.data.user.phoneNumber
      ? result.data.user.phoneNumber
      : result.data.user.email,
  };
  return returnToken;
}
