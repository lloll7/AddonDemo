import { v4 } from "uuid";

export const getPostHeader = function (type: string) {
  return {
    name: type,
    message_id: v4(),
    version: "2",
  };
};
