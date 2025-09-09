// service/deviceWsServer.ts
import { WebSocket } from "ws";
import https from "https";
import type {
  DeviceControlMessage,
  DeviceResponseMessage,
  HandShakeResponse,
  HandShakeMessage,
  DeviceStatusUpdateMessage,
} from "../ts/interface/IWebsocket";
import {
  deviceStatesChangeReport,
  deviceOnlineStatesChangeReport,
} from "../service/AIBridgeService";
import { tokenStore } from "../db/tokenStore";
import { token } from "morgan";
import { createNoce } from "../util/public";

// WebSocket 连接选项接口，支持 SSL 相关配置
interface WebSocketOptions {
  rejectUnauthorized?: boolean; // 是否拒绝未授权的SSL证书
  maxReconnectAttempts?: number; // 最大重连次数
  reconnectInterval?: number; // 重连间隔（毫秒）
  // SSL 相关选项
  ca?: string | Buffer | Array<string | Buffer>;
  cert?: string | Buffer;
  key?: string | Buffer;
  passphrase?: string;
  // TLS 版本限制
  minVersion?: "TLSv1" | "TLSv1.1" | "TLSv1.2" | "TLSv1.3";
  maxVersion?: "TLSv1" | "TLSv1.1" | "TLSv1.2" | "TLSv1.3";
}

// 设备响应回调函数类型
export type DeviceStatusUpdateCallback = (
  response: DeviceStatusUpdateMessage
) => void;

// 设备服务器 WebSocket 客户端类
export class DeviceServerClient {
  private ws: WebSocket | null = null; // WebSocket 实例
  private serverUrl: string; // 设备服务器地址
  private reconnectAttempts = 0; // 当前重连次数
  private maxReconnectAttempts = 5; // 最大重连次数
  private rejectUnauthorized: boolean; // 是否拒绝未授权证书
  private heartbeatTimer: NodeJS.Timeout | null = null; // 心跳定时器
  private isConnected = false; // 连接状态
  private options: WebSocketOptions; // 连接选项
  private isHandShaked = false; // 添加握手状态
  private pingTimer = null;
  private handShakeTimer = null;
  private handShakeResolve: ((value: HandShakeResponse) => void) | null = null; // 添加握手resolve回调
  private deviceStatusUpdateCallback: DeviceStatusUpdateCallback | null = null; // 设备状态更新回调函数

