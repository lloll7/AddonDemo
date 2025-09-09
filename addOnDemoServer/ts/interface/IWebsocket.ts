/** 客户端发送消息类 */
export interface ClientMessage {
  // 消息类型
  type: "ping" | "broadcast" | "device_control" | "handeshake"; // 心跳、广播消息
  // 消息内容（可选）
  message?: string | DeviceControlMessage;
  // 时间戳（可选）
  timestamp?: number;
}

export interface DeviceControlMessage {
  action: "update";
  apikey: string;
  selfApiKey?: string;
  deviceid: string;
  params: any;
  userAgent: string;
  sequence: string;
}

/** 服务器响应/推送消息类 */
export interface ServerMessage {
  // 消息类型
  type: string;
  // 消息内容（可选）
  message?: string | DeviceResponseMessage;
  // 消息ID（可选）
  id?: number;
  // 时间戳
  timestamp: number;
  // 发送者ID（可选）
  from?: number;
  // 原始消息内容（可选，类型为any）
  originalMessage?: any;
}

export interface DeviceResponseMessage {
  error: number;
  apiKey?: string;
  deviceid?: string;
  sequence: string;
}
export interface DeviceStatusUpdateMessage {
  action: string;
  apikey: string;
  deviceid: string;
  params: any;
  userAgent?: string;
  d_seq?: number;
  ts?: number;
}

export interface IHb {
  hb: number;
  hbInterval: number;
}

export interface HandShakeResponse {
  error: number;
  apiKey: string;
  config: IHb;
  sequence: string;
}

export interface HandShakeMessage {
  action: string; // 固定参数 userOnline
  at: string;
  apikey: string;
  appid: string;
  nonce: string;
  ts?: number;
  userAgent: string; // 固定参数 app
  sequence: string;
  version: number; // 接口版本：8
}

// // types/websocket.ts
// export interface BaseMessage {
//   type: string;
//   timestamp: number;
//   messageId?: string;
// }

// export interface ClientMessage extends BaseMessage {
//   type: "ping" | "broadcast" | "device_control";
//   message?: string;
//   deviceId?: string;
//   command?: any;
// }

// export interface ServerMessage extends BaseMessage {
//   type: "welcome" | "pong" | "broadcast" | "echo" | "error" | "device_response";
//   message?: string;
//   id?: number;
//   from?: number;
//   originalMessage?: any;
//   deviceId?: string;
//   status?: "success" | "failed";
//   result?: any;
// }

// export interface DeviceControlMessage extends BaseMessage {
//   type: "device_control";
//   deviceId: string;
//   command: {
//     action: string;
//     params?: any;
//   };
//   clientId: number;
// }

// export interface DeviceResponseMessage extends BaseMessage {
//   type: "device_response";
//   deviceId: string;
//   status: "success" | "failed";
//   result: any;
//   clientId: number;
// }
