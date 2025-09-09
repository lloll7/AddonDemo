"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
