// 网关
export interface BridgeToken {
  error: number;
  data: tokenData;
  message?: string;
}

export interface tokenData {
  token: string;
  app_name?: string;
}

export interface ResonseDeviceList {
  device_list: ResonseDeviceObject[];
}

export interface ResonseDeviceObject {
  serial_number: string; // 设备唯一id，必填
  third_serial_number?: string; // 三方设备唯一序列号，选填（三方设备接入时为N，否则为Y）
  service_address?: string; // 三方设备服务地址，选填（三方设备接入时为N，否则为Y）
  name: string; // 设备名称，必填，未改名时由前端根据默认显示规则进行展示
  manufacturer: string; // 制造商，必填
  model: string; // 设备产品型号，必填
  firmware_version: string; // 固件版本，必填，可以为空字符串
  hostname?: string; // 设备hostname，选填
  mac_address?: string; // 设备MAC地址，选填
  app_name?: string; // 所属应用名称，选填。若获取开放接口凭证时填写了app_name，则后续通过该凭证接入的设备均会写入该字段
  display_category: string; // 设备分类，必填
  capabilities: CapabilityObject[]; // 能力列表，必填
  protocol?: string; // 设备协议，选填（三方设备接入时为Y，否则为N），如"zigbee"|"onvif"|"rtsp"|"esp32-cam"
  state?: Record<string, any>; // 设备状态对象，选填。不同capabilities的state示例请看【支持设备能力】
  tags?: Record<string, any>; // json格式key-value，自定义设备信息，选填。可用于存储设备通道、温度单位、其他三方设备自定义信息等
  online: boolean; // 在线状态，必填。true为在线，false为离线
  subnet?: boolean; // 是否与网关在同一子网，选填
}
export interface CapabilityObject {
  capability: string; // 必填，能力名称。详情可见 支持设备能力
  permission: "read" | "write" | "readWrite"; // 必填，能力权限。可选值为“read”（可读）、“write”（可写）、“readWrite”（可读写）
  settings?: object; // 选填，能力设置信息。目前camera-stream有使用，详情见支持设备能力
  name?: string; // 选填，toggle里的name字段。用于标识多通道设备的子通道序号。例如，name为1，表示通道1
}
/** 三方请求网关接口 */
// 同步新设备-设备能力对象
export interface DRCapabilityObject {
  capability: string;
  permission: string;
  name?: string;
  settings?: any;
}
// 请求头结构信息
export interface HeaderObject {
  name: string; // 可选参数：DiscoveryRequest 同步新设备 DeviceStatesChangeReport 设备状态更新上报 DeviceOnlineChangeReport 设备上下线状态上报 DeviceInformationUpdatedReport 同步设备信息更新上报
  message_id: string; // 请求消息ID
  version: string; // 请求协议版本号，当前固定为 2
}
// 请求终端结构信息
export interface EndpointObject {
  serial_number: string; // 设备唯一id
  third_serial_number: string; // 三方设备唯一序列号
  tags?: object; // json格式的key-value值，用来存储设备相关的会话信息
}
// 同步新设备-请求负载结构信息
export interface DREndPointsObject {
  third_serial_number: string; // N，三方设备唯一序列号
  name: string; // N，设备名称
  display_category: string; // N，设备分类。详情可看支持的设备分类部分。三方设备暂不支持添加摄像头。
  capabilities: DRCapabilityObject[]; // N，能力列表。详情可看支持的设备能力部分。
  state: Record<string, any>; // N，初始状态信息
  manufacturer: string; // N，制造商
  model: string; // N，设备产品型号
  firmware_version: string; // N，固件版本
  service_address: string; // N，服务地址。例如, http://<domain name or ip address>/。考虑到设备局域网内IP变化导致地址无效，建议使用mDns发布服务，用域名代替IP。
  tags?: object; // Y，json格式key-value，自定义设备信息。可用来存储设备通道、温度单位、其他三方自定义数据
}
/** 网关响应数据结构 */
export interface DRResponse {
  header: DRResheaderObject;
  payload: any;
}
export interface DRResheaderObject {
  name: string;
  message_id: string;
  version: string;
}
export interface DRPayloadObject {
  state?: any;
  endpoints?: DREndPointsObject[];
  online?: boolean;
}
// 事件对象（event）
export interface EventObject {
  header: HeaderObject;
  endpoint?: EndpointObject;
  payload: DRPayloadObject;
}
// 请求最终提交参数
export interface finalParam {
  event: EventObject;
}
