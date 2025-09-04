import {
  IThingList,
  frontThing,
  IThingFamilyList,
} from "../ts/interface/IThing";
import { get } from "../util/http";
import { deviceStore } from "../db/deviceStore";

export async function thingService(body: any) {
  const eweLinkThingList = await get<IThingList>("/device/thing", {});
  console.log(eweLinkThingList, "eweLinkThingList");
  const familyList = await get<IThingFamilyList>("/family", {});
  const frontThingRes: frontThing[] = [];
  if (eweLinkThingList.error === 0) {
    deviceStore.clearDevices();
    eweLinkThingList.data.thingList.forEach(async (thingItem) => {
      if (thingItem.itemData.productModel === "TRVZB") {
        deviceStore.setDevice(thingItem.itemData);
        console.log(thingItem, "TINGiTEM");
        console.log("testest");
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
          params: thingItem.itemData.params,
        });
        console.log(frontThingRes, "frontThingRes1");
      }
    });
    return {
      error: 0,
      data: frontThingRes,
    };
  } else {
    return {
      error: 1,
      data: {
        error: eweLinkThingList.error,
        mas: eweLinkThingList.msg,
      },
    };
  }
}
