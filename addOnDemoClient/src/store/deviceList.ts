import { defineStore } from "pinia";
import api from "@/api";
import type { IThing } from "@/ts/interface/IThing";

interface IDeviceListState {
  deviceList: IThing[];
}

export const useDeviceListStore = defineStore("deviceListStore", {
  state: (): IDeviceListState => {
    return {
      deviceList: [],
    };
  },
  getters: {},
  actions: {
    getDeviceList() {
      return this.deviceList;
    },
    setDeviceList(state: IThing[]) {
      this.deviceList = state;
    },
    clearDeviceList() {
      this.deviceList = [];
    },
    async initDeviceList(token: string) {
      if (!token) {
        const thingList = await api.thing.getThingList();
        this.deviceList = thingList;
      }
    },
    changeDeviceState(type: string, params: any, deviceId: string) {
      if (type === "update") {
        // 设备状态更新
        //  判断是否是童锁或者工作模式等能力的更改
        if (!("childLock" in params) && !("workMode" in params)) return;
        this.deviceList.forEach((item) => {
          if (item.deviceId === deviceId) {
            item.params = {
              ...item.params,
              ...params,
            };
          }
        });
      } else if (type === "sysmsg") {
        // 设备上下线
        this.deviceList.forEach((item) => {
          if (item.deviceId === deviceId) {
            item.isOnline = params.online;
          }
        });
      }
    },
  },
});
