import { useCallback, useState } from "react";

import close from "@/assets/images/icon/close.svg";

import LoginForm from "./LoginForm";
export type FormType = 0 | 2;

export const Login = () => {
  // 0login 2register
  const [formType, setFormType] = useState<FormType>(0);
  window.electronAPI?.ipcInvoke("setSize", {
    h: 400,
    w: 280,
  });

  return (
    <div className=" relative flex flex-col">
      <div className=" absolute flex ">
        <img
          onClick={() => window.electronAPI?.ipcInvoke("closeWindow")}
          src={close}
          alt="close"
          className="ml-[10px] mt-[10px] h-[12px] w-[12px] "
        />
      </div>
      <div className="flex  h-svh items-center  justify-center">
        {formType === 0 && <LoginForm />}
      </div>
    </div>
  );
};
