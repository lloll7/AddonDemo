// import { beforeLoginRequest } from "@/api/public";
// import EReqMethod from "@/api/ts/enum/EReqMethod";
import request from "../request";

async function test() {
  //   return await beforeLoginRequest<string>("http://localhost:3000/users", {}, EReqMethod.GET);
  return await request({
    url: "http://localhost:3000/users",
    method: "get",
  });
}

export default {
  test,
};
