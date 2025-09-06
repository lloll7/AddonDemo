import type {
  ServerMessage,
  ClientMessage,
  WebSocketConfig,
  WebSocketHandlers,
  DeviceControlMessage,
} from "@/ts/interface/IWebsocket";

export class WebSocketClient {
  /** WebSocket 实例 */
  private ws: WebSocket | null = null;
  /** WebSocket 配置参数 */
  private config: WebSocketConfig;
  /** 事件处理器 */
  private handlers: WebSocketHandlers = {};
  /** 当前重连尝试次数 */
  private reconnectAttempts = 0;
  /** 心跳定时器 */
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  /** 是否正在连接中 */
  private isConnecting = false;

  /** 是否已连接 */
  public isConnected = false;
  /** 客户端ID */
  public clientId: number | null = null;

  constructor(config: WebSocketConfig) {
    this.config = {
      heartbeatInterval: 25000,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      ...config,
    };
  }

  //连接ws服务器
  public connect() {
    if (this.isConnected || this.isConnecting) return;
    this.isConnecting = true;
    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventHandlets();
    } catch (error) {
      console.error("创建ws连接失败", error);
      this.isConnecting = false;
    }
  }
  // 处理事件处理器函数
  public setupEventHandlets() {
    if (!this.ws) return;
    this.ws.onopen = (event) => {
      console.log("ws连接已建立");
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    // 接收服务推送的消息
    this.ws.onmessage = (event) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error("解析消息失败：", error);
      }
    };
    // ws连接关闭回调
    this.ws.onclose = (event) => {
      console.log("ws连接已关闭");
      this.isConnected = false;
      this.isConnecting = false;
      this.clientId = null;
      this.stopHeartbeat();
      //   this.attemptReconnect();
    };
    // ws连接错误回调
    this.ws.onerror = (error) => {
      console.log("连接错误：", error);
    };
  }

  // 处理服务器消息
  public handleMessage(data: ServerMessage) {
    // 调用外部消息处理器
    if (this.handlers.onMessage) {
      this.handlers.onMessage(data);
    }

    switch (data.type) {
      case "welcome":
        this.clientId = data.id || null;
        console.log(`${data.message}, 客户端ID为：${this.clientId}`);
        break;
      case "pong":
        console.log(`心跳响应，timestamp: ${data.timestamp}`);
        break;
      case "broadcast":
        console.log(`收到推送消息：${data.message}`);
        break;
      case "device_update":
        console.log(`收到设备更新消息：`, data.message);
        break;
      case "echo":
        console.log(`收到默认消息: ${data.originalMessage}`);
        break;
      case "error":
        console.error(`服务器错误: ${data.message}`);
        break;
      default:
        console.log(`未知消息：${data}`);
    }
  }
  // 发送消息到服务器
  public send(data: ClientMessage | string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.ws.send(message);
      return true;
    } else {
      console.log("ws未连接，无法发送消息");
      return false;
    }
  }
  // 发送心跳
  public sendPing() {
    return this.send({
      type: "ping",
      timestamp: Date.now(),
    });
  }
  //  发送广播消息
  public sendBroadcast(message: string) {
    return this.send({
      type: "broadcast",
      message: message,
      timestamp: Date.now(),
    });
  }
  // 断开连接
  public disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.clientId = null;
  }
  // 尝试重连
  //   private attemptReconnect(): void {
  //     if (this.reconnectAttempts < this.config.maxReconnectAttempts!) {
  //       this.reconnectAttempts++;
  //       console.log(`尝试重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

  //       setTimeout(() => {
  //         this.connect();
  //       }, this.config.reconnectDelay! * this.reconnectAttempts);
  //     } else {
  //       console.error("重连次数已达上限");
  //     }
  //   }

  // 开始心跳
  public startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.sendPing();
      }
    }, this.config.heartbeatInterval);
  }
  // 停止心跳
  public stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  public changeDeviceStatus(device: DeviceControlMessage) {
    return this.send({
      type: "device_control",
      message: device,
      timestamp: Date.now(),
    });
  }
  /**
   * 设置连接事件处理器
   */
  public onConnect(handler: (event: Event) => void): this {
    this.handlers.onConnect = handler;
    return this;
  }
  /**
   * 设置消息事件处理器
   */
  public onMessage(handler: (data: ServerMessage) => void): this {
    this.handlers.onMessage = handler;
    return this;
  }

  /**
   * 设置断开连接事件处理器
   */
  public onDisconnect(handler: (event: CloseEvent) => void): this {
    this.handlers.onDisconnect = handler;
    return this;
  }

  /**
   * 设置错误事件处理器
   */
  public onError(handler: (error: Event) => void): this {
    this.handlers.onError = handler;
    return this;
  }

  /**
   * 获取连接状态
   */
  public get readyState(): number {
    return this.ws?.readyState || WebSocket.CONNECTING;
  }
}
