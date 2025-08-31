import request from "../request";
import { type ILoginInfo } from "@/ts/interface/IUser";
import { type Response } from "@/ts/interface/IResponse";
import { type eweLinkAppToken } from "@/ts/interface/IToken";

async function login(loginInfo: ILoginInfo) {
  return await request.post<any, eweLinkAppToken>("/api/user/login", loginInfo);
}

async function loginOut() {
  return await request.delete<any, Response>("/api/user/logout");
}

async function getTokenInfo() {
  return await request.get<any, eweLinkAppToken | null>("/api/user/token");
}

export default {
  login,
  loginOut,
  getTokenInfo,
};
