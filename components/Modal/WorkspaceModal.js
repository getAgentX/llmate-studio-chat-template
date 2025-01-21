import React, { useEffect, useRef, useState } from "react";
import { useCreateOrganizationMutation } from "@/store/organization";
import { useDispatch } from "react-redux";
import { setCurrentOrganization } from "@/store/current_organization";
import { useRouter } from "next/router";
import { getSession, signIn } from "next-auth/react";

const WorkspaceModal = ({ 
  showWorkspaceModal, 
  setShowWorkspaceModal,
  // setShowCreateWorkspaceSuccessModal =()=> {},
  // setNewWorkSpaceData
 }) => {
  const [name, setName] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const workspaceRef = useRef(null);

  const [createOrganization, { data: res, isLoading, isError, error }] =
    useCreateOrganizationMutation();

  const dispatch = useDispatch();

  const router = useRouter();

  const handleOutsideClick = (e) => {
    if (workspaceRef.current && !workspaceRef.current.contains(e.target)) {
      setName("");
      setKeyValue("");
      setCheckbox(false);
      setShowWorkspaceModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const refreshAccessToken = () => {
    try {
      // const refreshedSession = await getSession();
      // if (refreshedSession.error === "RefreshAccessTokenError") {
      //   signIn();
      // }

      signIn("keycloak");
    } catch (error) {
      console.error("Failed to refresh access token", error);
    }
  };

  // const handleCreateOrg = () => {
  //   if (name !== "") {
  //     createOrganization({
  //       name: name,
  //       openai_preference: {
  //         openai_key_enabled: checkbox,
  //         openai_api_key: keyValue,
  //       },
  //     }).then((response) => {
  //       if (response) {
  //         if (response.data) {
  //           dispatch(
  //             setCurrentOrganization({
  //               id: response.data.id,
  //               name: name,
  //             })
  //           );

  //           setName("");
  //           setKeyValue("");
  //           setCheckbox(false);
  //           setErrorMessage(null);
  //           setShowWorkspaceModal(false);
  //           router.push("/");
  //         }

  //         if (response.error) {
  //           setErrorMessage(response.error.data.message);

  //           setTimeout(() => {
  //             setName("");
  //             setKeyValue("");
  //             setCheckbox(false);
  //             setErrorMessage(null);
  //             setShowWorkspaceModal(false);
  //           }, 3000);
  //         }
  //       }
  //     });
  //   }
  // };

  const handleCreateOrg = async () => {
    if (name !== "") {
      const response = await createOrganization({
        name: name,
        openai_preference: {
          openai_key_enabled: checkbox,
          openai_api_key: keyValue,
        },
      });

      if (response) {
        if (response.data) {
          // setNewWorkSpaceData({
          //     id: response.data.id,
          //     name: name,
          // })
          dispatch(
            setCurrentOrganization({
              id: response.data.id,
              name: name,
            })
          );

          setName("");
          setKeyValue("");
          setCheckbox(false);
          setErrorMessage(null);
          setShowWorkspaceModal(false);
          // setShowCreateWorkspaceSuccessModal(true)
          
          // Refresh the token
          refreshAccessToken();

          router.push("/");
        }

        if (response.error) {
          setErrorMessage(response.error.data.message);

          setTimeout(() => {
            setName("");
            setKeyValue("");
            setCheckbox(false);
            setErrorMessage(null);
            setShowWorkspaceModal(false);
          }, 3000);
        }
      }
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        showWorkspaceModal || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md border rounded-lg bg-dropdown-bg border-border-color"
        ref={workspaceRef}
      >
        <div className="relative flex items-center justify-center px-2 py-3 text-sm font-medium border-b border-border ">
          <div className="text-sm text-primary-text font-medium tracking-wider flex justify-center items-center ">
            Create Workspace
          </div>
          <span
            className="absolute flex items-center justify-center w-6 h-6 -translate-y-1/2 rounded-full cursor-pointer top-1/2 right-2 bg-background"
            onClick={() => setShowWorkspaceModal(false)}
          >
            <svg
              viewBox="0 0 12 13"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-icon-color hover:fill-primary-text"
            >
              <path d="M1.33317 12.3307L0.166504 11.1641L4.83317 6.4974L0.166504 1.83073L1.33317 0.664062L5.99984 5.33073L10.6665 0.664062L11.8332 1.83073L7.1665 6.4974L11.8332 11.1641L10.6665 12.3307L5.99984 7.66406L1.33317 12.3307Z" />
            </svg>
          </span>
        </div>

        <div className="flex flex-col px-4 pb-4 space-y-4">
          <div className="flex flex-col space-y-2 mt-4">
            <p className="text-sm font-normal text-primary-text">Workspace Name</p>

            <input
              type="text"
              className="w-full h-8 px-4 text-sm font-normal border rounded-md outline-none bg-page border-input-border focus:border-input-border-focus text-input-text placeholder:text-input-placeholder"
              value={name}
              placeholder="Enter your workspace name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* <div className="flex flex-col space-y-2">
            <p className="text-sm font-normal text-white/80">Your OpenAI Key</p>

            <input
              type="text"
              className="w-full px-4 py-3 text-sm text-white border rounded-md outline-none border-border bg-[#2A2C32] placeholder:text-white/40"
              value={keyValue}
              placeholder="Enter your own api key to host"
              onChange={(e) => setKeyValue(e.target.value)}
            />
          </div> */}

          {keyValue && (
            <label
              htmlFor="Option1" // Matches the input's id
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                id="Option1" // Ensures accessibility and matches `htmlFor`
                className="w-4 h-4 text-blue-600 rounded cursor-pointer border-border accent-secondary bg-foreground"
                checked={checkbox} // Reflects current state
                onChange={(e) => setCheckbox(e.target.checked)} // Updates state
              />
              <div>
                <p className="text-xs font-normal tracking-wide text-white">
                  Enable OpenAI Key?{" "}
                  <span className="text-white/40">(Click checkbox if yes)</span>
                </p>
              </div>
            </label>
          )}


          <button
            type="button"
            className="px-6 py-2 text-sm font-medium tracking-wide text-white transition-all duration-300 rounded-md disabled:bg-[#193892]/25 disabled:text-white/25 bg-secondary hover:bg-secondary-foreground"
            onClick={handleCreateOrg}
            disabled={name === "" ? true : false}
          >
            Create
          </button>

          {errorMessage && (
            <p className="text-sm font-normal tracking-wide text-red-500">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceModal;
