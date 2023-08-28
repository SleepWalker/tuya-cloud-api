/**
 * NOTE: this file should have *.ts extension instead of *.d.ts otherwise
 * typescript will skip it during build
 */
export interface BaseResponse<R> {
  result: R;
  success: boolean;
  t: number; // timestamp
}

export type TokenResponse = BaseResponse<{
  access_token: string;
  expire_time: number; // seconds
  refresh_token: string;
  uid: string;
}>;

export interface DeviceFunctions {
  category: 'cz' | string;
  functions: {
    code: string;
    desc: string;
    name: string;
    type: 'Boolean' | 'Integer' | string;
    values: string; // json
  }[];
}

export type FunctionsResponse = BaseResponse<DeviceFunctions>;

export type DeviceWithFunctions = Device & {
  functions: DeviceFunctions;
};

export interface DeviceFunctionStatus {
  code: string; // 'switch_1'
  value: any;
}

export interface Device {
  active_time: number;
  biz_type: number;
  category: 'cz' | string;
  create_time: number;
  icon: string;
  id: string;
  ip: string;
  local_key: string;
  name: string; // 'Notebook';
  online: boolean;
  owner_id: string;
  product_id: string;
  product_name: string;
  status: DeviceFunctionStatus[];
  sub: boolean;
  time_zone: string; // '+03:00';
  uid: string;
  update_time: number; // 1589821300;
  uuid: string;
}

export type DeviceResponse = BaseResponse<Device>;

export type DeviceListResponse = BaseResponse<Device[]>;

export type DeviceStatusResponse = BaseResponse<DeviceFunctionStatus[]>;

export type DeviceCommandsResponse = BaseResponse<boolean>;
