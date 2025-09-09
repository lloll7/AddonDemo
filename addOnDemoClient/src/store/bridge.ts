import { defineStore } from "pinia";
import api from "@/api";

export const useBridgeStore = defineStore("bridgeStore", {
  state: () => {
    return {
      bridgeAccessToken: "",
    };
  },
  getters: {},
  actions: {
    getBridgeAt() {
      return this.bridgeAccessToken;
    },
    setBridgeAt(at: string) {
      this.bridgeAccessToken = at;
    },
    clearBridgtAt() {
      this.bridgeAccessToken = "";
    },
    async initBridgeAt() {
      const token = await api.bridge.getLocalBridgeToken();
      if (token) {
        this.bridgeAccessToken = token;
      }
    },
  },
});
