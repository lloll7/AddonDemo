export interface IWsAddress {
  error: number;
  reason: string;
  IP: string;
  port: number;
  domain: string;
}

export interface IWsAddressRes {
  data: IWsAddress;
}
