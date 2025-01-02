import { t } from "i18next";
import jrQrcode from "jr-qrcode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BusinessUserInfo } from "@/api/login";
import { loginPc, useLogin } from "@/api/login2";
import { useUserStore } from "@/store";
import { setIMProfile } from "@/utils/storage";

const LoginForm = () => {
  const navigate = useNavigate();
  const [base64Image, setBase64Image] = useState();
  const selfInfo = useUserStore((state) => state.selfInfo);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLogin().then((data2) => {
      // @ts-ignore
      const { data } = data2;
      // @ts-ignore
      setBase64Image(jrQrcode.getQrBase64(JSON.stringify(data)));
      const loginPcStatus = setInterval(() => {
        loginPc({
          session_id: data.session_id,
        }).then((res: any) => {
          console.log(res, "resloginPc");
          if (res.status === 200) {
            const {
              chat_token: chatToken,
              im_token: imToken,
              im_user_id: userID,
            } = res.data;
            setIMProfile({ chatToken, imToken, userID });
            navigate("/chat");
            console.log(res, "res loginPcStatus");
            clearInterval(loginPcStatus);
          }
        });
      }, 4000);
    });
  }, []);

  const Qrcode = ({
    base64Image,
    setBase64Image,
  }: {
    base64Image: string;
    setBase64Image: () => void;
  }) => {
    const changeQrcode = (data: any) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useLogin().then((data2) => {
        // @ts-ignore
        const { data } = data2;
        // @ts-ignore
        setBase64Image(jrQrcode.getQrBase64(JSON.stringify(data)));
      });
    };

    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-[16px] text-xl text-[#05c160] ">
          {t("placeholder.qrCodeLogin")}
        </div>
        <img
          src={base64Image}
          alt=""
          className="w-150px h-150px mt-30px"
          onClick={() => changeQrcode()}
        />
      </div>
    );
  };

  const PreLogin = ({ selfInfo }: { selfInfo: BusinessUserInfo }) => {
    const { faceURL, nickname } = selfInfo;
    return (
      <div>
        <div className="mt-[86px] flex items-center justify-center">
          <img src={faceURL} alt="" className="h-[86px] w-[86px]" />
          <span className="mt-[20px] h-[16px] text-[16px]	font-medium text-[#333333] ">
            {nickname}
          </span>
        </div>
        <div className="mt-[70px]">
          <button className="h-[36px] w-[198px] rounded-[4px] bg-[#05C160] ">
            {t("placeholder.login")}
          </button>
        </div>
        <div className="mb-[48px] mt-[23px] flex items-center justify-center">
          <span className="h-18px w-56px text-[14px]	font-normal text-[#63708D] ">
            {t("placeholder.cancelLogin")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {!selfInfo ? (
        <PreLogin selfInfo={selfInfo} />
      ) : (
        <Qrcode base64Image={base64Image} setBase64Image={setBase64Image} />
      )}
    </>
  );
};

export default LoginForm;
