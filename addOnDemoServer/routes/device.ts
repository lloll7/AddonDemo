import express from "express";
import { thingService } from "../service/deviceService";

const router = express.Router();

router.get("/thing", async function (req, res, next) {
  try {
    const result = await thingService(req.body);
    if (result.error === 0) {
      res.json(result.data);
    } else {
      res.status(500).json(result.data);
    }
  } catch (error) {
    res.status(500).json({ error: "获取失败", msg: error.message });
  }
});

export default router;
