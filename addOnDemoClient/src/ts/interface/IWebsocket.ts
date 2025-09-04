export interface DeviceControlMessage {
  action: "update";
  apikey: string;
  selfApiKey?: string;
  deviceid: string;
  params: any;
  userAgent: string;
  sequence: string;
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
}

// 服务器发送的消息结构
export interface ServerMessage {
  // 消息类型
  type: string;
  // 消息内容（可选）
  message?: string | DeviceResponseMessage | DeviceStatusUpdateMessage;
  // 消息ID（可选）
  id?: number;
  // 时间戳
  timestamp: number;
  // 发送者ID（可选）
  from?: number;
  // 原始消息内容（可选，类型为any）
  originalMessage?: any;
}

// 客户端发送的消息结构
export interface ClientMessage {
  // 消息类型
  type: "ping" | "broadcast" | "device_control"; // 心跳、广播消息
  // 消息内容（可选）
  message?: string | DeviceControlMessage;
  // 时间戳（可选）
  timestamp?: number;
}

// WebSocket配置参数
export interface WebSocketConfig {
  // 服务器URL
  url: string;
  // 心跳间隔（毫秒，可选，默认25000）
  heartbeatInterval?: number;
  // 最大重连次数（可选，默认5）
  maxReconnectAttempts?: number;
  // 重连延迟（毫秒，可选，默认1000）
  reconnectDelay?: number;
}

// WebSocket事件处理器接口
export interface WebSocketHandlers {
  // 连接建立回调（可选）
  onConnect?: (event: Event) => void;
  // 收到消息回调（可选）
  onMessage?: (data: ServerMessage) => void;
  // 连接断开回调（可选）
  onDisconnect?: (event: CloseEvent) => void;
  // 发生错误回调（可选）
  onError?: (error: Event) => void;
}
