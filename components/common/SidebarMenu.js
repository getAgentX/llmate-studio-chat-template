import React, { useEffect, useRef, useState } from "react";
import WorkspaceModal from "../Modal/WorkspaceModal";
import Link from "next/link";
import { useGetOrganizationListQuery } from "@/store/organization";
import { useDispatch, useSelector } from "react-redux";
import {
  currentOrganizationSelector,
  setCurrentOrganization,
} from "@/store/current_organization";
import { signIn, signOut } from "next-auth/react";
import ConfirmModal from "../Modal/ConfirmModal";
import UpdateWorkspaceModal from "../Modal/UpdateWorkspaceModal";
import { useRouter } from "next/router";
import SuccessModal from "../Modal/SuccessModal";
import { useTheme } from "@/hooks/useTheme";

const SidebarMenu = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState(false);
  const [switchMenu, setSwitchMenu] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showUpdateWorkspace, setShowUpdateWorkspace] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({});
  const [confirmWorkspace, setConfirmWorkspace] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(false);
  const [showCreateWorkspaceSuccessModal, setShowCreateWorkspaceSuccessModal] =
    useState(false);
  const [newWorkSpaceData, setNewWorkSpaceData] = useState(null);

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  const router = useRouter();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const currentOrg = useSelector(currentOrganizationSelector);

  const toggleRef = useRef(null);
  const settingRef = useRef(null);
  const switchRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (!settingRef.current && !switchRef.current) {
      if (toggleRef.current && !toggleRef.current.contains(e.target)) {
        setToggleMenu(false);
      }
    }

    if (settingRef.current && !settingRef.current.contains(e.target)) {
      setSettingsMenu(false);
    }

    if (switchRef.current && !switchRef.current.contains(e.target)) {
      setSwitchMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const {
    refetch: refetchOrgs,
    data: organizationList,
    isLoading: orgsLoading,
    error: orgsError,
  } = useGetOrganizationListQuery();

  useEffect(() => {
    if (organizationList && currentOrg) {
      const organizationData = organizationList.filter((item, index) => {
        return item.displayName === currentOrg.name;
      });

      setCurrentPlan(organizationData[0]?.attributes);
    }
  }, [organizationList, currentOrg]);

  useEffect(() => {
    const currentOrganization = JSON.parse(
      localStorage.getItem("currentOrganization")
    );

    if (
      currentOrg === null &&
      organizationList?.length > 0 &&
      currentOrganization === null
    ) {
      dispatch(
        setCurrentOrganization({
          id: organizationList[0].id,
          name: organizationList[0].displayName,
        })
      );
    } else {
      if (currentOrganization) {
        dispatch(
          setCurrentOrganization({
            id: currentOrganization.id,
            name: currentOrganization.name,
          })
        );
      }
    }
  }, [organizationList]);

  const handleSetOrg = () => {
    dispatch(
      setCurrentOrganization({
        id: selectedOrg.id,
        name: selectedOrg.displayName,
      })
    );

    setToggleMenu(false);
    setSettingsMenu(false);
    setSwitchMenu(false);
    setConfirmWorkspace(false);
    router.push("/");
    // window.location.reload();
  };

  const handlePrimary = () => {
    localStorage.removeItem("currentOrganization");
    signOut();
  };

  const handleSecondary = () => {
    setShowConfirmLogout(false);
  };

  const handleWorkspaceName = (data) => {
    setShowUpdateWorkspace(true);
    setSelectedWorkspace(data);
  };

  return (
    <div className="relative w-full">
      <div
        className={`flex relative items-center justify-center group h-8 w-full cursor-pointer ${
          toggleMenu
            ? "bg-active-bg border-active-border"
            : `hover:bg-active-bg-hover`
        }`}
        onClick={() => setToggleMenu(!toggleMenu)}
        data-tooltip-id="tooltip"
        data-tooltip-content="Workspace"
        data-tooltip-place="right"
        data-tooltip-variant={theme}
      >
        {toggleMenu || (
          <svg
            viewBox="0 0 14 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 ${
              toggleMenu ? "fill-icon-color-hover" : "fill-icon-color"
            }`}
          >
            <path d="M1.66927 13.0002C1.3026 13.0002 0.988715 12.8696 0.727604 12.6085C0.466493 12.3474 0.335938 12.0335 0.335938 11.6668V4.3335C0.335938 3.96683 0.466493 3.65294 0.727604 3.39183C0.988715 3.13072 1.3026 3.00016 1.66927 3.00016H4.33594V1.66683C4.33594 1.30016 4.46649 0.986274 4.7276 0.725163C4.98872 0.464052 5.3026 0.333496 5.66927 0.333496H8.33594C8.7026 0.333496 9.01649 0.464052 9.2776 0.725163C9.53871 0.986274 9.66927 1.30016 9.66927 1.66683V3.00016H12.3359C12.7026 3.00016 13.0165 3.13072 13.2776 3.39183C13.5387 3.65294 13.6693 3.96683 13.6693 4.3335V11.6668C13.6693 12.0335 13.5387 12.3474 13.2776 12.6085C13.0165 12.8696 12.7026 13.0002 12.3359 13.0002H1.66927ZM5.66927 3.00016H8.33594V1.66683H5.66927V3.00016ZM7.0026 9.3335C7.36927 9.3335 7.68316 9.20294 7.94427 8.94183C8.20538 8.68072 8.33594 8.36683 8.33594 8.00016C8.33594 7.6335 8.20538 7.31961 7.94427 7.0585C7.68316 6.79738 7.36927 6.66683 7.0026 6.66683C6.63594 6.66683 6.32205 6.79738 6.06094 7.0585C5.79983 7.31961 5.66927 7.6335 5.66927 8.00016C5.66927 8.36683 5.79983 8.68072 6.06094 8.94183C6.32205 9.20294 6.63594 9.3335 7.0026 9.3335Z" />
          </svg>
        )}

        {toggleMenu && (
          <svg
            viewBox="0 0 14 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 fill-active-text"
          >
            <path d="M1.66927 13.0002C1.3026 13.0002 0.988715 12.8696 0.727604 12.6085C0.466493 12.3474 0.335938 12.0335 0.335938 11.6668V4.3335C0.335938 3.96683 0.466493 3.65294 0.727604 3.39183C0.988715 3.13072 1.3026 3.00016 1.66927 3.00016H4.33594V1.66683C4.33594 1.30016 4.46649 0.986274 4.7276 0.725163C4.98872 0.464052 5.3026 0.333496 5.66927 0.333496H8.33594C8.7026 0.333496 9.01649 0.464052 9.2776 0.725163C9.53871 0.986274 9.66927 1.30016 9.66927 1.66683V3.00016H12.3359C12.7026 3.00016 13.0165 3.13072 13.2776 3.39183C13.5387 3.65294 13.6693 3.96683 13.6693 4.3335V11.6668C13.6693 12.0335 13.5387 12.3474 13.2776 12.6085C13.0165 12.8696 12.7026 13.0002 12.3359 13.0002H1.66927ZM5.66927 3.00016H8.33594V1.66683H5.66927V3.00016ZM7.0026 9.3335C7.36927 9.3335 7.68316 9.20294 7.94427 8.94183C8.20538 8.68072 8.33594 8.36683 8.33594 8.00016C8.33594 7.6335 8.20538 7.31961 7.94427 7.0585C7.68316 6.79738 7.36927 6.66683 7.0026 6.66683C6.63594 6.66683 6.32205 6.79738 6.06094 7.0585C5.79983 7.31961 5.66927 7.6335 5.66927 8.00016C5.66927 8.36683 5.79983 8.68072 6.06094 8.94183C6.32205 9.20294 6.63594 9.3335 7.0026 9.3335Z" />
          </svg>
        )}
      </div>

      {toggleMenu && (
        <div
          className={`absolute bottom-0 w-full left-[120%] border rounded-md min-w-56 max-w-56 bg-dropdown-bg select-none ${
            theme === "dark" ? "border-dropdown-border" : "shadow-2xl"
          } `}
          ref={toggleRef}
        >
          <div className="flex flex-col">
            {currentOrg?.name && (
              <div
                className={`flex items-center justify-between px-2 h-8 text-xs font-medium bg-active-bg cursor-pointer group ${
                  theme === "dark"
                    ? "text-dropdown-text hover:text-primary-text hover:bg-btn-primary"
                    : ""
                } rounded-t `}
              >
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 14 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-primary-text"
                    >
                      <path d="M1.66927 13.0002C1.3026 13.0002 0.988715 12.8696 0.727604 12.6085C0.466493 12.3474 0.335938 12.0335 0.335938 11.6668V4.3335C0.335938 3.96683 0.466493 3.65294 0.727604 3.39183C0.988715 3.13072 1.3026 3.00016 1.66927 3.00016H4.33594V1.66683C4.33594 1.30016 4.46649 0.986274 4.7276 0.725163C4.98872 0.464052 5.3026 0.333496 5.66927 0.333496H8.33594C8.7026 0.333496 9.01649 0.464052 9.2776 0.725163C9.53871 0.986274 9.66927 1.30016 9.66927 1.66683V3.00016H12.3359C12.7026 3.00016 13.0165 3.13072 13.2776 3.39183C13.5387 3.65294 13.6693 3.96683 13.6693 4.3335V11.6668C13.6693 12.0335 13.5387 12.3474 13.2776 12.6085C13.0165 12.8696 12.7026 13.0002 12.3359 13.0002H1.66927ZM5.66927 3.00016H8.33594V1.66683H5.66927V3.00016ZM7.0026 9.3335C7.36927 9.3335 7.68316 9.20294 7.94427 8.94183C8.20538 8.68072 8.33594 8.36683 8.33594 8.00016C8.33594 7.6335 8.20538 7.31961 7.94427 7.0585C7.68316 6.79738 7.36927 6.66683 7.0026 6.66683C6.63594 6.66683 6.32205 6.79738 6.06094 7.0585C5.79983 7.31961 5.66927 7.6335 5.66927 8.00016C5.66927 8.36683 5.79983 8.68072 6.06094 8.94183C6.32205 9.20294 6.63594 9.3335 7.0026 9.3335Z" />
                    </svg>
                  </span>

                  <span className="text-xs font-medium tracking-wide">
                    {currentOrg?.name}
                  </span>
                </div>

                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="5.70312" cy="6.30078" r="4.5" fill="#F6F6F6" />
                    <path
                      d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 7.08L3.45 5.37L2.61 6.21L5.16 8.76ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 11.2125 2.295 10.785 1.755 10.245C1.215 9.705 0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 1.215 2.295 1.755 1.755C2.295 1.215 2.93 0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 0C6.83 0 7.61 0.1575 8.34 0.4725C9.07 0.7875 9.705 1.215 10.245 1.755C10.785 2.295 11.2125 2.93 11.5275 3.66C11.8425 4.39 12 5.17 12 6C12 6.83 11.8425 7.61 11.5275 8.34C11.2125 9.07 10.785 9.705 10.245 10.245C9.705 10.785 9.07 11.2125 8.34 11.5275C7.61 11.8425 6.83 12 6 12Z"
                      fill="#295EF4"
                    />
                  </svg>
                </span>
              </div>
            )}

            <Link
              href="/team"
              className={`flex items-center justify-between px-2 h-8 text-xs font-medium cursor-pointer text-dropdown-text group hover:bg-active-bg-hover ${
                theme === "dark" ? "hover:text-primary-text" : ""
              } `}
            >
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-primary-text group-hover:fill-primary-text"
                  >
                    <path d="M0 12V10.95C0 10.4722 0.244444 10.0833 0.733333 9.78333C1.22222 9.48333 1.86667 9.33333 2.66667 9.33333C2.81111 9.33333 2.95 9.33611 3.08333 9.34167C3.21667 9.34722 3.34444 9.36111 3.46667 9.38333C3.31111 9.61667 3.19444 9.86111 3.11667 10.1167C3.03889 10.3722 3 10.6389 3 10.9167V12H0ZM4 12V10.9167C4 10.5611 4.09722 10.2361 4.29167 9.94167C4.48611 9.64722 4.76111 9.38889 5.11667 9.16667C5.47222 8.94444 5.89722 8.77778 6.39167 8.66667C6.88611 8.55556 7.42222 8.5 8 8.5C8.58889 8.5 9.13056 8.55556 9.625 8.66667C10.1194 8.77778 10.5444 8.94444 10.9 9.16667C11.2556 9.38889 11.5278 9.64722 11.7167 9.94167C11.9056 10.2361 12 10.5611 12 10.9167V12H4ZM13 12V10.9167C13 10.6278 12.9639 10.3556 12.8917 10.1C12.8194 9.84444 12.7111 9.60556 12.5667 9.38333C12.6889 9.36111 12.8139 9.34722 12.9417 9.34167C13.0694 9.33611 13.2 9.33333 13.3333 9.33333C14.1333 9.33333 14.7778 9.48056 15.2667 9.775C15.7556 10.0694 16 10.4611 16 10.95V12H13ZM2.66667 8.66667C2.3 8.66667 1.98611 8.53611 1.725 8.275C1.46389 8.01389 1.33333 7.7 1.33333 7.33333C1.33333 6.95556 1.46389 6.63889 1.725 6.38333C1.98611 6.12778 2.3 6 2.66667 6C3.04444 6 3.36111 6.12778 3.61667 6.38333C3.87222 6.63889 4 6.95556 4 7.33333C4 7.7 3.87222 8.01389 3.61667 8.275C3.36111 8.53611 3.04444 8.66667 2.66667 8.66667ZM13.3333 8.66667C12.9667 8.66667 12.6528 8.53611 12.3917 8.275C12.1306 8.01389 12 7.7 12 7.33333C12 6.95556 12.1306 6.63889 12.3917 6.38333C12.6528 6.12778 12.9667 6 13.3333 6C13.7111 6 14.0278 6.12778 14.2833 6.38333C14.5389 6.63889 14.6667 6.95556 14.6667 7.33333C14.6667 7.7 14.5389 8.01389 14.2833 8.275C14.0278 8.53611 13.7111 8.66667 13.3333 8.66667ZM8 8C7.44444 8 6.97222 7.80556 6.58333 7.41667C6.19444 7.02778 6 6.55556 6 6C6 5.43333 6.19444 4.95833 6.58333 4.575C6.97222 4.19167 7.44444 4 8 4C8.56667 4 9.04167 4.19167 9.425 4.575C9.80833 4.95833 10 5.43333 10 6C10 6.55556 9.80833 7.02778 9.425 7.41667C9.04167 7.80556 8.56667 8 8 8Z" />
                  </svg>
                </span>

                <span className="text-xs font-medium tracking-wide">Team</span>
              </div>
            </Link>

            <Link
              href="/api-key"
              className={`flex items-center justify-between px-2 h-8 text-xs font-medium cursor-pointer text-dropdown-text group hover:bg-active-bg-hover ${
                theme === "dark" ? "hover:text-primary-text" : ""
              } `}
            >
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 fill-primary-text group-hover:fill-primary-text"
                  >
                    <path d="M7 17a5.007 5.007 0 0 0 4.898-4H14v2h2v-2h2v3h2v-3h1v-2h-9.102A5.007 5.007 0 0 0 7 7c-2.757 0-5 2.243-5 5s2.243 5 5 5zm0-8c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3z"></path>
                  </svg>
                </span>

                <span className="text-xs font-medium tracking-wide">
                  Api Key
                </span>
              </div>
            </Link>

            <Link
              href="/model-management"
              className={`flex items-center justify-between px-2 h-8 text-xs font-medium cursor-pointer text-dropdown-text group hover:bg-active-bg-hover ${
                theme === "dark" ? "hover:text-primary-text" : ""
              } `}
            >
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-primary-text group-hover:fill-primary-text"
                  >
                    <g clip-path="url(#clip0_1885_6775)">
                      <path d="M4 15.3333C3.44444 15.3333 2.97222 15.1389 2.58333 14.75C2.19444 14.3611 2 13.8889 2 13.3333C2 12.7778 2.19444 12.3056 2.58333 11.9167C2.97222 11.5278 3.44444 11.3333 4 11.3333C4.15556 11.3333 4.3 11.35 4.43333 11.3833C4.56667 11.4167 4.69444 11.4611 4.81667 11.5167L5.76667 10.3333C5.45556 9.98889 5.23889 9.6 5.11667 9.16667C4.99444 8.73333 4.96667 8.3 5.03333 7.86667L3.68333 7.41667C3.49444 7.69444 3.25556 7.91667 2.96667 8.08333C2.67778 8.25 2.35556 8.33333 2 8.33333C1.44444 8.33333 0.972222 8.13889 0.583333 7.75C0.194444 7.36111 0 6.88889 0 6.33333C0 5.77778 0.194444 5.30556 0.583333 4.91667C0.972222 4.52778 1.44444 4.33333 2 4.33333C2.55556 4.33333 3.02778 4.52778 3.41667 4.91667C3.80556 5.30556 4 5.77778 4 6.33333V6.46667L5.35 6.93333C5.57222 6.53333 5.86944 6.19444 6.24167 5.91667C6.61389 5.63889 7.03333 5.46111 7.5 5.38333V3.93333C7.06667 3.81111 6.70833 3.575 6.425 3.225C6.14167 2.875 6 2.46667 6 2C6 1.44444 6.19444 0.972222 6.58333 0.583333C6.97222 0.194444 7.44444 0 8 0C8.55556 0 9.02778 0.194444 9.41667 0.583333C9.80556 0.972222 10 1.44444 10 2C10 2.46667 9.85556 2.875 9.56667 3.225C9.27778 3.575 8.92222 3.81111 8.5 3.93333V5.38333C8.96667 5.46111 9.38611 5.63889 9.75833 5.91667C10.1306 6.19444 10.4278 6.53333 10.65 6.93333L12 6.46667V6.33333C12 5.77778 12.1944 5.30556 12.5833 4.91667C12.9722 4.52778 13.4444 4.33333 14 4.33333C14.5556 4.33333 15.0278 4.52778 15.4167 4.91667C15.8056 5.30556 16 5.77778 16 6.33333C16 6.88889 15.8056 7.36111 15.4167 7.75C15.0278 8.13889 14.5556 8.33333 14 8.33333C13.6444 8.33333 13.3194 8.25 13.025 8.08333C12.7306 7.91667 12.4944 7.69444 12.3167 7.41667L10.9667 7.86667C11.0333 8.3 11.0056 8.73055 10.8833 9.15833C10.7611 9.58611 10.5444 9.97778 10.2333 10.3333L11.1833 11.5C11.3056 11.4444 11.4333 11.4028 11.5667 11.375C11.7 11.3472 11.8444 11.3333 12 11.3333C12.5556 11.3333 13.0278 11.5278 13.4167 11.9167C13.8056 12.3056 14 12.7778 14 13.3333C14 13.8889 13.8056 14.3611 13.4167 14.75C13.0278 15.1389 12.5556 15.3333 12 15.3333C11.4444 15.3333 10.9722 15.1389 10.5833 14.75C10.1944 14.3611 10 13.8889 10 13.3333C10 13.1111 10.0361 12.8972 10.1083 12.6917C10.1806 12.4861 10.2778 12.3 10.4 12.1333L9.45 10.95C8.99444 11.2056 8.50833 11.3333 7.99167 11.3333C7.475 11.3333 6.98889 11.2056 6.53333 10.95L5.6 12.1333C5.72222 12.3 5.81944 12.4861 5.89167 12.6917C5.96389 12.8972 6 13.1111 6 13.3333C6 13.8889 5.80556 14.3611 5.41667 14.75C5.02778 15.1389 4.55556 15.3333 4 15.3333Z" />
                    </g>
                    <defs>
                      <clipPath id="clip0_1885_6775">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>

                <span className="text-xs font-medium tracking-wide">
                  Model Management
                </span>
              </div>
            </Link>

            <Link
              href="/org-info/facebook_ads"
              className={`flex items-center justify-between px-2 h-8 text-xs font-medium cursor-pointer hover:bg-active-bg-hover ${
                theme === "dark"
                  ? "text-dropdown-text hover:text-primary-text"
                  : ""
              } `}
            >
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-dropdown-icon"
                  >
                    <path d="M2.67188 14C2.11632 14 1.6441 13.8056 1.25521 13.4167C0.866319 13.0278 0.671875 12.5556 0.671875 12C0.671875 11.4444 0.866319 10.9722 1.25521 10.5833C1.6441 10.1944 2.11632 10 2.67188 10C2.77188 10 2.8691 10.0083 2.96354 10.025C3.05799 10.0417 3.14965 10.0611 3.23854 10.0833L5.93854 6.36667C5.74965 6.13333 5.60243 5.87222 5.49688 5.58333C5.39132 5.29444 5.33854 4.98889 5.33854 4.66667C5.33854 3.93333 5.59965 3.30556 6.12188 2.78333C6.6441 2.26111 7.27188 2 8.00521 2C8.73854 2 9.36632 2.26111 9.88854 2.78333C10.4108 3.30556 10.6719 3.93333 10.6719 4.66667C10.6719 4.98889 10.6163 5.29444 10.5052 5.58333C10.3941 5.87222 10.2441 6.13333 10.0552 6.36667L12.7719 10.0833C12.8608 10.0611 12.9524 10.0417 13.0469 10.025C13.1413 10.0083 13.2385 10 13.3385 10C13.8941 10 14.3663 10.1944 14.7552 10.5833C15.1441 10.9722 15.3385 11.4444 15.3385 12C15.3385 12.5556 15.1441 13.0278 14.7552 13.4167C14.3663 13.8056 13.8941 14 13.3385 14C12.783 14 12.3108 13.8056 11.9219 13.4167C11.533 13.0278 11.3385 12.5556 11.3385 12C11.3385 11.7889 11.3691 11.5861 11.4302 11.3917C11.4913 11.1972 11.5774 11.0222 11.6885 10.8667L8.98854 7.15C8.93299 7.17222 8.88021 7.18889 8.83021 7.2C8.78021 7.21111 8.72743 7.22778 8.67188 7.25V10.1167C9.06076 10.25 9.38021 10.4889 9.63021 10.8333C9.88021 11.1778 10.0052 11.5667 10.0052 12C10.0052 12.5556 9.81076 13.0278 9.42188 13.4167C9.03299 13.8056 8.56076 14 8.00521 14C7.44965 14 6.97743 13.8056 6.58854 13.4167C6.19965 13.0278 6.00521 12.5556 6.00521 12C6.00521 11.5667 6.13021 11.1806 6.38021 10.8417C6.63021 10.5028 6.94965 10.2611 7.33854 10.1167V7.25C7.28299 7.22778 7.23021 7.21111 7.18021 7.2C7.13021 7.18889 7.07743 7.17222 7.02188 7.15L4.32188 10.8667C4.43299 11.0222 4.5191 11.1972 4.58021 11.3917C4.64132 11.5861 4.67188 11.7889 4.67188 12C4.67188 12.5556 4.47743 13.0278 4.08854 13.4167C3.69965 13.8056 3.22743 14 2.67188 14Z" />
                  </svg>
                </span>

                <span className="text-xs font-medium tracking-wide">
                  Data Pipeline
                </span>
              </div>
            </Link>

            {currentPlan?.membership_tier?.[0] === "free" ? (
              <a
                href="https://www.llmate.ai/pricing"
                className={`flex items-center justify-between px-2 h-8 text-xs font-medium cursor-pointer hover:bg-active-bg-hover ${
                  theme === "dark"
                    ? "text-dropdown-text hover:text-primary-text"
                    : ""
                } `}
                target="_blank"
              >
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 "
                    >
                      <path
                        d="M6.45521 9.13398L7.03854 7.23398L5.50521 6.00065H7.40521L8.00521 4.13398L8.60521 6.00065H10.5052L8.95521 7.23398L9.53854 9.13398L8.00521 7.95065L6.45521 9.13398ZM4.00521 15.334V10.184C3.58299 9.71732 3.25521 9.18398 3.02188 8.58398C2.78854 7.98398 2.67188 7.3451 2.67188 6.66732C2.67188 5.17843 3.18854 3.91732 4.22188 2.88398C5.25521 1.85065 6.51632 1.33398 8.00521 1.33398C9.4941 1.33398 10.7552 1.85065 11.7885 2.88398C12.8219 3.91732 13.3385 5.17843 13.3385 6.66732C13.3385 7.3451 13.2219 7.98398 12.9885 8.58398C12.7552 9.18398 12.4274 9.71732 12.0052 10.184V15.334L8.00521 14.0007L4.00521 15.334ZM8.00521 10.6673C9.11632 10.6673 10.0608 10.2784 10.8385 9.50065C11.6163 8.72287 12.0052 7.77843 12.0052 6.66732C12.0052 5.55621 11.6163 4.61176 10.8385 3.83398C10.0608 3.05621 9.11632 2.66732 8.00521 2.66732C6.8941 2.66732 5.94965 3.05621 5.17188 3.83398C4.3941 4.61176 4.00521 5.55621 4.00521 6.66732C4.00521 7.77843 4.3941 8.72287 5.17188 9.50065C5.94965 10.2784 6.8941 10.6673 8.00521 10.6673Z"
                        fill="#FFBF0A"
                      />
                    </svg>
                  </span>

                  <span className="text-xs font-medium tracking-wide text-[#FFBF0A]">
                    Upgrade to Pro
                  </span>
                </div>
              </a>
            ) : (
              ""
            )}

            <div
              className={`flex items-center justify-between px-2 h-8 text-xs font-medium cursor-pointer text-dropdown-text group hover:bg-active-bg-hover ${
                theme === "dark" ? "hover:text-primary-text" : ""
              } rounded-b  ${switchMenu ? "" : ""}`}
              onClick={() => setSwitchMenu(!switchMenu)}
            >
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="w-4 h-4 fill-primary-text group-hover:fill-primary-text"
                  >
                    <path d="M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Zm-139.32-64a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z"></path>
                  </svg>
                </span>

                <span className="text-xs font-medium tracking-wide">
                  Switch Workspace
                </span>
              </div>

              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 text-primary-text"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}

      {switchMenu && (
        <div
          className={`absolute bottom-0 w-full left-[270px] rounded-md min-w-64 max-w-64 border bg-dropdown-bg select-none ${
            theme === "dark" ? "border-dropdown-border" : "shadow-2xl"
          } `}
          ref={switchRef}
        >
          <div className="flex flex-col space-y-2">
            <span
              className={`px-3 pt-3 pb-1 text-xs font-medium tracking-wide  ${
                theme === "dark"
                  ? "text-secondary-text"
                  : "text-input-placeholder"
              } `}
            >
              Your Workspaces
            </span>

            <div className="flex flex-col">
              {organizationList?.map((item, index) => {
                return (
                  <div
                    className={`flex items-center justify-between px-2 h-8 text-xs font-medium cursor-pointer text-dropdown-text group hover:bg-active-bg-hover ${
                      theme === "dark" ? "hover:text-primary-text" : ""
                    } ${
                      item?.id === currentOrg?.id &&
                      "bg-active-bg text-active-text"
                    }`}
                    key={index}
                  >
                    <div
                      className="flex items-center w-full space-x-2"
                      onClick={() => {
                        setSelectedOrg(item);
                        setConfirmWorkspace(true);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center justify-center">
                          <svg
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 fill-primary-text group-hover:fill-primary-text"
                          >
                            <path d="M1 9.5C0.725 9.5 0.489583 9.40208 0.29375 9.20625C0.0979167 9.01042 0 8.775 0 8.5V3C0 2.725 0.0979167 2.48958 0.29375 2.29375C0.489583 2.09792 0.725 2 1 2H3V1C3 0.725 3.09792 0.489583 3.29375 0.29375C3.48958 0.0979167 3.725 0 4 0H6C6.275 0 6.51042 0.0979167 6.70625 0.29375C6.90208 0.489583 7 0.725 7 1V2H9C9.275 2 9.51042 2.09792 9.70625 2.29375C9.90208 2.48958 10 2.725 10 3V8.5C10 8.775 9.90208 9.01042 9.70625 9.20625C9.51042 9.40208 9.275 9.5 9 9.5H1ZM1 8.5H9V3H1V8.5ZM4 2H6V1H4V2Z" />
                          </svg>
                        </span>

                        <span className="text-xs font-medium tracking-wide line-clamp-1">
                          {item.displayName}
                        </span>
                      </div>

                      {item?.id === currentOrg?.id && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="5.70312"
                              cy="6.30078"
                              r="4.5"
                              fill="#F6F6F6"
                            />
                            <path
                              d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 7.08L3.45 5.37L2.61 6.21L5.16 8.76ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 11.2125 2.295 10.785 1.755 10.245C1.215 9.705 0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 1.215 2.295 1.755 1.755C2.295 1.215 2.93 0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 0C6.83 0 7.61 0.1575 8.34 0.4725C9.07 0.7875 9.705 1.215 10.245 1.755C10.785 2.295 11.2125 2.93 11.5275 3.66C11.8425 4.39 12 5.17 12 6C12 6.83 11.8425 7.61 11.5275 8.34C11.2125 9.07 10.785 9.705 10.245 10.245C9.705 10.785 9.07 11.2125 8.34 11.5275C7.61 11.8425 6.83 12 6 12Z"
                              fill="#295EF4"
                            />
                          </svg>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-border group"
                        onClick={() => handleWorkspaceName(item)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-icon-color hover:text-active-text"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                          />
                        </svg>
                      </span>

                      {/* <span className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-border text-secondary-text hover:text-primary-text">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </span> */}
                    </div>
                  </div>
                );
              })}

              <div
                className={`w-full px-3 py-2 border-t ${
                  theme === "dark" ? "border-dropdown-border" : ""
                } `}
              >
                <button
                  className={`flex items-center justify-center w-full space-x-2 text-xs font-medium tracking-wide rounded h-8 bg-secondary hover:bg-secondary-foreground ${
                    theme === "dark"
                      ? "text-primary-text hover:text-dropdown-text hover:bg-btn-primary"
                      : "text-btn-primary-text hover:bg-btn-primary hover:text-hover"
                  }`}
                  onClick={() => setShowWorkspaceModal(true)}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-white"
                    >
                      <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                    </svg>
                  </span>

                  <span>Create Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWorkspaceModal && (
        <WorkspaceModal
          showWorkspaceModal={showWorkspaceModal}
          setShowWorkspaceModal={setShowWorkspaceModal}
          // setShowCreateWorkspaceSuccessModal={setShowCreateWorkspaceSuccessModal}
          // setNewWorkSpaceData={setNewWorkSpaceData}
        />
      )}
      {/* <SuccessModal
        show={showCreateWorkspaceSuccessModal}
        setShow={setShowCreateWorkspaceSuccessModal}
        heading="Success Confirmation"
        title={"Workspace Created Successfully"}
        description=""
        primaryBtn="Take me In"
        primaryChange={() => {
          dispatch(
            setCurrentOrganization(newWorkSpaceData)
          );
          router.push("/");
          try {
            signIn("keycloak");
          } catch (error) {
            console.error("Failed to refresh access token", error);
          }
          setShowCreateWorkspaceSuccessModal(false)
          
        }
        }
      /> */}

      <UpdateWorkspaceModal
        showWorkspaceModal={showUpdateWorkspace}
        setShowWorkspaceModal={setShowUpdateWorkspace}
        data={selectedWorkspace}
        refetch={refetchOrgs}
      />

      <ConfirmModal
        show={showConfirmLogout}
        setShow={setShowConfirmLogout}
        heading="Confirm Logout"
        title={"Are you sure you want to Logout?"}
        description={"You are logged out when you confirm"}
        primaryBtn="Yes, Confirm"
        primaryChange={handlePrimary}
        secondaryBtn="No, keep me in"
        secondaryChange={handleSecondary}
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
    </div>
  );
};

export default SidebarMenu;
