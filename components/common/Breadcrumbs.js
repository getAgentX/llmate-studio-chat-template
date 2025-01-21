import { currentOrganizationSelector, setCurrentOrganization } from "@/store/current_organization";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataConnectionIcon, LogoutIcon, UserIcon, WorkspaceIcon, WorkspaceListIcon } from "../Icons/icon";
import { useGetOrganizationListQuery } from "@/store/organization";
import ThemeToggleButton from "./ThemeToggleButton";
import { signOut, useSession } from "next-auth/react";
import ConfirmModal from "../Modal/ConfirmModal";
import { useRouter } from "next/router";
import WorkspaceModal from "../Modal/WorkspaceModal";

const Breadcrumb = ({ children, data }) => {
  const currentOrg = useSelector(currentOrganizationSelector);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [confirmWorkspace, setConfirmWorkspace] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const session = useSession();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  };

  const {
    refetch: refetchOrgs,
    data: organizationList,
    isLoading: orgsLoading,
    error: orgsError,
  } = useGetOrganizationListQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const handleSignOut = () => {
    localStorage.removeItem("currentOrganization");
    signOut();
  };

  const handleSetOrg = () => {
    dispatch(
      setCurrentOrganization({
        id: selectedOrg.id,
        name: selectedOrg.displayName,
      })
    );
    setDropdownOpen(false);
    setConfirmWorkspace(false);
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const handleClickOutsideUserDropdown = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideUserDropdown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideUserDropdown);
    };
  }, [userDropdownRef]);

  // useEffect(() => {
  //   if (
  //     !currentOrg &&
  //     getOrg &&
  //     organizationList?.find((org) => org.id === getOrg.id)
  //   ) {
  //     const org = organizationList?.find((org) => org.id === getOrg.id);

  //     dispatch(
  //       setCurrentOrganization({
  //         id: org.id,
  //         name: org.displayName,
  //       })
  //     );
  //   }
  // }, [organizationList]);

  return (
    <>
      <div
        className={`sticky top-0 left-0 z-20 flex items-center justify-between border-b border-border-color w-full py-6 px-4 h-12 bg-primary font-roboto`}
      >
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
          {currentOrg?.name && (
            <div className="relative !z-[1000] flex items-center justify-center space-x-2" >
              <button
                onClick={toggleDropdown}
                className={`flex items-center space-x-2 px-3 py-2 rounded border border-border-color ${data.length === 0
                  ? "text-primary-text pointer-events-none"
                  : "text-secondary-text hover:text-primary-text"
                  }`}
                type="button"
              >
                <WorkspaceIcon size={4} />
                <p className="text-xs font-medium">{currentOrg.name}</p>
                <svg
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.25 13.9997L5.25 10.9997L6.21667 10.0331L8.25 12.0664L10.2833 10.0331L11.25 10.9997L8.25 13.9997ZM6.21667 6.03307L5.25 5.06641L8.25 2.06641L11.25 5.06641L10.2833 6.03307L8.25 3.99974L6.21667 6.03307Z"
                    fill="var(--text-primary)"
                  />
                </svg>
              </button>
              {data.length > 0 && data[0].name !== "" && (
                <svg width="8" height="22" viewBox="0 0 8 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.57955 0.227272L1.95455 21.125H0.957386L6.58239 0.227272H7.57955Z" fill="#A1A1A1" />
                </svg>
              )}

              {dropdownOpen && (
                <div className="absolute mt-2 w-58 top-9 bg-primary border border-border-color shadow-lg rounded-lg p-3 gap-2" ref={dropdownRef}>
                  <span className="text-[11px] text-[#9D9EA5]">WORKSPACE LISTS</span>
                  <ul className="mt-2">
                    {organizationList.map((workspace, index) => (
                      <li
                        key={index}
                        className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentOrg.name === workspace.displayName
                          ? "bg-active-bg text-primary-text"
                          : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                          }`}
                        onClick={() => {
                          console.log("ss")
                          setSelectedOrg(workspace);
                          setConfirmWorkspace(true);
                        }}
                      >
                        <div
                          className="flex items-center justify-center space-x-2 text-[13px]"
                        >
                          <WorkspaceListIcon size={4} />
                          <span className="">
                            {workspace.displayName}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="flex items-center justify-center h-8 px-3 mt-2 space-x-2 text-[12px] font-semibold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                    onClick={() => setShowCreateWorkspace(true)}
                  >
                    <span className="hidden xsm:block"> Create new workspace</span>
                  </button>
                </div>
              )}
            </div>

          )}

          <ol className="flex items-center text-xs text-primary-text space-x-1">
            {data?.map((item, index) => {
              return (
                <div key={index} className="flex items-center group">
                  <li>
                    <Link
                      href={item.slug}
                      className={`block transition font-medium ${index === 0 ? 'text-primary-text w-auto mr-1' : 'text-secondary-text hover:text-primary-text w-28 overflow-hidden text-ellipsis whitespace-nowrap'}`}
                    >
                      {item.name}
                    </Link>
                  </li>

                  {index + 1 !== data.length && (
                    <li className="rtl:rotate-180">
                      <svg width="8" height="22" viewBox="0 0 8 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.57955 0.227272L1.95455 21.125H0.957386L6.58239 0.227272H7.57955Z" fill="#A1A1A1" />
                      </svg>
                    </li>
                  )}
                </div>

              );
            })}
          </ol>
        </nav>

        <div className="flex space-x-2 items-center">
          {children}
          <ThemeToggleButton />
          <div>
            <div className="flex items-center justify-center w-8 h-8 bg-home-icon rounded-full cursor-pointer" onClick={() => {
              setUserDropdownOpen(!userDropdownOpen)
            }}>
              <h2 className="text-primary-text capitalize text-white">
                {session?.data?.user?.name.split('')[0]}
              </h2>
            </div>
            {userDropdownOpen && (
              <div className="absolute right-5 top-12 w-64 bg-primary border border-border-color shadow-lg rounded-lg !z-50" ref={userDropdownRef}>
                <div className="flex item-center space-x-2 px-3 py-2.5">
                  {/* <img src="/assets/userTempIcon.svg" className="h-10 w-10" /> */}
                  <div className="flex items-center justify-center w-10 h-10 bg-home-icon rounded-full">
                    <h2 className="text-primary-text capitalize text-white">
                      {session?.data?.user?.name.split('')[0]}
                    </h2>
                  </div>

                  <div className="text-sm flex flex-col justify-between ">
                    <h2 className="text-primary-text">{session?.data?.user?.name}</h2>
                    <h2 className="text-secondary-text">{session?.data?.user?.email}</h2>
                  </div>
                </div>
                <div className="py-2.5 border-t border-border-color space-y-1 text-sm ">
                  <div className={`flex space-x-2 items-center  hover:bg-active-bg-hover text-primary-text p-1.5 rounded cursor-pointer px-3 mx-2`}>
                    <UserIcon size={6} />
                    <span>User Info</span>
                  </div>
                  <Link href="/user-info/facebook_ads" className={`flex space-x-2 items-center  hover:bg-active-bg-hover text-primary-text p-1.5 rounded cursor-pointer px-3 mx-2`}>
                    <DataConnectionIcon size={6} />
                    <span className="">Connected Accounts</span>
                  </Link>
                  <div className={`flex space-x-2 items-center hover:bg-active-bg-hover text-primary-text p-1.5 rounded cursor-pointer px-3 mx-2`} onClick={() => setShowConfirmLogout(true)}>
                    <LogoutIcon size={6} />
                    <span>Log Out</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        show={showConfirmLogout}
        setShow={setShowConfirmLogout}
        heading="Confirm Logout"
        title={"Are you sure you want to Logout?"}
        description={"You are logged out when you confirm"}
        primaryBtn="Yes, Confirm"
        primaryChange={handleSignOut}
        secondaryBtn="No, keep me in"
        secondaryChange={() => setShowConfirmLogout(false)}
      />
      <ConfirmModal
        show={confirmWorkspace}
        setShow={setConfirmWorkspace}
        heading="Confirm Change"
        title={"Are you sure you want to Change Workspace?"}
        description={""}
        primaryBtn="Yes, Confirm"
        primaryChange={handleSetOrg}
        secondaryBtn="No, keep me in"
        secondaryChange={() => setConfirmWorkspace(false)}
      />

      <WorkspaceModal
        showWorkspaceModal={showCreateWorkspace}
        setShowWorkspaceModal={setShowCreateWorkspace}
      />

    </>
  );
};

export default Breadcrumb;
