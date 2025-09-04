export interface IThing {
  deviceId: string;
  deviceName: string;
  displayCategory: string;
  familyName: string;
  isMyAccount: boolean;
  isOnline: boolean;
  isSupported: boolean;
  isSynced: boolean;
  networkProtocol?: string;
  subDeviceNum?: number;
  params?: any;
  serial_number?: string;
}

export interface IThingParams {
  childLock?: boolean;
  workMode?: string;
}
