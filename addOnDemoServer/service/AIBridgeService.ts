import type {
  tokenData,
  ResonseDeviceList,
  finalParam,
} from "../ts/interface/IBridge";
import { aiBridgeTokenStore } from "../db/aiBridgeTokenStore";
import { get, post, del } from "../util/AIBridgeHttp";
import { deviceStore } from "../db/deviceStore";
import EThermostatMode from "../ts/enum/EThermostatMode";
import { transfromStatusStructure } from "../util/tool";
import { v4 } from "uuid";
import { env } from "../ts/env";
/**
 * @description 获取网关访问凭证
 */
export async function accessTokenService() {
  let params = {
    app_name: "app",
  };
  const result = await get<tokenData>("/bridge/access_token", params);
  // 兼容不同返回结构，假设 { access_token, expires_in }
  if (result.error === 0) {
    aiBridgeTokenStore.saveToken(result.data.token);
  }
  return result;
}
// 筛选处理网关子设备列表返回的信息
export async function devicesSerivce(id: string | null = null) {
  const result = await get<ResonseDeviceList>("/devices");
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
  }
  return serialNumbers;
}
/**
 * @description 同步新设备列表
 * @param body
 * @returns
 */
export async function discoveryRequestService(body: any) {
  const deviceId = body.deviceId;
  const deviceInfo = await deviceStore.getDevice(deviceId);
  const { deviceid, name, params, extra } = deviceInfo;
  const paramsObj = JSON.parse(params);
  const extraObj = JSON.parse(extra);
  let modeArr = ["MANUAL", "ECO", "AUTO"];
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
            // 获取本机当前使用的网络的IPv4地址
            service_address: `http://${(() => {
              const os = require("os");
              const interfaces = os.networkInterfaces();
              for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                  if (
                    iface.family === "IPv4" &&
                    !iface.internal &&
                    iface.address
                  ) {
                    return iface.address;
                  }
                }
              }
              return "127.0.0.1";
            })()}:${env.PORT}/ws/device-control`,
          },
        ],
      },
    },
  };
  console.log(
    postParams.event.payload.endpoints[0].service_address,
    "[0].third_serial_number"
  );
  const result = await post("/thirdparty/event", postParams);
  return result;
}
/**
 * @description 设备状态更新上报
 * @param body
 * @returns
 */
export async function deviceStatesChangeReport(body: any) {
  const status = transfromStatusStructure(body.status);
  const serialNumbers = await devicesSerivce(body.status.deviceId);
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
  const result = await post("/thirdparty/event", params);
  return result;
}
/**
 * @description 设备上下线状态上报
 * @param body
 * @returns
 */
export async function deviceOnlineStatesChangeReport(body: any) {
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
      },
    },
  };
  const result = await post("/thirdparty/event", params);
  return result;
}
/**
 * @description 删除网关子设备
 * @param serNum
 * @returns
 */
export async function delDevice(serNum: any) {
  const result = await del(`/devices/${serNum}`);
  return result;
}
