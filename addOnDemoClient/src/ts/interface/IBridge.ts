export interface BridgeToken {
  error: number;
  data: any;
  message?: string;
}

export interface DRResponse {
  header: DRResheaderObject;
  payload: any;
}

export interface serialNumberItem {
  serial_number: string;
  third_serial_number: string;
}

export interface DRResheaderObject {
  name: string;
  message_id: string;
  version: string;
}
