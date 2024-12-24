import { RightOutlined } from "@ant-design/icons";
import { Badge, Divider, Layout, Popover, Upload } from "antd";
import clsx from "clsx";
import i18n, { t } from "i18next";
import { UploadRequestOption } from "rc-upload/lib/interface";
import React, { memo, useRef, useState } from "react";
import ImageResizer from "react-image-file-resizer";
import { UNSAFE_NavigationContext, useResolvedPath } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

import { modal } from "@/AntdGlobalComp";
import { updateBusinessUserInfo } from "@/api/login";
import chats from "@/assets/images/icon/chats.svg";
import chats_active from "@/assets/images/icon/chats_active.svg";
import contacts from "@/assets/images/icon/contacts.svg";
import contacts_active from "@/assets/images/icon/contacts_active.svg";
import guarantee from "@/assets/images/icon/guarantee.svg";
import guarantee_active from "@/assets/images/icon/guarantee_active.svg";
import me from "@/assets/images/icon/me.svg";
import me_active from "@/assets/images/icon/me_active.svg";
import wallet from "@/assets/images/icon/wallet.svg";
import wallet_active from "@/assets/images/icon/wallet_active.svg";
import OIMAvatar from "@/components/OIMAvatar";
import { useContactStore, useConversationStore, useUserStore } from "@/store";
import { feedbackToast } from "@/utils/common";
import emitter from "@/utils/events";

import { OverlayVisibleHandle } from "../../hooks/useOverlayVisible";
import { IMSDK } from "../MainContentWrap";
import About from "./About";
import styles from "./left-nav-bar.module.scss";
import PersonalSettings from "./PersonalSettings";

const { Sider } = Layout;

const NavList = [
  {
    icon: chats,
    icon_active: chats_active,
    path: "/chat",
  },
  {
    icon: contacts,
    icon_active: contacts_active,
    path: "/contacts",
  },
  {
    icon: guarantee,
    icon_active: guarantee_active,
    path: "/guarantee",
  },
  {
    icon: wallet,
    icon_active: wallet_active,
    path: "/wallet",
  },
  {
    icon: me,
    icon_active: me_active,
    path: "/me",
  },
];

const resizeFile = (file: File): Promise<File> =>
  new Promise((resolve) => {
    ImageResizer.imageFileResizer(
      file,
      400,
      400,
      "webp",
      90,
      0,
      (uri) => {
        resolve(uri as File);
      },
      "file",
    );
  });

type NavItemType = (typeof NavList)[0];

const NavItem = ({ nav: { icon, icon_active, path } }: { nav: NavItemType }) => {
  const resolvedPath = useResolvedPath(path);
  const { navigator } = React.useContext(UNSAFE_NavigationContext);

  const toPathname = navigator.encodeLocation
    ? navigator.encodeLocation(path).pathname
    : resolvedPath.pathname;

  const locationPathname = location.pathname;
  const isActive =
    locationPathname === toPathname ||
    (locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === "/") ||
    location.hash.startsWith(`#${toPathname}`);
  const unReadCount = useConversationStore((state) => state.unReadCount);
  const unHandleFriendApplicationCount = useContactStore(
    (state) => state.unHandleFriendApplicationCount,
  );
  const unHandleGroupApplicationCount = useContactStore(
    (state) => state.unHandleGroupApplicationCount,
  );

  const tryNavigate = () => {
    if (isActive) return;
    // TODO Keep answering when jumping back to chat from another page (if there is one)
    navigator.push(path);
  };

  const getBadge = () => {
    if (path === "/chat") {
      return unReadCount;
    }
    if (path === "/contact") {
      return unHandleFriendApplicationCount + unHandleGroupApplicationCount;
    }
    return 0;
  };

  return (
    <Badge size="small" count={getBadge()}>
      <div
        className={clsx(
          "mb-3 flex h-[52px] w-12 cursor-pointer flex-col items-center justify-center rounded-md",
        )}
        onClick={tryNavigate}
      >
        <img width={19} height={21} src={isActive ? icon_active : icon} alt="" />
      </div>
    </Badge>
  );
};

const profileMenuList = [
  {
    title: t("placeholder.myInfo"),
    gap: true,
    idx: 0,
  },
  {
    title: t("placeholder.accountSetting"),
    gap: true,
    idx: 1,
  },
  {
    title: t("placeholder.about"),
    gap: false,
    idx: 2,
  },
  {
    title: t("placeholder.logOut"),
    gap: false,
    idx: 3,
  },
];

