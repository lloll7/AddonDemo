import express from "express";
import { aiBridgeTokenStore } from "../db/aiBridgeTokenStore";
import {
  accessTokenService,
  devicesSerivce,
  discoveryRequestService,
  delDevice,
} from "../service/AIBridgeService";
const router = express.Router();

// 代理获取网关 access_token，并持久化
router.get("/access_token", async (req, res, next) => {
  try {
    const result = await accessTokenService();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 读取本地持久化的 access_token（不请求网关）
router.get("/local_access_token", async (req, res, next) => {
  try {
    const token = await aiBridgeTokenStore.getToken();
    res.json(token);
  } catch (err) {
    next(err);
  }
});

// 清空本地 access_token
router.delete("/access_token", async (req, res, next) => {
  try {
    await aiBridgeTokenStore.clearToken();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// 获取网关子设备列表
router.get("/devices", async (req, res, next) => {
  try {
    const serialNumbers = await devicesSerivce();
    res.json(serialNumbers);
  } catch (err) {
    next(err);
  }
});

// 三方请求网关接口之同步设备列表
router.post("/thirdparty/event/sync", async (req, res, next) => {
  try {
    const result = await discoveryRequestService(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 路径上传参数，假设参数名为 serNum，可以这样写：
router.delete("/del/:serNum", async (req, res, next) => {
  try {
    const { serNum } = req.params;
    const result = await delDevice(serNum);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
