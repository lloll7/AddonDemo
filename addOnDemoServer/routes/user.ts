import express from "express";
import { loginService } from "../service/userService";
import { del } from "../util/http";
import { tokenStore } from "../db/tokenStore";
import { secret } from "../ts/secret";

const router = express.Router();

/* 登录 */
router.post("/login", async function (req, res, next) {
  try {
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
        "X-CK-Appid": secret.EWELINK_APP_APPID,
      },
    });
    if (result.error === 0) {
      await tokenStore.clearToken();
      res.json(result);
    } else {
      res.status(500).json({ error: result.error, msg: result.msg });
    }
  } catch (error) {
    res.status(500).json({ error: "退出登录失败", msg: error.message });
  }
});

router.get("/token", async function (req, res, next) {
  const tokenInfo = await tokenStore.getToken();
  if (tokenInfo && tokenInfo.at) {
    res.json(tokenInfo);
  } else {
    res.json(null);
  }
});

export default router;