i18n.on("languageChanged", () => {
  profileMenuList[0].title = t("placeholder.myInfo");
  profileMenuList[1].title = t("placeholder.accountSetting");
  profileMenuList[2].title = t("placeholder.about");
  profileMenuList[3].title = t("placeholder.logOut");
});

const LeftNavBar = memo(() => {
  const aboutRef = useRef<OverlayVisibleHandle>(null);
  const personalSettingsRef = useRef<OverlayVisibleHandle>(null);
  const [showProfile, setShowProfile] = useState(false);
  const selfInfo = useUserStore((state) => state.selfInfo);
  const userLogout = useUserStore((state) => state.userLogout);
  const updateSelfInfo = useUserStore((state) => state.updateSelfInfo);

  const profileMenuClick = (idx: number) => {
    switch (idx) {
      case 0:
        emitter.emit("OPEN_USER_CARD", { isSelf: true });
        break;
      case 1:
        // if (window.electronAPI) {
        //   openPersonalSettings();
        //   return;
        // }
        personalSettingsRef.current?.openOverlay();
        break;
      case 2:
        // if (window.electronAPI) {
        //   openAbout();
        //   return;
        // }
        aboutRef.current?.openOverlay();
        break;
      case 3:
        tryLogout();
        break;
      default:
        break;
    }
    setShowProfile(false);
  };

  const tryLogout = () => {
    userLogout();

    // modal.confirm({
    //   title: t("placeholder.logOut"),
    //   content: t("toast.confirmlogOut"),
    //   onOk: async () => {
    //     try {
    //       await userLogout();
    //     } catch (error) {
    //       feedbackToast({ error });
    //     }
    //   },
    // });
  };

  const customUpload = async ({ file }: { file: File }) => {
    const resizedFile = await resizeFile(file);
    try {
      const {
        data: { url },
      } = await IMSDK.uploadFile({
        name: resizedFile.name,
        contentType: resizedFile.type,
        uuid: uuidV4(),
        file: resizedFile,
      });
      const newInfo = {
        faceURL: url,
      };
      await updateBusinessUserInfo(newInfo);
      updateSelfInfo(newInfo);
    } catch (error) {
      feedbackToast({ error: t("toast.updateAvatarFailed") });
    }
  };

  const ProfileContent = (
    <div className="w-72 px-2.5 pb-3 pt-5.5">
      <div className="mb-4.5 ml-3 flex items-center">
        <Upload
          accept=".jpeg,.png,.webp"
          showUploadList={false}
          customRequest={customUpload as any}
        >
          <div className={styles["avatar-wrapper"]}>
            <OIMAvatar src={selfInfo.faceURL} text={selfInfo.nickname} />
            <div className={styles["mask"]}>
              {/*<img src={change_avatar} width={19} alt="" />*/}
            </div>
          </div>
        </Upload>
        <div className="flex-1 overflow-hidden">
          <div className="mb-1 truncate text-base font-medium">{selfInfo.nickname}</div>
        </div>
      </div>
      {profileMenuList.map((menu) => (
        <div key={menu.idx}>
          <div
            className="flex cursor-pointer items-center justify-between rounded-md px-3 py-4 hover:bg-[var(--primary-active)]"
            onClick={() => profileMenuClick(menu.idx)}
          >
            <div>{menu.title}</div>
            <RightOutlined rev={undefined} />
          </div>
          {menu.gap && (
            <div className="px-3">
              <Divider className="my-1.5 border-[var(--gap-text)]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Sider
      className="no-mobile border-r border-gray-200 !bg-[#2E2E2E] dark:border-gray-800 dark:!bg-[#141414]"
      width={60}
      theme="light"
    >
      <div className="mt-6 flex flex-col items-center">
        <Popover
          content={ProfileContent}
          trigger="click"
          placement="rightBottom"
          overlayClassName="profile-popover"
          title={null}
          arrow={false}
          open={showProfile}
          onOpenChange={(vis) => setShowProfile(vis)}
        >
          <OIMAvatar
            className="mb-6 cursor-pointer"
            src={selfInfo.faceURL}
            text={selfInfo.nickname}
          />
        </Popover>

        {NavList.map((nav) => (
          <NavItem nav={nav} key={nav.path} />
        ))}
      </div>
      <PersonalSettings ref={personalSettingsRef} />
      <About ref={aboutRef} />
    </Sider>
  );
});

export default LeftNavBar;
