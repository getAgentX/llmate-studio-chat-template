import React, { useEffect, useState, version } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SidebarMenu from "../common/SidebarMenu";
import { signIn, useSession } from "next-auth/react";
import CreateDashboard from "../Modal/CreateDashboard";
import {
  currentOrganizationSelector,
  getLocalStoreOrganization,
  setCurrentOrganization,
} from "@/store/current_organization";
import { useDispatch, useSelector } from "react-redux";
import UserMenu from "../common/UserMenu";
import { useGetOrganizationListQuery } from "@/store/organization";
import TopBanner from "../common/TopBanner";
import CreateNotebookModal from "../Notebook/Modal/CreateNotebookModal";
import OrganizationPage from "./OrganizationPage";
import ThemeToggleButton from "../common/ThemeToggleButton";
import { useTheme } from "@/hooks/useTheme";
import { useIntercom } from "react-use-intercom";
import { ApiKeyIcon, AssistantIcon, DashboardIcon, DataConnectionIcon, DataPipelineIcon, DatasourceIcon, HomeIcon, ModelManagementIcon, NotebookIcon, SupportIcon, TeamIcon } from "../Icons/icon";
import APIKeyManagement from "@/pages/model-management";

const SidebarLayout = ({ children }) => {
  const [currentSelected, setCurrentSelected] = useState("home");
  const [slug, setSlug] = useState(null);
  const [createDashboard, setCreateDashboard] = useState(false);
  const [versionPro, setVersionPro] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(false);
  const [showCreateNotebook, setShowCreateNotebook] = useState(false);
  const [toggleIntercom, setToggleIntercom] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [isSiderbarFull, setIsSiderbarFull] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  const { boot, shutdown, hide, show, isOpen } = useIntercom();

  useEffect(() => {
    if (toggleIntercom && !isOpen) {
      shutdown();
      setToggleIntercom(false);
    } else {
      boot();
    }
  }, [isOpen]);

  useEffect(() => {
    boot();

    const timeout = setTimeout(() => {
      const launcher = document.querySelector(".intercom-launcher");
      if (launcher) {
        launcher.style.display = "block";
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [boot]);

  useEffect(() => {
    let sess = session;
    if (sess && sess["error"] === "RefreshAccessTokenError") {
      signIn("keycloak");
    }
    if (sessionStatus === "unauthenticated") {
      signIn("keycloak");
    }
  }, [sessionStatus, session]);

  const router = useRouter();
  const { theme } = useTheme();

  const currentOrg = useSelector(currentOrganizationSelector);

  useEffect(() => {
    if (router.asPath) {
      setSlug(router.asPath);

      const assistantSlug = router.asPath.includes("assistant");
      const dashboardSlug = router.asPath.includes("dashboard");
      const datasourceSlug = router.asPath.includes("datasource");
      const NotebookSlug = router.asPath.includes("notebook");
      const teamSlug = router.asPath.includes("team");
      const modelManagementSlug = router.asPath.includes("model-management");
      const apiKeySlug = router.asPath.includes("api-key");
      const DataConnectionSlug = router.asPath.includes("user-info");
      const DataPipelineSlug = router.asPath.includes("org-info");

      if (assistantSlug) {
        setCurrentSelected("assistant");
      } else if (dashboardSlug) {
        setCurrentSelected("dashboard");
      } else if (datasourceSlug) {
        setCurrentSelected("datasource");
      } else if (NotebookSlug) {
        setCurrentSelected("notebook");
      } else if (teamSlug) {
        setCurrentSelected("team");
      } else if (modelManagementSlug) {
        setCurrentSelected("model-management");
      } else if (apiKeySlug) {
        setCurrentSelected("api-key");
      } else if (DataConnectionSlug) {
        setCurrentSelected("data-connections");
      } else if (DataPipelineSlug) {
        setCurrentSelected("data-pipeline");
      } else {
        setCurrentSelected("home");
      }
    }
  }, [router]);

  useEffect(() => {
    // Define routes where the sidebar should be full
    // const fullSidebarRoutes = ["/", "/assistant", "/dashboard", "/notebook", "/datasource", "/team", "/model-management", "/user-info/[slug]", "/org-info/[slug]"];
    const fullSidebarRoutes = ["/", "/assistant", "/dashboard", "/notebook", "/datasource"];

    // Check if the current route is one of the full sidebar routes
    if (fullSidebarRoutes.includes(router.pathname)) {
      setIsSiderbarFull(true);
    } else {
      setIsSiderbarFull(false);
    }
  }, [router.pathname]);

  const handleRoute = (route) => {
    // const checkSlug = slug.includes(route);

    // if (!checkSlug && route === "/assistant") {
    //   setCurrentSelected("assistant");
    //   router.push(route);
    // } else if (!checkSlug && route === "/dashboard") {
    //   setCurrentSelected("dashboard");
    //   router.push(route);
    // } else if (!checkSlug && route === "/datasource") {
    //   setCurrentSelected("datasource");
    //   router.push(route);
    // } else {
    //   setCurrentSelected(route);
    // }

    if (route === "/assistant") {
      setCurrentSelected("assistant");
      router.push(route);
    } else if (route === "/dashboard") {
      setCurrentSelected("dashboard");
      router.push(route);
    } else if (route === "/datasource") {
      setCurrentSelected("datasource");
      router.push(route);
    } else if (route === "/team") {
      setCurrentSelected("team");
      router.push(route);
    } else if (route === "/model-management") {
      setCurrentSelected("model-management");
      router.push(route);
    } else if (route === "/api-key") {
      setCurrentSelected("api-key");
      router.push(route);
    } else if (route.includes("/user-info")) {
      setCurrentSelected("data-connections");
      router.push(route);
    } else if (route.includes("/org-info")) {
      setCurrentSelected("data-pipeline");
      router.push(route);
    } else {
      setCurrentSelected(route);
    }
  };

  const handleHomeRoute = () => {
    router.push("/");
    setCurrentSelected("home");
  };

  const handleNotebookRoute = (route) => {
    setCurrentSelected("notebook");
    router.push(route);
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

  useEffect(() => {
    if (organizationList === undefined || !organizationList) {
      return;
    }

    let orgs = [];
    for (let j = 0; j < organizationList?.length; j++) {
      orgs.push({
        id: organizationList[j].id,
        name: organizationList[j].name,
        displayName: organizationList[j].displayName,
        attributes: organizationList[j].attributes,
      });
    }
  }, [organizationList]);

  useEffect(() => {
    if (!currentOrg || !organizationList) {
      return;
    }

    const currentOrganization = organizationList.find(
      (org) => org.id === currentOrg.id
    );

    if (
      currentOrganization &&
      currentOrganization.attributes.membership_tier[0] === "enterprise"
    ) {
      setVersionPro(true);
    } else {
      setVersionPro(false);
    }
  }, [currentOrg, organizationList]);

  useEffect(() => {
    if (!currentOrg || !organizationList) {
      return;
    }

    const currentOrganization = organizationList.find(
      (org) => org.id === currentOrg.id
    );

    if (
      currentOrganization &&
      currentOrganization.attributes.membership_tier[0] === "free"
    ) {
      setShowTopBanner(true);
    } else {
      setShowTopBanner(false);
    }
  }, [currentOrg, organizationList]);

  const handleCloseTopBanner = () => {
    setShowTopBanner(false);
    sessionStorage.setItem("banner", true);
  };

  const getOrg = getLocalStoreOrganization();
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      !currentOrg &&
      getOrg &&
      organizationList?.find((org) => org.id === getOrg.id)
    ) {
      const org = organizationList?.find((org) => org.id === getOrg.id);

      dispatch(
        setCurrentOrganization({
          id: org.id,
          name: org.displayName,
        })
      );
    }
  }, [organizationList]);

  const handleSupport = () => {
    if (toggleIntercom) {
      setToggleIntercom(!toggleIntercom);
      shutdown();
      hide();
    } else {
      setToggleIntercom(!toggleIntercom);
      boot();
      show();
    }
  };

  if (session == null || orgsLoading) {
    return (
      <div className="w-full min-h-[100dvh] flex justify-center items-center bg-background">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-6 h-6 text-accent-foreground animate-spin fill-secondary"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (
    organizationList?.length === 0 ||
    !currentOrg ||
    (currentOrg && !organizationList?.find((org) => org.id === currentOrg.id))
  ) {
    return <OrganizationPage availableOrgs={organizationList} />;
  }

  return (
    <div>
      <nav className="px-4 py-3 border-b border-border lg:hidden">
        <div className="flex items-center justify-between">
          <a className="text-lg font-semibold text-primary-text" href="#">
            LLmate Studio
          </a>

          <button
            type="button"
            className="flex items-center justify-center outline-none"
            onClick={() => setToggleSidebar(!toggleSidebar)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6 fill-primary-text"
            >
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {toggleSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setToggleSidebar(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-page transform ${toggleSidebar ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-primary-text">LLmate Studio</h2>
          <button
            className="text-primary-text"
            onClick={() => setToggleSidebar(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 fill-icon-color hover:fill-icon-color-hover"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="h-full mt-4">
          <ul className="flex flex-col px-2 space-y-2 font-medium">
            <li>
              <button
                className={`w-full text-left py-2 px-4 rounded text-xs ${currentSelected === "home"
                  ? "bg-active-bg text-active-text"
                  : "hover:bg-active-bg-hover text-primary-text"
                  }`}
                onClick={handleHomeRoute}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-2 px-4 rounded text-xs ${currentSelected === "assistant"
                  ? "bg-active-bg text-active-text"
                  : "hover:bg-active-bg-hover text-primary-text"
                  }`}
                onClick={() => handleRoute("/assistant")}
              >
                Assistant
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-2 px-4 rounded text-xs ${currentSelected === "dashboard"
                  ? "bg-active-bg text-active-text"
                  : "hover:bg-active-bg-hover text-primary-text"
                  }`}
                onClick={() => handleRoute("/dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-2 px-4 rounded text-xs ${currentSelected === "notebook"
                  ? "bg-active-bg text-active-text"
                  : "hover:bg-active-bg-hover text-primary-text"
                  }`}
                onClick={() => handleNotebookRoute("/notebook")}
              >
                Notebook
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-2 px-4 rounded text-xs ${currentSelected === "datasource"
                  ? "bg-active-bg text-active-text"
                  : "hover:bg-active-bg-hover text-primary-text"
                  }`}
                onClick={() => handleRoute("/datasource")}
              >
                Datasource
              </button>
            </li>
          </ul>

          <div className="flex flex-col px-2 mt-4 space-y-2 border-t border-border-color">
            <ThemeToggleButton />
            {/* <UserMenu />
            <SidebarMenu />

            <button
              className={`w-full text-left py-2 px-4 rounded ${
                toggleIntercom ? "bg-active-bg" : "hover:bg-active-bg-hover"
              }`}
              onClick={handleSupport}
            >
              Support
            </button> */}
          </div>
        </nav>
      </div>

      <div className="relative z-50 hidden lg:block">
        <div className="fixed inset-0 bg-page opacity-10 lg:hidden"></div>

        <nav className={`fixed top-0 bottom-0 left-0 flex flex-col bg-page sm:max-w-xs `}>
          <div className="flex w-full h-full">

            {
              isSiderbarFull
                ? <div className="w-full h-full border-r border-border-color bg-primary">
                  <div className="flex flex-col items-center justify-between w-56 h-full pb-3">
                    <div className="flex flex-col w-full space-y-2.5">
                      <div className="w-full h-[49px] px-3 border-b border-border-color">
                        <Link
                          href="/"
                          className="flex items-center w-full h-full"
                        >
                          <img
                            src={
                              versionPro
                                ? theme === "dark"
                                  ? "/assets/logo-pro-dark.svg"
                                  : "/assets/logo-pro-light.svg"
                                : theme === "dark"
                                  ? "/assets/logo-free-dark.svg"
                                  : "/assets/logo-free-light.svg"
                            }
                            alt="logo"
                            loading="lazy"
                          />
                        </Link>
                      </div>
                      <span className="text-[11px] text-[#9D9EA5] px-3">MAIN</span>
                      <ul className="flex flex-col w-full px-3 space-y-1 font-roboto">
                        <li
                          onClick={() => handleHomeRoute()}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Home"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "home"
                            ? "bg-active-bg text-primary-text"
                            : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                            }`}
                        >
                          <div
                            className="flex items-center justify-center space-x-2 text-sm"
                          >
                            <HomeIcon />
                            <span className="">Home</span>
                          </div>
                        </li>

                        <li
                          onClick={() => handleRoute("/assistant")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Assistant"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "assistant"
                            ? "bg-active-bg text-primary-text"
                            : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                            }`}
                        >
                          <div
                            className="flex items-center justify-center space-x-2 text-sm"
                          >
                            <AssistantIcon />
                            <span className="">Assistant</span>
                          </div>
                        </li>

                        <li
                          onClick={() => handleRoute("/dashboard")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Dashboard"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "dashboard"
                            ? "bg-active-bg text-primary-text"
                            : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                            }`}
                        >
                          <div
                            className="flex items-center justify-center space-x-2 text-sm"
                          >
                            <DashboardIcon />
                            <span className="">Dashboard</span>
                          </div>
                        </li>

                        <li
                          onClick={() => handleNotebookRoute("/notebook")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Notebook"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "notebook"
                            ? "bg-active-bg text-primary-text"
                            : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                            }`}
                        >
                          <div
                            className="flex items-center justify-center space-x-2 text-sm"
                          >
                            <NotebookIcon />
                            <span className="">Notebook</span>
                          </div>
                        </li>

                        <li
                          onClick={() => handleRoute("/datasource")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Datasource"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "datasource"
                            ? "bg-active-bg text-primary-text"
                            : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                            }`}
                        >
                          <div
                            className="flex items-center justify-center space-x-2 text-sm"
                          >
                            <DatasourceIcon />
                            <span className="">Datasource</span>
                          </div>
                        </li>
                      </ul>

                      <div className="flex flex-col border-y border-border-color py-2 space-y-2.5 mx-3">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                          <span className="text-[11px] text-[#9D9EA5]">SETTINGS</span>
                          <span className="transition-transform transform">
                            {
                              isSettingsOpen
                                ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <g transform="rotate(180, 8, 8)">
                                    <path d="M8 10.2663L4 6.26634L4.93333 5.33301L8 8.39967L11.0667 5.33301L12 6.26634L8 10.2663Z" fill="#5F6368" />
                                  </g>
                                </svg>
                                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 10.2663L4 6.26634L4.93333 5.33301L8 8.39967L11.0667 5.33301L12 6.26634L8 10.2663Z" fill="#5F6368" />
                                </svg>
                            }
                          </span>
                        </div>

                        {
                          isSettingsOpen && <ul className="flex flex-col w-full space-y-1 font-roboto">
                            <li
                              onClick={() => handleRoute("/team")}
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Team"
                              data-tooltip-place="right"
                              className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "team"
                                ? "bg-active-bg text-primary-text"
                                : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                                }`}
                            >
                              <div
                                className="flex items-center justify-center space-x-2 text-sm"
                              >
                                <TeamIcon />
                                <span className="">Team</span>
                              </div>
                            </li>

                            <li
                              onClick={() => handleRoute("/model-management")}
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Model Management"
                              data-tooltip-place="right"
                              className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "model-management"
                                ? "bg-active-bg text-primary-text"
                                : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                                }`}
                            >
                              <div
                                className="flex items-center justify-center space-x-2 text-sm"
                              >
                                <ModelManagementIcon />
                                <span className="">Model Management</span>
                              </div>
                            </li>

                            <li
                              onClick={() => handleRoute("/api-key")}
                              data-tooltip-id="tooltip"
                              data-tooltip-content="API Keys"
                              data-tooltip-place="right"
                              className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "api-key"
                                ? "bg-active-bg text-primary-text"
                                : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                                }`}
                            >
                              <div
                                className="flex items-center justify-center space-x-2 text-sm"
                              >
                                <ApiKeyIcon />
                                <span className="">API Keys</span>
                              </div>
                            </li>

                            {/* <li
                              onClick={() => handleRoute("/user-info/facebook_ads")}
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Data Connections"
                              data-tooltip-place="right"
                              className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "data-connections"
                                ? "bg-active-bg text-primary-text"
                                : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                                }`}
                            >
                              <div
                                className="flex items-center justify-center space-x-2 text-sm"
                              >
                                <DataConnectionIcon />
                                <span className="">Data Connections</span>
                              </div>
                            </li> */}

                            <li
                              onClick={() => handleRoute("/org-info/facebook_ads")}
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Data Pipelines"
                              data-tooltip-place="right"
                              className={`flex items-center group w-full h-8 px-2 cursor-pointer rounded ${currentSelected === "data-pipeline"
                                ? "bg-active-bg text-primary-text"
                                : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                                }`}
                            >
                              <div
                                className="flex items-center justify-center space-x-2 text-sm"
                              >
                                <DataPipelineIcon />
                                <span className="">Data Pipelines</span>
                              </div>
                            </li>
                          </ul>
                        }

                      </div>
                      <ul className="flex flex-col w-full px-3 space-y-1 font-roboto">
                        <li
                          onClick={() => handleSupport()}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Support"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer rounded ${toggleIntercom
                            ? "bg-active-bg text-primary-text"
                            : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                            }`}
                        >
                          <div
                            className="flex items-center justify-center px-2 space-x-2 text-sm"
                          >
                            <SupportIcon />
                            <span className="">Support</span>
                          </div>
                        </li>
                      </ul>
                    
                    </div>

                    {/* <div className="flex flex-col items-center w-full space-y-1">
                      <div className="flex flex-col w-full">
                        <ThemeToggleButton />
                      </div>

                      <div className="flex flex-col w-full px-auto">
                        <UserMenu />
                      </div>

                      <div className="flex flex-col w-full">
                        <SidebarMenu />
                      </div>

                      <div
                        className={`flex items-center group h-8 w-full cursor-pointer ${toggleIntercom
                            ? "bg-active-bg border-active-border"
                            : `border-transparent hover:bg-active-bg-hover`
                          }`}
                        onClick={() => handleSupport()}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Support"
                        data-tooltip-place="right"
                      >
                        {toggleIntercom || (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-4 h-4 ${toggleIntercom
                                ? "fill-icon-color-hover"
                                : "fill-icon-color"
                              }`}
                            viewBox="0 0 256 256"
                          >
                            <path d="M232,128v80a40,40,0,0,1-40,40H136a8,8,0,0,1,0-16h56a24,24,0,0,0,24-24H192a24,24,0,0,1-24-24V144a24,24,0,0,1,24-24h23.65A88,88,0,0,0,66,65.54,87.29,87.29,0,0,0,40.36,120H64a24,24,0,0,1,24,24v40a24,24,0,0,1-24,24H48a24,24,0,0,1-24-24V128A104.11,104.11,0,0,1,201.89,54.66,103.41,103.41,0,0,1,232,128Z"></path>
                          </svg>
                        )}

                        {toggleIntercom && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 fill-active-text"
                            viewBox="0 0 256 256"
                          >
                            <path d="M232,128v80a40,40,0,0,1-40,40H136a8,8,0,0,1,0-16h56a24,24,0,0,0,24-24H192a24,24,0,0,1-24-24V144a24,24,0,0,1,24-24h23.65A88,88,0,0,0,66,65.54,87.29,87.29,0,0,0,40.36,120H64a24,24,0,0,1,24,24v40a24,24,0,0,1-24,24H48a24,24,0,0,1-24-24V128A104.11,104.11,0,0,1,201.89,54.66,103.41,103.41,0,0,1,232,128Z"></path>
                          </svg>
                        )}
                      </div>
                    </div> */}
                  </div>
                </div>
                : <div className="w-12 h-full border-r border-border-color">
                  <div className="flex flex-col items-center justify-between w-full h-full pb-3">
                    <div className="flex flex-col items-center w-full space-y-2.5">
                      <div className="w-full h-[49px] border-b border-border-color">
                        <Link
                          href="/"
                          className="flex items-center justify-center w-full h-full"
                        >
                          <img
                            src={
                              versionPro
                                ? theme === "dark"
                                  ? "/assets/logo-pro-dark.svg"
                                  : "/assets/logo-pro-light.svg"
                                : theme === "dark"
                                  ? "/assets/logo-free-dark.svg"
                                  : "/assets/logo-free-light.svg"
                            }
                            alt="logo"
                            loading="lazy"
                          />
                        </Link>
                      </div>

                      <ul className="flex flex-col w-full space-y-1.5">
                        <li
                          onClick={() => handleHomeRoute()}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Home"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "home"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <HomeIcon />
                          </div>
                        </li>

                        <li
                          onClick={() => handleRoute("/assistant")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Assistant"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer `}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "assistant"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <AssistantIcon />
                          </div>
                        </li>
                        <li
                          onClick={() => handleRoute("/dashboard")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Dashboard"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "dashboard"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <DashboardIcon />
                          </div>
                        </li>
                        <li
                          onClick={() => handleNotebookRoute("/notebook")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Notebook"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "notebook"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <NotebookIcon />
                          </div>
                        </li>
                        <li
                          onClick={() => handleRoute("/datasource")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Datasource"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "datasource"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <DatasourceIcon />
                          </div>
                        </li>
                        <span className="h-[2px] bg-[#E8E9EE] w-3/5 mx-auto"></span>
                        <li
                          onClick={() => handleRoute("/team")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Team"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "team"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <TeamIcon />
                          </div>
                        </li>
                        <li
                          onClick={() => handleRoute("/model-management")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Model Management"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "model-management"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <ModelManagementIcon />
                          </div>
                        </li>

                        <li
                          onClick={() => handleRoute("/api-key")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="API Keys"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "api-key"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <ApiKeyIcon />
                          </div>
                        </li>

                        {/* <li
                          onClick={() => handleRoute("/user-info/facebook_ads")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Data Connections"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "data-connections"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <DataConnectionIcon />
                          </div>
                        </li> */}

                        <li
                          onClick={() => handleRoute("/org-info/facebook_ads")}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Data Pipelines"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${currentSelected === "data-pipeline"
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <DataPipelineIcon />
                          </div>
                        </li>

                        <li
                          onClick={() => handleSupport()}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Support"
                          data-tooltip-place="right"
                          className={`flex items-center group w-full h-8 cursor-pointer`}
                        >
                          <div
                            className={`flex items-center justify-center mx-auto p-2 rounded ${toggleIntercom
                              ? "bg-active-bg text-primary-text"
                              : "bg-transparent hover:bg-active-bg-hover text-secondary-text"
                              }`}
                          >
                            <SupportIcon />
                          </div>
                        </li>



                      </ul>
                    </div>

                    {/* <div className="flex flex-col items-center w-full space-y-1">
                      <div className="flex flex-col items-center w-full">
                        <ThemeToggleButton />
                      </div>

                      <div className="flex flex-col items-center w-full">
                        <UserMenu />
                      </div>

                      <div className="flex flex-col items-center w-full">
                        <SidebarMenu />
                      </div>

                      <div
                        className={`flex items-center justify-center group h-8 w-full cursor-pointer ${toggleIntercom
                          ? "bg-active-bg border-active-border"
                          : `border-transparent hover:bg-active-bg-hover`
                          }`}
                        onClick={() => handleSupport()}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Support"
                        data-tooltip-place="right"
                      >
                        {toggleIntercom || (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-4 h-4 ${toggleIntercom
                              ? "fill-icon-color-hover"
                              : "fill-icon-color"
                              }`}
                            viewBox="0 0 256 256"
                          >
                            <path d="M232,128v80a40,40,0,0,1-40,40H136a8,8,0,0,1,0-16h56a24,24,0,0,0,24-24H192a24,24,0,0,1-24-24V144a24,24,0,0,1,24-24h23.65A88,88,0,0,0,66,65.54,87.29,87.29,0,0,0,40.36,120H64a24,24,0,0,1,24,24v40a24,24,0,0,1-24,24H48a24,24,0,0,1-24-24V128A104.11,104.11,0,0,1,201.89,54.66,103.41,103.41,0,0,1,232,128Z"></path>
                          </svg>
                        )}

                        {toggleIntercom && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 fill-active-text"
                            viewBox="0 0 256 256"
                          >
                            <path d="M232,128v80a40,40,0,0,1-40,40H136a8,8,0,0,1,0-16h56a24,24,0,0,0,24-24H192a24,24,0,0,1-24-24V144a24,24,0,0,1,24-24h23.65A88,88,0,0,0,66,65.54,87.29,87.29,0,0,0,40.36,120H64a24,24,0,0,1,24,24v40a24,24,0,0,1-24,24H48a24,24,0,0,1-24-24V128A104.11,104.11,0,0,1,201.89,54.66,103.41,103.41,0,0,1,232,128Z"></path>
                          </svg>
                        )}
                      </div>
                    </div> */}
                  </div>
                </div>
            }
          </div>
        </nav>
      </div>

      <div className={`mx-auto ${isSiderbarFull ? "lg:ml-56" : "lg:ml-12"}`}>
        {showTopBanner && <TopBanner onClose={handleCloseTopBanner} />}
        <div className="w-full h-full bg-page">{children}</div>
      </div>

      <CreateDashboard
        createDashboard={createDashboard}
        setCreateDashboard={setCreateDashboard}
      />

      <CreateNotebookModal
        showModal={showCreateNotebook}
        setShowModal={setShowCreateNotebook}
      />
    </div>
  );
};

export default SidebarLayout;
