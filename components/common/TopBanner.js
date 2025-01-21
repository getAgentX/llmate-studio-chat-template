// import React, { useState } from "react";
// import Link from "next/link";
// import { useGetOrganizationDetailsQuery } from "@/store/organization";
// import { useSelector } from "react-redux";
// import { currentOrganizationSelector } from "@/store/current_organization";

// const TopBanner = ({ onClose }) => {
//   const currentOrg = useSelector(currentOrganizationSelector);

//   const { data, isLoading, error, refetch, isFetching } =
//     useGetOrganizationDetailsQuery(
//       {
//         organization_id: currentOrg.id,
//       },
//       {
//         skip: !currentOrg.id,
//       }
//     );

//   return (
//     <div className="relative bg-[#295ef4] text-white text-center p-2 flex items-center justify-center h-12">
//       <span>
//         You are using the free version.{" "}
//         <Link
//           href="https://www.llmate.ai/pricing"
//           className="font-bold text-white underline"
//           target="_blank"
//         >
//           Upgrade to Pro
//         </Link>{" "}
//         to access all features.
//       </span>
//       <button className="absolute right-4" onClick={onClose}>
//         <img src="/assets/banner-cross.svg" alt="Close" className="w-6 h-6" />
//       </button>
//     </div>
//   );
// };

// export default TopBanner;

import React, { useEffect } from "react";
import Link from "next/link";
import { useGetOrganizationDetailsQuery } from "@/store/organization";
import { useSelector } from "react-redux";
import { currentOrganizationSelector } from "@/store/current_organization";
import { useIntercom } from "react-use-intercom";

const TopBanner = ({ onClose }) => {
  const currentOrg = useSelector(currentOrganizationSelector);

  const { boot, shutdown, hide, show, isOpen } = useIntercom();

  const { data, isLoading, error, refetch, isFetching } =
    useGetOrganizationDetailsQuery(
      {
        organization_id: currentOrg.id,
      },
      {
        skip: !currentOrg.id,
      }
    );

  const remainingTime = data?.attributes?.remaining_time;

  let message;
  if (remainingTime > 0) {
    message = `You are using the free version. ${remainingTime} days remaining.`;
  } else if (remainingTime === 0) {
    message = `You are using the free version. It will expire today!`;
  } else if (remainingTime < 0) {
    message = `Your free version has expired!`;
  } else {
    message = `You are using the free version!`;
  }

  const handleIntercom = () => {
    boot();
    show();
  };

  useEffect(() => {
    if (!isOpen) {
      shutdown();
    } else {
      boot();
    }
  }, [isOpen, handleIntercom]);

  if (isLoading) {
    return;
  }

  return (
    <div
      className={`relative text-white text-center p-2 flex items-center justify-center h-12 ${
        remainingTime < 0 ? "bg-red-700" : "bg-[#295ef4]"
      } ${remainingTime > 0 ? "bg-[#295ef4]" : "bg-[#295ef4]"} ${
        remainingTime === 0 ? "bg-orange-600" : "bg-[#295ef4]"
      }`}
    >
      <span>
        {message}{" "}
        {/* <Link
          href="https://www.llmate.ai/pricing"
          className="font-bold text-white underline"
          target="_blank"
        >
          Upgrade to Pro
        </Link> */}
        <span
          className="font-bold text-white underline cursor-pointer"
          onClick={() => handleIntercom()}
        >
          Upgrade to Pro
        </span>{" "}
        to access all features.
      </span>
      <button className="absolute right-4" onClick={onClose}>
        <img src="/assets/banner-cross.svg" alt="Close" className="w-6 h-6" />
      </button>
    </div>
  );
};

export default TopBanner;
