import express from "express";
import crypto from "crypto";
import { createNoce } from "../util/public";
import { post, del } from "../util/http";
import { tokenStore } from "../util/tokenStore";
import { type eweLinkAppToken } from "../ts/interface/ILogin";
// 导入设备服务器客户端
import { DeviceServerClient } from "../service/deviceWsServer";

const router = express.Router();

/* 登录 */
router.post("/login", async function (req, res, next) {
  try {
    console.log(req.body, "登录请求");

    let buffer = Buffer.from(JSON.stringify(req.body), "utf-8");
    // const appSecret = "V0LmoW0cd2cg38i1eIM0P5Z29GjES4PA";
    const theSign = crypto
      .createHmac("sha256", process.env.EWELINK_APP_APPSECRET)
      .update(buffer)
      .digest("base64");

    console.log(JSON.parse(JSON.stringify(req.body)), "Request.body");
    console.log(theSign, JSON.stringify(req.body), "theSign");

    const result = await post<eweLinkAppToken>(
      "/user/login",
      JSON.stringify(req.body),
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
      // 这里需要获取设备服务器的连接实例
      // 你可以通过全局变量或者模块导出来获取
      try {
        console.log(
          global.deviceServer,
          "global.deviceServerglobal.deviceServerglobal.deviceServerglobal.deviceServer"
        );
        if (global.deviceServer && global.deviceServer.connected) {
          const handShakeResult = await global.deviceServer.handShake({
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
    res.json(returnToken);
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ error: "登录失败", msg: error.message });
  }
});

/* 退出登录 */
router.delete("/logout", async function (req, res, next) {
  try {
    const result = await del<object>("/user/logout", {
      headers: {
        "X-CK-Appid": process.env.EWELINK_APP_APPID,
      },
    });
    if (result.error === 0) {
      console.log("into clear token");
      await tokenStore.clearToken();
      res.json(result);
    } else {
      console.log(result, "error result");
      res.status(500).json({ error: result.error, msg: result.msg });
    }
  } catch (error) {
    res.status(500).json({ error: "退出登录失败", msg: error.message });
  }
});

router.get("/token", async function (req, res, next) {
  const tokenInfo = await tokenStore.getToken();
  console.log(tokenInfo, "tokenInfo");
  if (tokenInfo && tokenInfo.at) {
    res.json(tokenInfo);
  } else {
    res.json(null);
  }
});

export default router;

// const secDemo = "OdPuCZ4PkPPi0rVKRVcGmll2NM6vVk0c";
// const bodyDemo = {
//   phoneNumber: "13426897758",
//   password: "LINZY666",
//   countryCode: "+1",
// };
// let bufferDemo = Buffer.from(JSON.stringify(bodyDemo), "utf-8");
// const sign = CryptoJS.enc.Base64.stringify(
//   CryptoJS.HmacSHA256(bufferDemo, secDemo)
// );

// 调用登录API
// const result = await axios({
//   headers: {
//     "Content-Type": "application/json",
//     "X-CK-Nonce": createNoce(),
//     "X-CK-Appid": "oc3tvAdJPmaVOKrLv0rjCC0dzub4bbnD",
//     Authorization: `Sign ${theSign}`,
//     Accept: "application/json",
//   },
//   method: "post",
//   url: "https://cn-apia.coolkit.cn/v2/user/login",
//   data: JSON.stringify(req.body),
// });
