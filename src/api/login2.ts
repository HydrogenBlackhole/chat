import type { MessageReceiveOptType } from "@openim/wasm-client-sdk";
import { AxiosInstance } from "axios";
import { Buffer } from "buffer";
import crypto from "crypto";
import { useMutation, useQuery } from "react-query";
import { v4 as uuidv4 } from "uuid";

import { useUserStore } from "@/store";
import { ApiResponse, AppConfig } from "@/store/type";
import createAxiosInstance from "@/utils/request";
import { getChatToken } from "@/utils/storage";

import { errorHandle } from "./errorHandle";

let request: AxiosInstance;
const platform = window.electronAPI?.getPlatform() ?? 5;
const IpData: NonNullable<unknown> = JSON.parse(<string>localStorage.getItem("ad"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
if (typeof IpData === "object" && typeof IpData !== "undefined") {
  request = createAxiosInstance(`http://${IpData.ips[0]}:1090`);
} else {
  request = createAxiosInstance("http://110.40.58.201:1090");
}

const getAreaCode = (code?: string) =>
  code ? (code.includes("+") ? code : `+${code}`) : code;

// Send verification code
export const useSendSms = () => {
  return useMutation(
    (params: API.Login.SendSmsParams) =>
      request.post(
        "/account/code/send",
        {
          ...params,
        },
        {
          headers: {
            operationID: uuidv4(),
          },
        },
      ),
    {
      onError: errorHandle,
    },
  );
};

// Verify mobile phone number
export const useVerifyCode = () => {
  return useMutation(
    (params: API.Login.VerifyCodeParams) =>
      request.post(
        "/account/code/verify",
        {
          ...params,
          areaCode: getAreaCode(params.areaCode),
        },
        {
          headers: {
            operationID: uuidv4(),
          },
        },
      ),
    {
      onError: errorHandle,
    },
  );
};

// register
export const useRegister = () => {
  return useMutation(
    (params: API.Login.DemoRegisterType) =>
      request.post<{ chatToken: string; imToken: string; userID: string }>(
        "/account/register",
        {
          ...params,
          user: {
            ...params.user,
            areaCode: getAreaCode(params.user.areaCode),
          },
          platform,
        },
        {
          headers: {
            operationID: uuidv4(),
          },
        },
      ),
    {
      onError: errorHandle,
    },
  );
};

// reset passwords
export const useReset = () => {
  return useMutation(
    (params: API.Login.ResetParams) =>
      request.post(
        "/account/password/reset",
        {
          ...params,
          areaCode: getAreaCode(params.areaCode),
        },
        {
          headers: {
            operationID: uuidv4(),
          },
        },
      ),
    {
      onError: errorHandle,
    },
  );
};

// change password
export const modifyPassword = async (params: API.Login.ModifyParams) => {
  const token = (await getChatToken()) as string;
  return request.post(
    "/account/password/change",
    {
      ...params,
    },
    {
      headers: {
        token,
        operationID: uuidv4(),
      },
    },
  );
};

// Get user information
export interface BusinessUserInfo {
  userID: string;
  password: string;
  account: string;
  phoneNumber: string;
  areaCode: string;
  email: string;
  nickname: string;
  faceURL: string;
  gender: number;
  level: number;
  birth: number;
  allowAddFriend: BusinessAllowType;
  allowBeep: BusinessAllowType;
  allowVibration: BusinessAllowType;
  globalRecvMsgOpt: MessageReceiveOptType;
}

export enum BusinessAllowType {
  Allow = 1,
  NotAllow = 2,
}

export const getBusinessUserInfo = async (userIDs: string[]) => {
  const token = (await getChatToken()) as string;
  return request.post<{ users: BusinessUserInfo[] }>(
    "/user/find/full",
    {
      userIDs,
    },
    {
      headers: {
        operationID: uuidv4(),
        token,
      },
    },
  );
};

export const searchBusinessUserInfo = async (keyword: string) => {
  const token = (await getChatToken()) as string;
  return request.post<{ total: number; users: BusinessUserInfo[] }>(
    "/user/search/full",
    {
      keyword,
      pagination: {
        pageNumber: 1,
        showNumber: 1,
      },
    },
    {
      headers: {
        operationID: uuidv4(),
        token,
      },
    },
  );
};

interface UpdateBusinessUserInfoParams {
  email: string;
  nickname: string;
  faceURL: string;
  gender: number;
  birth: number;
  allowAddFriend: number;
  allowBeep: number;
  allowVibration: number;
  globalRecvMsgOpt: number;
}

export const updateBusinessUserInfo = async (
  params: Partial<UpdateBusinessUserInfoParams>,
) => {
  const token = (await getChatToken()) as string;
  return request.post<unknown>(
    "/user/update",
    {
      ...params,
      userID: useUserStore.getState().selfInfo?.userID,
    },
    {
      headers: {
        operationID: uuidv4(),
        token,
      },
    },
  );
};

export const getAppConfig = () =>
  request.post<{ config: AppConfig }>(
    "/client_config/get",
    {},
    {
      headers: {
        operationID: uuidv4(),
      },
    },
  );

export const useLogin = () => {
  return request.post<unknown>(
    `/api/v2.Login/loginQrcode`,
    {},
    {
      headers: {
        operationID: uuidv4(),
      },
    },
  );
};

export const loginPc = async (params: any) => {
  const os = await window.electronAPI?.ipcInvoke("getSystemInfo");
  return request.post<unknown>(
    `/api/v2.Login/loginPc`,
    {
      ...params,
    },
    {
      headers: {
        os: os.type,
        brand: os.hostname,
        operationID: uuidv4(),
      },
    },
  );
};

export const getAd = async () => {
  const timestamp = new Date().getTime();
  const expectedSignature = await window.electronAPI?.ipcInvoke("getSignature", {
    data: timestamp,
  });
  const request = createAxiosInstance("http://110.40.33.122:5889");
  return request.post<unknown>(
    "/api/ad/get_ad",
    {
      timestamp: timestamp,
      signature: expectedSignature,
    },
    {
      headers: {
        operationID: uuidv4(),
      },
    },
  );
};
