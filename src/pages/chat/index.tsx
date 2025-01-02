import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import ConversationSider from "./ConversationSider";

export const Chat = () => {
  window.electronAPI?.ipcInvoke("setSize", {
    h: 600,
    w: 880,
  });
  return (
    <Layout className="flex-row">
      <ConversationSider />
      <Outlet />
    </Layout>
  );
};
