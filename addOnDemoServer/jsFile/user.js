const express = require("express");
const router = express.Router();
// const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const axios = require("axios");

// import CryptoJS from "crypto-js";
const { createNoce } = require("../util/public.ts");
const { post } = require("../util/http.ts");

/* GET users listing. */
router.post("/login", async function (req, res, next) {
  try {
    console.log(req.body, "登录请求");

    let buffer = Buffer.from(JSON.stringify(req.body), "utf-8");
    const appSecret = "V0LmoW0cd2cg38i1eIM0P5Z29GjES4PA";
    const theSign = crypto
      .createHmac("sha256", appSecret)
      .update(buffer)
      .digest("base64");

    console.log(JSON.parse(JSON.stringify(req.body)), "Request.body");
    console.log(theSign, JSON.stringify(req.body), "theSign");

    const headerOption = {
      "X-CK-Nonce": createNoce(),
      "X-CK-Appid": "oc3tvAdJPmaVOKrLv0rjCC0dzub4bbnD",
      Authorization: `Sign ${theSign}`,
    };

    const result = await post(
      "https://cn-apia.coolkit.cn/v2/user/login",
      JSON.stringify(req.body),
      {
        headers: {
          "Content-Type": "application/json",
          "X-CK-Nonce": createNoce(),
          "X-CK-Appid": "oc3tvAdJPmaVOKrLv0rjCC0dzub4bbnD",
          Authorization: `Sign ${theSign}`,
          Accept: "application/json",
        },
      }
    );
    console.log(result, "res");

    // // 如果登录成功，存储token
    // if (result && result.data && result.data.at) {
    //   await tokenStore.setToken(
    //     result.data.at,
    //     result.data.rt,
    //     result.data.user.apikey
    //   );
    //   console.log(
    //     result.data.at,
    //     result.data.rt,
    //     result.data.user.apikey,
    //     "Token已存储到数据库"
    //   );
    // }

    res.json(result.data);
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ error: "登录失败", message: error.message });
  }
});

module.exports = router;

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
