import EThermostatMode from "../ts/enum/EThermostatMode";
import os from "os";
export const ewelinkToken = function (data) {
  const { at, rt, apikey } = data;
};

export const AIBridgeToken = function (data) {};
/**
 * @description 参数结构转换
 * @param status
 * @returns object
 */
export const transfromStatusStructure = function (status: any) {
  if (status.workMode) {
    let mode = EThermostatMode[status.workMode];
    return {
      thermostat: {
        "thermostat-mode": {
          thermostatMode: mode,
        },
      },
    };
  } else if (typeof status.childLock === "boolean") {
    const lock = status.childLock ? "on" : "off";
    return {
      "child-lock": {
        powerState: lock,
      },
    };
  }
};

export const getCurrWifiIpv4Address = function () {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal && iface.address) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
};
