import type {
  tokenData,
  ResonseDeviceList,
  finalParam,
  DRResponse,
} from "../ts/interface/IBridge";
import { aiBridgeTokenStore } from "../db/aiBridgeTokenStore";
import { get, post, del } from "../util/AIBridgeHttp";
import { deviceStore } from "../db/deviceStore";
import EThermostatMode from "../ts/enum/EThermostatMode";
import { transfromStatusStructure } from "../util/tool";
import { v4 } from "uuid";

export async function accessTokenService() {
  let params = {
    app_name: "app",
  };
  console.log(params, "AIBridgeParams");
  const result = await get<tokenData>("/bridge/access_token", params);
  // 兼容不同返回结构，假设 { access_token, expires_in }
  if (result.error === 0) {
    console.log(result, "result");
    aiBridgeTokenStore.saveToken(result.data.token);
  }
  return result;
}
// 筛选处理网关子设备列表返回的信息
export async function devicesSerivce(id: string | null = null) {
  console.log(id, "单设备id");
  const result = await get<ResonseDeviceList>("/devices");
  //   console.log(result.data.device_list, "devicesSerivce");
  // 只保留有third_serial_number字段的设备
  let serialNumbers = result.data.device_list
    .filter((item) => !!item.third_serial_number)
    .map((item) => ({
      serial_number: item.serial_number,
      third_serial_number: item.third_serial_number,
    }));
  // 如果传入了id，则只返回对应id的设备（设备id与third_serial_number一致）
  if (id) {
    serialNumbers = serialNumbers.filter(
      (item) => item.third_serial_number === id
    );
    console.log(serialNumbers, "serialNumbers");
  }
  return serialNumbers;
}

export async function discoveryRequestService(body: any) {
  console.log(body, "body");
  const deviceId = body.deviceId;
  const deviceInfo = await deviceStore.getDevice(deviceId);
  console.log(deviceInfo, "deviceInfo");
  const { deviceid, name, params, extra } = deviceInfo;
  console.log(deviceid, "deviceiddeviceiddeviceid");
  const paramsObj = JSON.parse(params);
  const extraObj = JSON.parse(extra);
  let modeArr = ["MANUAL", "ECO", "AUTO"];
  console.log(paramsObj, "params");
  let postParams: finalParam = {
    event: {
      header: {
        name: "DiscoveryRequest",
        message_id: v4(),
        version: "2",
      },
      payload: {
        endpoints: [
          {
            third_serial_number: deviceid,
            name: name,
            display_category: "thermostat",
            capabilities: [
              {
                capability: "thermostat",
                permission: "1100",
                name: "thermostat-mode",
                settings: {
                  supportedModes: {
                    permission: "11",
                    type: "enum",
                    values: modeArr,
                    value: "MANUAL",
                  },
                },
              },
              {
                capability: "child-lock",
                permission: "1100",
              },
            ],
            state: {
              "child-lock": {
                powerState: paramsObj.childLock ? "on" : "off",
              },
              thermostat: {
                "thermostat-mode": {
                  thermostatMode: EThermostatMode[paramsObj.workMode],
                },
              },
            },
            manufacturer: extraObj.manufacturer,
            model: extraObj.model,
            firmware_version: paramsObj.fwVersion,
            service_address: "http://10.10.10.185:3000/ws/device-control",
          },
        ],
      },
    },
  };
  console.log(
    postParams.event.payload.endpoints[0].third_serial_number,
    "[0].third_serial_number"
  );
  const result = await post("/thirdparty/event", postParams);
  console.log(JSON.stringify(result), "同步设备返回结果");
  return result;
}

export async function deviceStatesChangeReport(body: any) {
  //   console.log(body, "设备状态更新上报");
  const status = transfromStatusStructure(body.status);
  //   console.log(status, "单设备status");
  const serialNumbers = await devicesSerivce(body.status.deviceId);
  //   console.log(serialNumbers, "单设备");
  const params: finalParam = {
    event: {
      header: {
        name: "DeviceStatesChangeReport",
        message_id: v4(),
        version: "2",
      },
      endpoint: serialNumbers[0],
      payload: {
        state: status,
      },
    },
  };
  //   console.log(params, "单设备params");
  const result = await post("/thirdparty/event", params);
  return result;
}

export async function deviceOnlineStatesChangeReport(body: any) {
  console.log(body, "设备上下线更新上报");
  const serialNumbers = await devicesSerivce(body.status.deviceId);
  const params: finalParam = {
    event: {
      header: {
        name: "DeviceOnlineChangeReport",
        message_id: v4(),
        version: "2",
      },
      endpoint: serialNumbers[0],
      payload: {
        online: body.status.online,
        // online: false,
      },
    },
  };
  console.log(params, "设备上下限params");
  const result = await post("/thirdparty/event", params);
  return result;
}

export async function delDevice(serNum: any) {
  console.log(serNum, "网关删除子设备");
  const result = await del(`/devices/${serNum}`);
  return result;
}
