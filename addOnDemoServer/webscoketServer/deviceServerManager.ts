import {
  DeviceServerClient,
  DeviceStatusUpdateCallback,
} from "./deviceWsServer";
import type {
  HandShakeMessage,
  HandShakeResponse,
} from "../ts/interface/IWebsocket";
import axios from "axios";
import type { IWsAddressRes } from "../ts/interface/IWsAddress";
import { env } from "../ts/env";

export class DeviceServerManager {
  private static instance: DeviceServerManager;
  private deviceServer: DeviceServerClient | null = null;
  private isInitialized = false;
  private deviceStatusUpdateCallback: DeviceStatusUpdateCallback | null = null; // 设备响应回调函数

  private constructor() {}

  public static getInstance(): DeviceServerManager {
    if (!DeviceServerManager.instance) {
      DeviceServerManager.instance = new DeviceServerManager();
    }
    return DeviceServerManager.instance;
  }

  // 设置设备响应回调函数
  public setDeviceStatusUpdateCallback(
    callback: DeviceStatusUpdateCallback
  ): void {
    this.deviceStatusUpdateCallback = callback;
    // 如果设备服务器已经初始化，立即设置回调
    if (this.deviceServer) {
      this.deviceServer.setDeviceStatusUpdateCallback(callback);
    }
  }

  // 初始化设备服务器连接
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("设备服务器管理器已经初始化");
      return;
    }

    try {
      // 获取设备服务器地址
      const res = await axios.get<any, IWsAddressRes>(
        `https://${env.DISPATCH_WEBSOCKET_ADDRESS}/dispatch/app`
      );

      console.log("获取到设备服务器地址:", res.data.IP);

      // 创建设备服务器客户端
      this.deviceServer = new DeviceServerClient(
        `wss://${res.data.IP}/api/ws`,
        {
          rejectUnauthorized: false,
          maxReconnectAttempts: 5,
          reconnectInterval: 1000,
        }
      );

      // 设置设备响应回调函数
      if (this.deviceStatusUpdateCallback) {
        this.deviceServer.setDeviceStatusUpdateCallback(
          this.deviceStatusUpdateCallback
        );
      }

      // 连接到设备服务器
      await this.deviceServer.connect();

      this.isInitialized = true;
      console.log("设备服务器管理器初始化成功");
    } catch (error) {
      console.error("设备服务器管理器初始化失败:", error);
      throw error;
    }
  }

  // 获取设备服务器实例
  public getDeviceServer(): DeviceServerClient | null {
    return this.deviceServer;
  }

  // 检查设备服务器是否已连接
  public isConnected(): boolean {
    return this.deviceServer?.connected || false;
  }

  // 执行握手
  public async performHandshake(
    handshakeMessage: HandShakeMessage
  ): Promise<HandShakeResponse> {
    if (!this.deviceServer) {
      throw new Error("设备服务器未初始化");
    }

    if (!this.deviceServer.connected) {
      throw new Error("设备服务器未连接");
    }

    try {
      const response = await this.deviceServer.handShake(handshakeMessage);
      console.log("握手成功:", response);
      return response;
    } catch (error) {
      console.error("握手失败:", error);
      throw error;
    }
  }

  // 发送设备控制指令
  public async sendDeviceControl(controlMessage: any): Promise<any> {
    if (!this.deviceServer) {
      throw new Error("设备服务器未初始化");
    }

    if (!this.deviceServer.connected) {
      throw new Error("设备服务器未连接");
    }

    try {
      const response = await this.deviceServer.sendDeviceControl(
        controlMessage
      );
      return response;
    } catch (error) {
      console.error("设备控制失败:", error);
      throw error;
    }
  }

  // 断开连接
  public disconnect(): void {
    if (this.deviceServer) {
      this.deviceServer.disconnect();
      this.deviceServer = null;
    }
    this.isInitialized = false;
  }
}

// 导出单例实例
export const deviceServerManager = DeviceServerManager.getInstance();
