import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const useUnsavedChangesWarning = (
  unsavedChanges,
  hadleUnsavedChanges,
  saveChanges
) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [nextRoute, setNextRoute] = useState(null);

  useEffect(() => {
    const handleWindowClose = (event) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    const handleBrowseAway = (url) => {
      if (unsavedChanges) {
        setShowModal(true);
        setNextRoute(url);
        router.events.emit("routeChangeError");
        throw `Route change to "${url}" was aborted (this is expected behavior).`;
      }
    };

    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", handleBrowseAway);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  }, [unsavedChanges, router]);

  const confirmNavigation = () => {
    saveChanges();
    setShowModal(false);
    if (nextRoute) {
      router.push(nextRoute);
    }
  };

  const cancelNavigation = () => {
    hadleUnsavedChanges();
    setShowModal(false);

    if (nextRoute) {
      router.push(nextRoute);
    }
  };

  const closeNavigation = () => {
    setShowModal(false);
    setNextRoute(null);
  };

  return {
    showModal,
    setShowModal,
    confirmNavigation,
    cancelNavigation,
    closeNavigation,
  };
};

export default useUnsavedChangesWarning;
