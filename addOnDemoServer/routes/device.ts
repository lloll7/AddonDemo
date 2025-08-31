import express from "express";
import {
  IThingList,
  frontThing,
  IThingFamilyList,
} from "./ts/interface/IThing";
import { broadcast } from "./sse";
import { error } from "console";
import { get } from "../util/http";
import { tokenStore } from "../util/tokenStore";

const router = express.Router();

router.get("/thing", async function (req, res, next) {
  try {
    const eweLinkThingList = await get<IThingList>("/device/thing", {});
    const familyList = await get<IThingFamilyList>("/family", {});
    const frontThingRes: frontThing[] = [];
    // broadcast({ type: "thing_list", data: eweLinkThingList }, "thingList");
    // res.json({ ok: true });
    if (eweLinkThingList.error === 0) {
      eweLinkThingList.data.thingList.forEach(async (thingItem) => {
        if (thingItem.itemData.productModel === "TRVZB") {
          console.log("testest");
          //   const currToken = await tokenStore.getToken();
          let familyName: string;
          if (thingItem.itemData.family.familyid) {
            familyList.data.familyList.forEach((familyItem) => {
              if (familyItem.id === thingItem.itemData.family.familyid) {
                familyName = familyItem.name;
              }
            });
          }
          frontThingRes.push({
            deviceId: thingItem.itemData.deviceid,
            deviceName: thingItem.itemData.name,
            displayCategory: "thermostat",
            familyName: familyName,
            // isMyAccount: thingItem.itemData.apikey === currToken.apiKey,
            isMyAccount: true,
            isOnline: thingItem.itemData.online,
            isSupported: true,
            isSynced: false,
            networkProtocol: "zigbee",
          });
          console.log(frontThingRes, "frontThingRes1");
        }
      });
      res.json(frontThingRes);
    } else {
      res
        .status(500)
        .json({ error: eweLinkThingList.error, msg: eweLinkThingList.msg });
    }
  } catch (error) {
    res.status(500).json({ error: "获取失败", msg: error.message });
  }
});

export default router;
