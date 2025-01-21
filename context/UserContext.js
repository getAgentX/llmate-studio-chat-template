import { useSession } from "next-auth/react";
import React, { createContext, useContext, useState } from "react";
import { Tooltip } from "react-tooltip";
import Intercom from "@intercom/messenger-js-sdk";
import mixpanel from "mixpanel-browser";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);

  const session = useSession();

  Intercom({
    app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
    user_id: session?.data?.user.id,
    name: session?.data?.user.name,
    email: session?.data?.user.email,
    created_at: session?.data?.user.createdAt || "",
  });

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    debug: true,
    track_pageview: true,
    persistence: "localStorage",
  });

  return (
    <UserContext.Provider value={{ isPremium, setIsPremium }}>
      {children}
      <Tooltip
        id="tooltip"
        style={{
          backgroundColor: "#2B2D32",
          color: "#ffffff",
          zIndex: 1000,
          opacity: 1,
          fontWeight: 600,
        }}
        className="opacity"
      />
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
