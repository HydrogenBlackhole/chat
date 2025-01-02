import * as ExifReader from "exifreader";
import { Buffer } from "buffer";
import path from "node:path";
import crypto from "crypto";
import CryptoJS from "crypto-js";
export const isLinux = process.platform == "linux";
export const isWin = process.platform == "win32";
export const isMac = process.platform == "darwin";
export const isProd = !process.env.VITE_DEV_SERVER_URL;

export const getSignature = async (timestamp: {
  toString: () => WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>;
}) => {
  const dataToSign = Buffer.from(timestamp.toString());
  return crypto.createHash("sha256").update(dataToSign).digest("hex");
};

const getKey = async ()=>{
  let src = path.dirname(path.dirname(__dirname)) + "/public/icons/icon.png";

  const tags = await ExifReader.load(src);
  let ss = '';
  tags.UserComment.value.forEach((comment: number) => {
    ss += String.fromCharCode(comment);
  });
  return JSON.parse(ss).ad
}



export const encryptData = (data: any) => {
  var Key = CryptoJS.enc.Utf8.parse("CHUXINGJIA2022!D"); // 1. Replace C by CryptoJS
  var IV = CryptoJS.enc.Utf8.parse("PaqegcGanjhyDctl");
  var encryptedText = CryptoJS.AES.encrypt(data, Key, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encryptedText.toString(CryptoJS.format.Base64); // 2. Use Base64 instead of Hex
};


export const decryptData = (encryptedData: any) => {
  let C = CryptoJS;
  let Key = C.enc.Utf8.parse("CHUXINGJIA2022!D");
  let IV = C.enc.Utf8.parse("PaqegcGanjhyDctl");
  //var decryptedText = C.AES.encrypt(encryptedData, Key, {
  // console.log(encryptedData ,typeof encryptedData,'encryptedData')
  // let newStr = encryptedData.trim();
  let decryptedText = C.AES.decrypt(encryptedData, Key, {
    // 4. Use decrypt instead of encrypt
    iv: IV,
    mode: C.mode.CBC,
    padding: C.pad.Pkcs7,
  });
  return decryptedText.toString(CryptoJS.enc.Utf8); // 2. Use Base64 instead of Hex
};




// 解密 AES 密文
function aesDecrypt(encryptedText: any, key: any, iv: any) {
  // 解码密钥和 IV
  const decodedKey = CryptoJS.enc.Base64.parse(key);
  const decodedIv = CryptoJS.enc.Base64.parse(iv);
  // 解密
  const decrypted = CryptoJS.AES.decrypt(encryptedText, decodedKey, {
    iv: decodedIv,
    padding: CryptoJS.pad.Pkcs7,
  });
  // 返回解密后的明文
  return decrypted.toString(CryptoJS.enc.Utf8);
}


// 解密 API 响应
export const decryptedByAd =async (cryptText: { split: (arg0: string) => [any, any] }) => {
  // 分割密文和 IV
  const [encryptedText, encodedIv] = cryptText.split("|");
  // 解密
  const decryptedText = aesDecrypt(encryptedText,await getKey(), encodedIv);
  // 返回解密后的 JSON 对象
  return JSON.parse(decryptedText);
};


