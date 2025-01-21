import React, { useState } from "react";
import Split from "react-split";
import OrgInfoSidebar from "./OrgInfoSidebar";
import { Db_type, getDbTypeDetails } from "../home/DatasourcesTable";
import CreateDatasourceModal from "../Datasource/CreateDatasourceModal";

const OrgDetailsLayout = ({ children, currentName = "" }) => {
  const [showCreateAssistant, setShowCreateAssistant] = useState(false);
  const [isCollapse, setIsCollapse] = useState(false);
  const [showThirdParty, setShowThirdParty] = useState(false);

  return (
    <div className="flex w-full h-screen overflow-hidden font-roboto">
      <Split
        className="split_row"
        direction="horizontal"
        minSize={isCollapse ? 0 : 100}
        gutterSize={2}
        cursor="e-resize"
        // sizes={[20, 80]}
        sizes={[isCollapse ? "48px" : 20, isCollapse ? 96.5 : 80]}
      >
        <div className="w-full h-full max-h-full">
          <OrgInfoSidebar
            setShowCreateAssistant={setShowCreateAssistant}
            isCollapse={isCollapse}
            setIsCollapse={setIsCollapse}
          />
        </div>

        <div className="w-full h-full max-h-full">
          <div className="relative flex flex-col w-full h-full overflow-y-auto recent__bar">
            <div className="sticky top-0 left-0 z-50 flex flex-col w-full bg-page">
              <div className="flex items-center justify-between h-12 px-4 border-b border-border-color">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center cursor-pointer">
                    {(() => {
                      const { img, label } = getDbTypeDetails(
                        currentName,
                        Db_type
                      );
                      return img ? (
                        <img
                          src={img}
                          alt={label || "Icon"}
                          className="w-4 h-4"
                        />
                      ) : null;
                    })()}
                  </span>
                  <p className="text-base font-normal capitalize text-primary-text leading-[0px]">
                    {currentName}
                  </p>
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center px-3 mt-2 space-x-2 text-xs font-bold tracking-wide rounded-md h-7 text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                  onClick={() => setShowThirdParty(true)}
                >
                  <span>Connect Data</span>
                </button>
              </div>
            </div>

            <div className="w-full px-4 pt-4">{children}</div>
          </div>
        </div>
      </Split>

      {showThirdParty && (
        <CreateDatasourceModal
          show={showThirdParty}
          setShow={setShowThirdParty}
          isThirdParty={true}
        />
      )}
    </div>
  );
};

export default OrgDetailsLayout;
