// service/deviceWsServer.ts
import { WebSocket } from "ws";
import https from "https";
import type {
  DeviceControlMessage,
  DeviceResponseMessage,
  HandShakeResponse,
  HandShakeMessage,
} from "../ts/interface/IWebsocket";

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
        this.ws.onopen = () => {
          console.log("设备服务器连接成功");
          this.isConnected = true;
          this.reconnectAttempts = 0; // 重置重连次数
          this.startHeartbeat(); // 启动心跳
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
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("收到设备服务器响应:", parsedData);

      // 判断是否为设备响应消息（含 error 字段）
      if (parsedData.error !== undefined) {
        // 这是一个设备响应消息
        this.handleDeviceResponse(parsedData);
      }
    } catch (error) {
      console.error("处理设备服务器消息失败:", error);
    }
  }

  // 处理设备响应消息（可扩展业务逻辑）
  private handleDeviceResponse(response: DeviceResponseMessage): void {
    console.log("设备响应:", response);
    // 这里可以添加响应处理逻辑
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
        // 发送控制指令
        this.ws!.send(JSON.stringify(controlInfo));
      } catch (error) {
        reject(error);
      }
    });
  }

  // 启动心跳定时器，定期发送 ping 消息
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        // 发送心跳 ping
        this.ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      }
    }, 25000); // 每 25 秒发送一次
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

      try {
        const handShakeMessage: HandShakeMessage = hsMess;

        console.log("发送握手消息:", handShakeMessage);
        this.ws!.send(JSON.stringify(handShakeMessage));
      } catch (error) {
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
    }
    this.isConnected = false;
  }

  // 获取当前连接状态
  public get connected(): boolean {
    return this.isConnected;
  }
}
