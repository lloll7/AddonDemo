import request from "../request";
import { type IThing } from "@/ts/interface/IThing";

async function getThingList() {
  return await request.get<any, IThing[]>("/api/device/thing");
}

export default { getThingList };
