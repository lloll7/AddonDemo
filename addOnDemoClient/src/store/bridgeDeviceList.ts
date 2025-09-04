import { defineStore } from "pinia";

interface IBridgeDeviceSerialNumberItem {
  serial_number: string;
  third_serial_number: string;
}
interface IBridgeDeviceSerialNumberState {
  serialNumberList: IBridgeDeviceSerialNumberItem[];
}

export const useBridgeDeviceSerialNumberStore = defineStore("bridgeDeviceSerialNumberStore", {
  state: (): IBridgeDeviceSerialNumberState => {
    return {
      serialNumberList: [],
    };
  },
  getters: {},
  actions: {
    getDeviceSerialNumber() {
      return this.serialNumberList;
    },
    setDeviceSerialNumber(serialNumberList: IBridgeDeviceSerialNumberItem[]) {
      this.serialNumberList = serialNumberList;
    },
    clearDeviceSerialNumber() {
      this.serialNumberList = [];
    },
    async initDeviceSerialNumber(token: string) {},
  },
});
