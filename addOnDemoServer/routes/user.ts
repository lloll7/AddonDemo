import express from "express";
import { loginService } from "../service/userService";
import { del } from "../util/http";
import { tokenStore } from "../db/tokenStore";

const router = express.Router();

/* 登录 */
router.post("/login", async function (req, res, next) {
  try {
    console.log(req.body, "登录请求");
    const result = await loginService(req.body);
    res.json(result);
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
