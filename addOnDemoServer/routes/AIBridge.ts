import express from "express";
import { beforeLoginRequest } from "../util/public";
import EReqMethod from "../ts/enum/EReqMethod";
const router = express.Router();

router.get("/accenToken", async (req, res, next) => {
  const result = await beforeLoginRequest(
    "/bridge/accenToken",
    {},
    EReqMethod.GET
  );
  console.log(result, "Bridge result");
});

export default router;
