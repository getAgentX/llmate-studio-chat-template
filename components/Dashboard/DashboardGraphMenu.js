import React, { useEffect, useRef, useState } from "react";
import DashboardMenu from "./DashboardMenu";
import NormalChart from "../common/NormalChart";
import _ from "lodash";
import { useDashboardContext } from "@/context/DashboardContext";
import {
  useAddVisualizationConfigMutation,
  useGetGraphQuery,
} from "@/store/dashboard";

const MAX_PAGE = 9;

const DashboardGraphMenu = ({
  datasourceId = null,
  sectionId = null,
  onChange,
}) => {
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveChangeLoading, setSaveChangeLoading] = useState(false);

  const {
    selectedWidget,
    showWidgetMenu,
    setShowWidgetMenu,
    dataframeColumns,
    setDataframeColumns,
    visualizationConfig,
    setVisualizationConfig,
    resetSelectedWidget,
  } = useDashboardContext();

  const { data, error, isFetching } = useGetGraphQuery(
    {
      dashboard_id: datasourceId,
      section_id: sectionId,
      widget_id: selectedWidget.id,
      skip: 0,
      limit: 10 * (page + 1),
      payload: {
        data_visualization_config: visualizationConfig,
      },
    },
    { skip: !selectedWidget.id }
  );

  const [addVisualizationConfig, {}] = useAddVisualizationConfigMutation();

  useEffect(() => {
    setIsLoading(true);

    if (data) {
      const yAxis = Object.keys(data?.y_axis)?.map((key) => ({
        label: key,
        data: data?.y_axis[key],
      }));

      const chartSchema = {
        labels: data.x_axis || [],
        datasets: yAxis,
      };

      setChartData(chartSchema);
      setIsLoading(false);
    }
  }, [data, visualizationConfig]);

  useEffect(() => {
    setErrorMessage("");

    if (error?.data?.message) {
      setErrorMessage(error?.data?.message);
    }
  }, [error]);

  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setVisualizationConfig([]);
      setDataframeColumns([]);
      setChartData({});
      resetSelectedWidget();
      setErrorMessage("");
      setShowWidgetMenu(false);
    }
  };

  useEffect(() => {
    if (showWidgetMenu) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showWidgetMenu]);

  const handleSaveChange = () => {
    setErrorMessage("");
    setSaveChangeLoading(true);

    const payload = {
      data_visualization_config: visualizationConfig,
    };

    addVisualizationConfig({
      dashboard_id: datasourceId,
      section_id: sectionId,
      widget_id: selectedWidget.id,
      payload: payload,
    }).then((response) => {
      if (response.data === null) {
        onChange();
        setVisualizationConfig([]);
        setDataframeColumns([]);
        setChartData({});
        setErrorMessage("");
        resetSelectedWidget();
        setSaveChangeLoading(false);
        setShowWidgetMenu(false);
      }

      if (response.error) {
        setErrorMessage(response.error?.data?.message);
        setSaveChangeLoading(false);
      }
    });
  };

  const isConfigEmpty = (config) => {
    if (_.isEmpty(config)) {
      return true;
    }

    const { indexes, columns, values } = config;

    return _.isEmpty(indexes) && _.isEmpty(columns) && _.isEmpty(values);
  };

  const handleZoomIn = () => {
    if (isFetching || page == 0) return;
    setPage(page - 1);
  };

  const handleZoomOut = () => {
    if (isFetching || page == MAX_PAGE) return;
    setPage(page + 1);
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
        showWidgetMenu ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 w-full overflow-x-hidden overflow-y-auto border-l max-w-7xl bg-page border-border-color recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col flex-1 h-full space-y-2">
          <div className="flex sticky top-0 left-0 z-[100] bg-page w-full items-center h-12 px-4 justify-between border-b border-border-color">
            <div className="flex items-center space-x-4 text-sm font-medium tracking-wide text-white">
              <span
                className="flex items-center justify-center cursor-pointer"
                onClick={() => {
                  setVisualizationConfig([]);
                  setDataframeColumns([]);
                  setChartData({});
                  setErrorMessage("");
                  resetSelectedWidget();
                  setShowWidgetMenu(false);
                }}
              >
                <svg
                  viewBox="0 0 12 13"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 fill-icon-color hover:fill-primary-text"
                >
                  <path d="M1.33317 12.3307L0.166504 11.1641L4.83317 6.4974L0.166504 1.83073L1.33317 0.664062L5.99984 5.33073L10.6665 0.664062L11.8332 1.83073L7.1665 6.4974L11.8332 11.1641L10.6665 12.3307L5.99984 7.66406L1.33317 12.3307Z" />
                </svg>
              </span>

              <span className="text-sm font-medium text-primary-text capitalize line-clamp-1 whitespace-nowrap">
                Change Graph Type
              </span>
            </div>

            <button
              type="button"
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
              onClick={() => handleSaveChange()}
              disabled={isFetching || saveChangeLoading}
            >
              {saveChangeLoading && (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 animate-spin text-white fill-[#295EF4]"
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

                  <span className="sr-only">Loading...</span>
                </div>
              )}

              <span>Save</span>
            </button>
          </div>

          <div className="flex flex-1 h-full px-2 pb-1 overflow-hidden">
            <div className="flex-1">
              <div className="grid w-full h-full max-h-full grid-cols-12 rounded-md bg-primary">
                <div className="col-span-7 overflow-y-auto border-r recent__bar border-border">
                  <div className="relative flex flex-col h-full max-h-full">
                    <div className="flex sticky px-4 pt-3 pb-2.5 top-0 left-0 z-[100] text-xs text-primary-text capitalize font-medium justify-between rounded-tl-md rounded-tr-md w-full border-b border-border-color bg-primary">
                      Preview
                    </div>

                    {errorMessage !== "" && (
                      <div className="flex flex-col items-center justify-center w-full h-full max-h-full px-16 space-y-4 text-sm font-medium tracking-wider text-secondary-text">
                        <div className="flex items-center justify-center w-full">
                          <span className="flex items-center justify-center">
                            <svg
                              viewBox="0 0 48 48"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6 fill-secondary-text"
                            >
                              <path d="M10.6667 37.3333H16V18.6667H10.6667V37.3333ZM21.3333 37.3333H26.6667V10.6667H21.3333V37.3333ZM32 37.3333H37.3333V26.6667H32V37.3333ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V5.33333C0 3.86667 0.522222 2.61111 1.56667 1.56667C2.61111 0.522222 3.86667 0 5.33333 0H42.6667C44.1333 0 45.3889 0.522222 46.4333 1.56667C47.4778 2.61111 48 3.86667 48 5.33333V42.6667C48 44.1333 47.4778 45.3889 46.4333 46.4333C45.3889 47.4778 44.1333 48 42.6667 48H5.33333ZM5.33333 42.6667H42.6667V5.33333H5.33333V42.6667Z" />
                            </svg>
                          </span>
                        </div>
                        <p className="text-center">Invaild graph config</p>
                      </div>
                    )}

                    {errorMessage === "" && (
                      <div className="h-full max-h-full p-2">
                        {isConfigEmpty(visualizationConfig) || (
                          <div className="relative w-full h-full">
                            {isLoading && (
                              <div className="flex items-center justify-center w-full h-full min-h-full text-white rounded-md bg-page">
                                <div role="status">
                                  <svg
                                    aria-hidden="true"
                                    className="w-6 h-6 animate-spin text-border fill-[#295EF4]"
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

                                  <span className="sr-only">Loading...</span>
                                </div>
                              </div>
                            )}

                            {!isLoading &&
                              Object.keys(chartData).length > 0 && (
                                <div className="relative w-full h-full min-h-full bg-page group">
                                  <div className="w-full">
                                    <div
                                      className={`animate-full-width ${
                                        isFetching && "active"
                                      }`}
                                    ></div>
                                  </div>

                                  <NormalChart
                                    data={chartData}
                                    chartType={visualizationConfig.graph_type}
                                  />

                                  <div
                                    className="absolute flex-col hidden space-y-2 top-2 group-hover:flex right-3"
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                    <span
                                      className="flex items-center justify-center"
                                      onClick={handleZoomIn}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className={`w-5 h-5 fill-secondary-text hover:fill-primary-text ${
                                          page === 0 || isFetching
                                            ? "cursor-default"
                                            : "cursor-pointer"
                                        }`}
                                      >
                                        <path d="M10 2c-4.411 0-8 3.589-8 8s3.589 8 8 8a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8zm4 9h-3v3H9v-3H6V9h3V6h2v3h3v2z"></path>
                                      </svg>
                                    </span>

                                    <span
                                      className="flex items-center justify-center"
                                      onClick={handleZoomOut}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className={`w-5 h-5 fill-secondary-text hover:fill-primary-text ${
                                          page === MAX_PAGE || isFetching
                                            ? "cursor-default"
                                            : "cursor-pointer"
                                        }`}
                                      >
                                        <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zM6 9h8v2H6V9z"></path>
                                      </svg>
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}

                        {isConfigEmpty(visualizationConfig) && (
                          <div className="flex items-center justify-center w-full h-full">
                            <span className="flex items-center justify-center">
                              <svg
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-10 h-10 fill-white/25"
                              >
                                <path d="M10.6667 37.3333H16V18.6667H10.6667V37.3333ZM21.3333 37.3333H26.6667V10.6667H21.3333V37.3333ZM32 37.3333H37.3333V26.6667H32V37.3333ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V5.33333C0 3.86667 0.522222 2.61111 1.56667 1.56667C2.61111 0.522222 3.86667 0 5.33333 0H42.6667C44.1333 0 45.3889 0.522222 46.4333 1.56667C47.4778 2.61111 48 3.86667 48 5.33333V42.6667C48 44.1333 47.4778 45.3889 46.4333 46.4333C45.3889 47.4778 44.1333 48 42.6667 48H5.33333ZM5.33333 42.6667H42.6667V5.33333H5.33333V42.6667Z" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-5 overflow-hidden">
                  <div className="flex flex-col h-full max-h-full space-y-2">
                    <div className="flex items-center sticky top-0 left-0 z-[100] bg-primary justify-between px-4 pt-3 pb-2.5 border-b border-border">
                      <div className="flex items-center space-x-3 text-xs font-medium capitalize text-primary-text">
                        <span>Edit Chart</span>
                      </div>
                    </div>

                    <div className="w-full h-full max-h-full px-2 pb-2">
                      <div className="w-full h-full max-h-full p-2 rounded-md bg-page-new">
                        <DashboardMenu
                          setVisualizationConfig={setVisualizationConfig}
                          fields={dataframeColumns}
                          config={visualizationConfig || {}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGraphMenu;
