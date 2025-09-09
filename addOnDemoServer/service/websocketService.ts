import { deviceServerManager } from "../webscoketServer/deviceServerManager";
import { tokenStore } from "../db/tokenStore";
import EThermostatMode from "../ts/enum/EThermostatMode";
import { post } from "../util/AIBridgeHttp";
import { v4 } from "uuid";

export async function controlService(body: any) {
  console.log(body.directive.payload.state, "网关控制同步设备发送的控制参数");
  const { apiKey } = await tokenStore.getToken();
  let submitUpdateParams: any = {};
  if (
    body.directive.payload.state.thermostat &&
    body.directive.payload.state.thermostat["thermostat-mode"]
  ) {
    submitUpdateParams.workMode =
      EThermostatMode[
        body.directive.payload.state.thermostat[
          "thermostat-mode"
        ].thermostatMode
      ];
  }
  if (body.directive.payload.state["child-lock"]) {
    const lockStatus =
      body.directive.payload.state["child-lock"].powerState === "on";
    submitUpdateParams.childLock = lockStatus;
  }
  let contorlMessage = {
    action: "update",
    apikey: apiKey,
    deviceid: body.directive.endpoint.third_serial_number,
    params: submitUpdateParams,
    userAgent: "app",
    sequence: JSON.stringify(Date.now()),
  };
  const result = await deviceServerManager.sendDeviceControl(contorlMessage);
  console.log(result, "网关控制result");
  if (result.error === 0) {
    const reportData = {
      header: {
        version: "2",
        message_id: v4(),
        name: "DeviceStatesChangeReport",
      },
      endpoint: {
        serial_number: body.directive.endpoint.serial_number,
        third_serial_number: body.directive.endpoint.third_serial_number,
      },
      payload: {
        ...body.directive.payload,
      },
    };
    const reportResult = await post("/thirdparty/event", reportData);
  }
}
