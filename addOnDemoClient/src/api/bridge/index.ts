import request from "../request";
import type { BridgeToken, DRResponse, serialNumberItem } from "@/ts/interface/IBridge";
import type { Response } from "@/ts/interface/IResponse";

async function getBridgeToken() {
  return await request.get<any, BridgeToken>("/api/bridge/access_token");
}

async function getLocalBridgeToken() {
  return await request.get<any, string>("/api/bridge/local_access_token");
}

async function getBridgeDeviceSerialNumber() {
  return await request.get<any, serialNumberItem[]>("/api/bridge/devices");
}

async function syncDevice(deviceId: string) {
  let params = {
    deviceId,
  };
  return await request.post<any, DRResponse>("/api/bridge/thirdparty/event/sync", params);
}

async function delDevice(serNum: string) {
  return await request.delete<any, Response>(`/api/bridge/del/${serNum}`);
}

export default {
  getBridgeToken,
  getLocalBridgeToken,
  getBridgeDeviceSerialNumber,
  syncDevice,
  delDevice,
};
