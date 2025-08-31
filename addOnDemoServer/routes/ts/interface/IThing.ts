export interface IThingParams {
  lang?: string;
  familyid?: string;
  num?: number;
  beginIndex?: number;
}

export interface IThing {
  name: string;
  deviceid: string;
  apikey: string;
  extra: object;
  brandName: string;
  brandLogo: string;
  showBrand: boolean;
  productModel: string;
  family: any;
  devicekey: string;
  online: boolean;
  devGroups?: object[];
  tags?: object;
  devConfig?: object;
  settings?: object;
  sharedBy?: object;
  shareTo?: object[];
  params?: object;
  gsmInfoData?: object;
}

export interface IThingListItem {
  index: number;
  itemData: IThing;
  itemType: number;
}

export interface IThingList {
  thingList: IThingListItem[];
}

export interface frontThing {
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
}

export interface IThingFamilyItem {
  id: string;
  apikey: string;
  name: string;
  index: number;
  roomList: any;
  familyType: number;
  members: any;
}

export interface IThingFamilyList {
  familyList: IThingFamilyItem[];
}
