import { defineStore } from "pinia";
import api from "@/api";
import type { IThing, IThingParams } from "@/ts/interface/IThing";

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
    getDeviceById(deviceId: string): IThing | null {
      this.deviceList.forEach((item) => {
        if (item.deviceId === deviceId) return item;
      });
      return null;
    },
    setDeviceList(state: IThing[]) {
      this.deviceList = state;
    },
    clearDeviceList() {
      this.deviceList = [];
    },
    async initDeviceList(token: string) {
      if (token !== "") {
        const thingList = await api.thing.getThingList();
        this.deviceList = thingList;
        console.log(this.deviceList, "this.deviceList");
      }
    },
    changeDeviceState(type: string, params: any, deviceId: string) {
      console.log(params, "paramsparamsparams sysmsg");
      if (type === "update") {
        // 设备状态更新
        if (!params.childLock && !params.workMode) return;
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
        console.log("更改sysmsg");
        this.deviceList.forEach((item) => {
          console.log(deviceId, "需要更改的id");
          if (item.deviceId === deviceId) {
            console.log("更改具体设备sysmsg");
            item.isOnline = params.online;
          }
        });
      }
      // 刷新页面
      //   window.location.reload();
    },
  },
});
