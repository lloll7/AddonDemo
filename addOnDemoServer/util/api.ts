// const tokenStore = require("./tokenStore.ts");
import { tokenStore } from "../db/tokenStore";

export const getAt = async (): Promise<string> => {
  try {
    const token = await tokenStore.getToken();
    // token 可能为 null 或 { at: string; rt: string; apiKey: string; }
    console.log(token, "tokentoken");
    if (token && typeof token.at === "string") {
      return token.at;
    } else {
      return "";
    }
  } catch (error) {
    console.error("获取Token失败:", error);
    return "";
  }
};

export const setAt = async (
  at,
  rt,
  apiKey,
  region,
  account
): Promise<boolean> => {
  try {
    await tokenStore.setToken(at, rt, apiKey, region, account);
    return true;
  } catch (error) {
    console.error("存储Token失败:", error);
    return false;
  }
};

export const clearAt = async (): Promise<boolean> => {
  try {
    await tokenStore.clearToken();
    return true;
  } catch (error) {
    console.error("清除Token失败:", error);
    return false;
  }
};
