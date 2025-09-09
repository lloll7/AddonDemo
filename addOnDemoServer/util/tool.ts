import EThermostatMode from "../ts/enum/EThermostatMode";
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
  console.log(status, "statusstatus");
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
