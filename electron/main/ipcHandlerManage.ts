import { app, ipcMain } from "electron";
import { closeWindow, minimize, splashEnd, updateMaximize ,setWindowSize } from "./windowManage";
import { IpcRenderToMain } from "../constants";
import { getStore } from "./storeManage";
import { changeLanguage } from "../i18n";
import {  encryptData ,decryptData ,getSignature ,decryptedByAd} from "../utils"
import os from 'os';
const store = getStore();

export const setIpcMainListener = () => {
  // window manage
  ipcMain.handle("changeLanguage", (_, locale) => {
    store.set("language", locale);
    changeLanguage(locale).then(() => {
      app.relaunch();
      app.exit(0);
    });
  });
  ipcMain.handle("main-win-ready", () => {
    splashEnd();
  });

  ipcMain.handle(IpcRenderToMain.getSignature, async (e,{ data }) => {
    return getSignature( data);
  });
  ipcMain.handle(IpcRenderToMain.getSystemInfo, async (e,data) => {
     return {
       platform: os.platform(),
       // cpu: os.cpus(),
       // release: os.release(),
       hostname: os.hostname(),
       // version: os.version(),
       type: os.type(),
       // uptime: os.uptime(),
       // totalmem:os.totalmem(),
       // userInfo: os.userInfo(),
       // networkInterfaces: os.networkInterfaces()
     };
  });


  ipcMain.handle(IpcRenderToMain.getDecryptedByAd, async (e,{ data }) => {
    return decryptedByAd( data );
  });

  ipcMain.handle(IpcRenderToMain.setSize, async (e,{ w,h }) => {
    return setWindowSize( w,h)
  });

  ipcMain.handle(IpcRenderToMain.getDecrypted, async (e,{ data }) => {
    if (typeof data === 'string') {
      return JSON.parse(decryptData( data.trim()));
    } else {
      return data;
    }
  });

  ipcMain.handle(IpcRenderToMain.getEncrypted, async (e,{ data }) => {
    if (typeof data === 'string') {
      return encryptData( data);
    } else {
      return data;
    }
  });

  ipcMain.handle(IpcRenderToMain.minimizeWindow, () => {
    minimize();
  });
  ipcMain.handle(IpcRenderToMain.maxmizeWindow, () => {
    updateMaximize();
  });
  ipcMain.handle(IpcRenderToMain.closeWindow, () => {
    closeWindow();
  });
  ipcMain.handle(IpcRenderToMain.setKeyStore, (_, { key, data }) => {
    store.set(key, data);
  });
  ipcMain.handle(IpcRenderToMain.getKeyStore, (_, { key }) => {
    return store.get(key);
  });
  ipcMain.on(IpcRenderToMain.getKeyStoreSync, (e, { key }) => {
    e.returnValue = store.get(key);
  });
  ipcMain.on(IpcRenderToMain.getDataPath, (e, key: string) => {
    switch (key) {
      case "public":
        e.returnValue = global.pathConfig.publicPath;
        break;
      default:
        e.returnValue = global.pathConfig.publicPath;
        break;
    }
  });
};
