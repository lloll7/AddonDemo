import { type eweLinkAppToken } from "../ts/interface/ILogin";
import crypto from "crypto";
import { createNoce } from "../util/public";
import { post, del } from "../util/http";
import { tokenStore } from "../db/tokenStore";
import { secret } from "../ts/secret";
// 导入设备服务器管理器
import { deviceServerManager } from "../webscoketServer/deviceServerManager";
/**
 * @description 易微联账号登录
 * @param body
 * @returns
 */
export async function loginService(body: any) {
  let buffer = Buffer.from(JSON.stringify(body), "utf-8");
  // 进行sha256签名
  const theSign = crypto
    .createHmac("sha256", secret.EWELINK_APP_APPSECRET)
    .update(buffer)
    .digest("base64");

  // 易微联账号登录
  const result = await post<eweLinkAppToken>(
    "/user/login",
    JSON.stringify(body),
    {
      headers: {
        "X-CK-Appid": secret.EWELINK_APP_APPID,
        Authorization: `Sign ${theSign}`,
      },
    }
  );

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
    // 在登录成功后与设备服务器进行握手
    try {
      if (deviceServerManager.isConnected()) {
        const handShakeResult = await deviceServerManager.performHandshake({
          action: "userOnline",
          version: 8,
          at: result.data.at,
          userAgent: "app",
          apikey: result.data.user.apikey,
          appid: secret.EWELINK_APP_APPID,
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
