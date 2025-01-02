import { App as AntdApp, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { RouterProvider } from "react-router-dom";

import { getAd } from "@/api/login2";

import AntdGlobalComp from "./AntdGlobalComp";
import router from "./routes";
import { useUserStore } from "./store";

function App() {
  const locale = useUserStore((state) => state.appSettings.locale);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  const timer = setInterval(() => {
    getAd().then((res) => {
      console.log(res, "res");
      const ip = res.ips[0];
      const img = new Image();
      img.src = `http://${ip}`;

      img.onload = function () {
        localStorage.setItem("ad", JSON.stringify(res));
        clearInterval(timer);

        localStorage.setItem("wsUrl", `ws://${ip}:10001`);
        localStorage.setItem("apiUrl", `http://${ip}:10002`);
        localStorage.setItem("chatUrl", `http://${ip}:10008`);

        console.log(`${ip}is good`);
      };
      img.onerror = function () {
        localStorage.setItem("ad", JSON.stringify(res));

        clearInterval(timer);
        console.log(`${ip}is good`);
      };
    });
  }, 5000);

  return (
    <ConfigProvider
      button={{ autoInsertSpace: false }}
      locale={locale === "zh-CN" ? zhCN : enUS}
      theme={{
        token: { colorPrimary: "#0089FF" },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>loading...</div>}>
          <AntdApp>
            <RouterProvider router={router} />
          </AntdApp>
        </Suspense>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
