import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";
import { type eweLinkAppToken } from "@/ts/interface/IToken";

interface IEtcState {
  region: string;
  at: string;
  rt: string;
  apikey: string;
  account: string;
}

export const useEtcStore = defineStore("etcStore", {
  state: (): IEtcState => {
    return {
      region: "",
      at: "",
      rt: "",
      apikey: "",
      account: "",
    };
  },
  getters: {},
  actions: {
    getToken() {
      return this.at;
    },
    getApikey() {
      return this.apikey;
    },
    setToken(state: eweLinkAppToken) {
      this.region = state.region;
      this.at = state.at;
      this.rt = state.rt;
      this.apikey = state.apiKey;
      this.account = state.account;
    },
    clearToken() {
      this.region = "";
      this.at = "";
      this.rt = "";
      this.apikey = "";
      this.account = "";
    },
    async initToken() {
      const tokenInfo = await api.user.getTokenInfo();
      if (tokenInfo) {
        this.region = tokenInfo.region;
        this.at = tokenInfo.at;
        this.rt = tokenInfo.rt;
        this.apikey = tokenInfo.apiKey;
        this.account = tokenInfo.account;
      }
    },
  },
});