  // 构造函数，初始化服务器地址和选项
  constructor(serverUrl: string, options: WebSocketOptions = {}) {
    this.serverUrl = serverUrl;
    this.options = {
      rejectUnauthorized: false, // 默认不验证SSL证书
      maxReconnectAttempts: 5,
      reconnectInterval: 1000,
      ...options,
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = this.options.maxReconnectAttempts || 5;
  }

  // 设置设备响应回调函数
  public setDeviceStatusUpdateCallback(
    callback: DeviceStatusUpdateCallback
  ): void {
    this.deviceStatusUpdateCallback = callback;
  }

  // 建立 WebSocket 连接
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 创建WebSocket连接选项
        const wsOptions: any = {};

        // 如果是WSS连接，添加SSL选项
        if (this.serverUrl.startsWith("wss://")) {
          const agentOptions: https.AgentOptions = {
            rejectUnauthorized: this.options.rejectUnauthorized,
          };

          // 只有在明确指定时才添加版本选项
          if (this.options.minVersion) {
            agentOptions.minVersion = this.options.minVersion;
          }
          if (this.options.maxVersion) {
            agentOptions.maxVersion = this.options.maxVersion;
          }

          // 如果提供了证书相关选项
          if (this.options.ca) {
            agentOptions.ca = this.options.ca;
          }
          if (this.options.cert) {
            agentOptions.cert = this.options.cert;
          }
          if (this.options.key) {
            agentOptions.key = this.options.key;
          }
          if (this.options.passphrase) {
            agentOptions.passphrase = this.options.passphrase;
          }

          wsOptions.agent = new https.Agent(agentOptions);
        }

        // 创建 WebSocket 实例
        this.ws = new WebSocket(this.serverUrl, wsOptions);

        console.log("正在连接设备服务器...");

        // 连接成功回调
        this.ws.onopen = async () => {
          console.log("设备服务器连接成功");
          this.isConnected = true;
          this.reconnectAttempts = 0; // 重置重连次数
          //   const tokenInfo = await tokenStore.getToken();
          //   //   console.log(tokenInfo, "tokenInfo");
          //   if (tokenInfo && tokenInfo.at) {
          //     await this.handShake({
          //       action: "userOnline",
          //       version: 8,
          //       at: tokenInfo.at,
          //       userAgent: "app",
          //       apikey: tokenInfo.apiKey,
          //       appid: process.env.EWELINK_APP_APPID,
          //       nonce: createNoce(),
          //       sequence: String(Date.now()),
          //     });
          //   }
          //   this.startHeartbeat(); // 启动心跳
          resolve();
        };

        // 收到消息回调
        this.ws.onmessage = (event) => {
          try {
            const data = event.data;
            console.log("收到设备服务器消息:", data);
            this.handleMessage(data); // 处理消息
          } catch (error) {
            console.error("解析设备服务器消息失败:", error);
          }
        };

        // 连接关闭回调
        this.ws.onclose = (event) => {
          console.log("设备服务器连接关闭:", event.code, event.reason);
          this.isConnected = false;
          this.isHandShaked = false; // 重置握手状态
          this.stopHeartbeat(); // 停止心跳
          this.attemptReconnect(); // 尝试重连
        };

        // 连接错误回调
        this.ws.onerror = (error) => {
          console.error("设备服务器连接错误:", error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // 处理收到的消息
  private handleMessage(data: any): void {
    try {
      // 如果是字符串则解析为对象
      const parsedData =
        typeof data === "string"
          ? data === "pong"
            ? data
            : JSON.parse(data)
          : data;
      if (parsedData === "pong") {
        this.handlePong();
      }
      // 检查是否为握手响应
      if (
        parsedData.error !== undefined &&
        parsedData.apikey &&
        parsedData.config &&
        this.handShakeResolve
      ) {
        this.handleHandShake(parsedData);
      }
      console.log("收到设备服务器响应:", parsedData.action, parsedData);

      // 判断是否为设备响应消息（含 error 字段）
      if (parsedData.error !== undefined) {
        // 这是一个设备响应消息
        this.handleDeviceResponse(parsedData);
      }
      // 设备更新消息
      if (parsedData.action && parsedData.action === "update") {
        this.handleDeviceStatusUpdate(parsedData);
      }
      if (parsedData.action && parsedData.action === "sysmsg") {
        console.log("进入离线if");
        this.handleDeviceOnlineStatusChange(parsedData);
      }
    } catch (error) {
      console.error("处理设备服务器消息失败:", error);
    }
  }

  // 处理设备响应消息（可扩展业务逻辑）
  private handleDeviceResponse(response: DeviceResponseMessage): void {
    console.log("设备响应:", response);
  }
  // 处理设备状态更新推送消息
  private async handleDeviceStatusUpdate(response: DeviceStatusUpdateMessage) {
    console.log(response, "设备服务器更新设备消息");
    const params = {
      status: {
        deviceId: response.deviceid,
        ...response.params,
      },
    };
    // const params2 = {
    //   status: {
    //     deviceId: response.deviceid,
    //     online: false,
    //   },
    // };
    await deviceStatesChangeReport(params);
    // const res = await deviceOnlineStatesChangeReport(params2);
    // 这里可以添加响应处理逻辑
    if (this.deviceStatusUpdateCallback) {
      this.deviceStatusUpdateCallback(response);
    }
  }
  private async handleDeviceOnlineStatusChange(
    response: DeviceStatusUpdateMessage
  ) {
    // 设备上下线
    console.log(response, "设备服务器更新设备上下线");
    // 这里可以添加响应处理逻辑
    const params = {
      status: {
        deviceId: response.deviceid,
        online: response.params.online,
      },
    };
    const res = await deviceOnlineStatesChangeReport(params);
    console.log(res, "设备上下线上报结果");
    if (this.deviceStatusUpdateCallback) {
      console.log("进入deviceStatusUpdateCallback if");
      this.deviceStatusUpdateCallback(response);
    }
  }
  // 收到pong响应时的回调
  private handlePong(): void {
    clearTimeout(this.pingTimer);
    this.pingTimer = null;
  }

  private handleHandShake(parsedData: HandShakeResponse): void {
    console.log("进入握手handler");
    clearTimeout(this.handShakeTimer);
    this.handShakeTimer = null;
    this.isHandShaked = true; // 设置握手状态
    this.handShakeResolve(parsedData);
    this.handShakeResolve = null; // 清除回调
    this.startHeartbeat(
      //   2000
      parsedData.config.hbInterval
        ? parsedData.config.hbInterval * 1000 * (0.8 + 0.2 * Math.random())
        : 90000
    );
    return;
  }

  // 发送设备控制指令，返回 Promise
  public sendDeviceControl(
    controlInfo: DeviceControlMessage
  ): Promise<DeviceResponseMessage> {
    return new Promise((resolve, reject) => {
      // 检查连接状态
      if (!this.isConnected) {
        reject(new Error("设备服务器未连接"));
        return;
      }
      // 检查是否已完成握手
      if (!this.isHandShaked) {
        reject(new Error("设备服务器未完成握手"));
        return;
      }

      try {
        console.log(controlInfo, "controlInfo");
        console.log(JSON.stringify(controlInfo), "JSON.stringify(controlInfo)");
        // 发送控制指令
        this.ws!.send(JSON.stringify(controlInfo));
      } catch (error) {
        reject(error);
      }
    });
  }

  // 启动心跳定时器，定期发送 ping 消息
  private startHeartbeat(hbInterval: number): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        // 发送心跳 ping
        this.ws.send("ping");
        this.pingTimer = setTimeout(() => {
          console.log("pingTimer");
          this.disconnect();
          this.attemptReconnect();
        }, 5000);
      }
    }, hbInterval);
  }

  // 停止心跳定时器
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 添加握手方法
  public async handShake(hsMess: HandShakeMessage): Promise<HandShakeResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("设备服务器未连接"));
        return;
      }

      // 设置超时
      this.handShakeTimer = setTimeout(() => {
        this.handShakeResolve = null; // 清除回调
        reject(new Error("握手超时"));
      }, 10000); // 10秒超时

      // 保存resolve回调
      this.handShakeResolve = resolve;

      try {
        const handShakeMessage: HandShakeMessage = hsMess;
        console.log("发送握手消息:", handShakeMessage);
        this.ws!.send(JSON.stringify(handShakeMessage));
      } catch (error) {
        this.handShakeResolve = null; // 清除回调
        clearTimeout(this.handShakeTimer);
        this.handShakeTimer = null;
        reject(error);
      }
    });
  }

  // 尝试重连设备服务器
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `尝试重连设备服务器 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      // 按照重连次数递增延迟重连
      setTimeout(() => {
        this.connect().catch(console.error);
      }, (this.options.reconnectInterval || 1000) * this.reconnectAttempts);
    } else {
      console.error("设备服务器重连次数已达上限");
    }
  }

  // 主动断开连接
  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log("进入设备服务器disconnect if");
    }
    console.log("进入设备服务器disconnect else");
    this.isConnected = false;
  }

  // 获取当前连接状态
  public get connected(): boolean {
    return this.isConnected;
  }
}
