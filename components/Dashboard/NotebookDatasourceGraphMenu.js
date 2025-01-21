import React, { useEffect, useRef, useState } from "react";
import DashboardMenu from "./DashboardMenu";
import NormalChart from "../common/NormalChart";
import _ from "lodash";
import {
  useGetDatasourceGraphQuery,
  useUpdateDatasourceVisualizationConfigMutation,
} from "@/store/datasource";

const MAX_PAGE = 9;

const NotebookDatasourceGraphMenu = ({
  show,
  setShow,
  dataField,
  datasourceId = null,
  eventId = null,
  runId = null,
  visualizationInfo = {},
  setvisualizationConfig = () => {},
  setVisualizationInfo = () => {},
  fromOutput = false,
  config = {},
  handleConfig = () => {},
}) => {
  const [visualizationConfig, setVisualizationConfig] = useState({});
  const [fields, setFields] = useState([]);
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveChangeLoading, setSaveChangeLoading] = useState(false);

  const [page, setPage] = useState(0);

  const modalRef = useRef(null);

  const [updateDatasourceVisualizationConfig, {}] =
    useUpdateDatasourceVisualizationConfigMutation();

  const { data, error, isFetching } = useGetDatasourceGraphQuery({
    datasource_id: datasourceId,
    run_id: runId,
    event_id: eventId,
    skip: 0,
    limit: 10 * (page + 1),
    payload: {
      data_visualization_config: visualizationConfig,
    },
  });

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

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setVisualizationConfig([]);
      setFields([]);
      setChartData({});
      setShow(false);
    }
  };

  useEffect(() => {
    if (show) {
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
  }, [show]);

  useEffect(() => {
    if (Object.keys(dataField).length > 0) {
      const columnData = Object.keys(dataField);

      const fieldData = columnData.map((col) => {
        return { name: col, sort_order: "" };
      });

      setFields(fieldData);
    } else {
      setFields([]);
    }
  }, [dataField]);

  const handleSaveChange = () => {
    if (!fromOutput) {
      setSaveChangeLoading(true);

      const payload = {
        data_visualization_config: visualizationConfig,
      };

      if (runId && eventId) {
        updateDatasourceVisualizationConfig({
          datasource_id: datasourceId,
          run_id: runId,
          event_id: eventId,
          payload: payload,
        }).then((response) => {
          if (response.data === null) {
            setVisualizationConfig([]);
            setFields([]);
            setChartData({});
            setVisualizationInfo(visualizationConfig);
            setSaveChangeLoading(false);
            setShow(false);
          }

          if (response.error) {
            setErrorMessage(response.error?.data?.message);
            setSaveChangeLoading(false);
          }
        });
      }
    } else {
      handleConfig(visualizationConfig);
      setShow(false);
    }
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
        show ? "" : "hidden"
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
                className="flex items-center justify-center"
                onClick={() => {
                  setVisualizationConfig([]);
                  setFields([]);
                  setChartData({});
                  setShow(false);
                }}
              >
                <svg
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-white"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                  />
                </svg>
              </span>

              <span className="text-sm font-medium text-white capitalize line-clamp-1 whitespace-nowrap">
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
                    <div className="flex sticky px-4 pt-3 pb-2.5 top-0 left-0 z-[100] text-xs text-white capitalize font-medium justify-between rounded-tl-md rounded-tr-md w-full border-b border-border-color bg-primary">
                      Preview
                    </div>

                    {errorMessage !== "" && (
                      <div className="flex flex-col items-center justify-center w-full h-full max-h-full px-16 space-y-4 text-sm font-medium tracking-wider text-white/50">
                        <div className="flex items-center justify-center w-full">
                          <span className="flex items-center justify-center">
                            <svg
                              viewBox="0 0 48 48"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6 fill-white/25"
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
                      <div className="flex items-center space-x-3 text-xs font-medium text-primary-white capitalize">
                        <span>Edit Chart</span>
                      </div>
                    </div>

                    <div className="w-full h-full max-h-full px-2 pb-2">
                      <div className="w-full h-full max-h-full p-2 rounded-md bg-page-new">
                        <DashboardMenu
                          setVisualizationConfig={setVisualizationConfig}
                          fields={fields}
                          config={fromOutput ? config : visualizationInfo}
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

export default NotebookDatasourceGraphMenu;
