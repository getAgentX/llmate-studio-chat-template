import React, { useEffect, useRef, useState } from "react";
import SelectOption from "./SelectOption";
import GenerationInput from "../FineTunings/GenerationInput";
import GenerationOutput from "../FineTunings/GenerationOutput";
import ResolutionInput from "../FineTunings/ResolutionInput";
import ResolutionOutput from "../FineTunings/ResolutionOutput";
import FinetuningWidget from "../Datasource/FinetuningWidget";
import TableModal from "../Modal/TableModal";
import { useRefreshDatasourceGraphEventMutation } from "@/store/datasource";
import DatasourceGraphMenu from "../Dashboard/DatasourceGraphMenu";
import PivotGraph from "../Dashboard/PivotGraph";
import PivotGraphTable from "../Dashboard/PivotGraphTable";

const OverallResponse = ({ data = {}, eventStats = {}, slug = null }) => {
  const [currentTab, setCurrentTab] = useState("dataframe");
  const [toggleDataframe, setToggleDataframe] = useState(false);
  const [currentDataframe, setCurrentDataframe] = useState("table");

  const [toggleResponse, setToggleResponse] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("summary");

  const [generationView, setGenerationView] = useState("output");
  const [toggleGeneration, setToggleGeneration] = useState(true);

  const [resolutionView, setResolutionView] = useState("output");
  const [toggleResolution, setToggleResolution] = useState(true);

  const [eventId, setEventId] = useState(null);

  const [showTable, setShowTable] = useState(false);

  const [seeMoreTable, setSeeMoreTable] = useState({});

  const [showGraphChange, setShowGraphChange] = useState(false);

  const [dataframe, setDataframe] = useState({});
  const [chartType, setChartType] = useState("bar");
  const [visualizationInfo, setVisualizationInfo] = useState({});

  const modalRef = useRef(null);

  const [refreshDatasourceGraphEvent, { isLoading }] =
    useRefreshDatasourceGraphEventMutation();

  const handleShowMore = () => {
    let eventId;

    if (eventStats.generation_execution.dataframe !== null) {
      eventId = eventStats.generation_execution.id;
    }

    if (eventStats.regenerate_execution.dataframe !== null) {
      eventId = eventStats.regenerate_execution.id;
    }

    if (eventId) {
      refreshDatasourceGraphEvent({
        datasource_id: slug,
        run_id: eventStats.run_id,
        event_id: eventId,
      }).then((response) => {
        if (response) {
          if (response.data) {
            setSeeMoreTable(response.data.dataframe);
            setShowTable(true);
          }
        }
      });
    }
  };

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setCurrentTab("dataframe");
    } else {
      setCurrentTab("sql-response");
    }

    if (eventStats.validation?.steps_followed.length > 0) {
      setCurrentResponse("summary");
    } else {
      setCurrentResponse("generation");
    }
  }, []);

  useEffect(() => {
    if (eventStats.generation_execution) {
      if (eventStats.generation_execution.dataframe) {
        setDataframe(eventStats.generation_execution.dataframe);
        setEventId(eventStats.generation_execution.id);
      }

      setChartType(
        eventStats?.generation_execution?.data_visualization_config
          ?.graph_type || ""
      );
      setVisualizationInfo(
        eventStats.generation_execution?.data_visualization_config
      );
    }

    if (eventStats.regenerate_execution) {
      if (eventStats.regenerate_execution.dataframe) {
        setDataframe(eventStats.regenerate_execution.dataframe);
        setEventId(eventStats.regenerate_execution.id);
      }

      setChartType(
        eventStats?.regenerate_execution?.data_visualization_config
          ?.graph_type || ""
      );
      setVisualizationInfo(
        eventStats.regenerate_execution?.data_visualization_config
      );
    }
  }, [eventStats]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setToggleResponse(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const options = [
    {
      value: "dataframe",
      label: "Dataframe",
    },
    {
      value: "sql-response",
      label: "SQL Response",
    },
  ];

  const handleSelect = (value) => {
    setCurrentTab(value.value);
  };

  const handleDataframeChange = (e) => {
    if (e.target.checked) {
      setCurrentDataframe("chart");
    } else {
      setCurrentDataframe("table");
    }

    setToggleDataframe(e.target.checked);
  };

  const totalItems = data[Object.keys(data)[0]]?.length;

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const tableHeaders = Object.keys(data).map((key, index) => (
    <th
      key={index}
      className="px-4 py-2 text-xs font-normal tracking-wide text-white/50 border-t border-l border-r border-[#26282a] whitespace-nowrap"
    >
      {formatKey(key)}
    </th>
  ));

  const rows = (() => {
    const totalItems = data[Object.keys(data)[0]]?.length;

    return Array.from({ length: totalItems }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Object.keys(data).map((key, colIndex) => (
          <td
            key={`${rowIndex}-${colIndex}`} // Update key to be unique per cell
            className="px-4 py-2 text-xs bg-[#181A1C] tracking-wide border-r border-[#26282a] text-white whitespace-nowrap"
          >
            {data[key][rowIndex] ?? "N/A"}
          </td>
        ))}
      </tr>
    ));
  })();

  const handleGenerationChange = (e) => {
    if (e.target.checked) {
      setGenerationView("output");
    } else {
      setGenerationView("input");
    }

    setToggleGeneration(e.target.checked);
  };

  const handleResolutionChange = (e) => {
    if (e.target.checked) {
      setResolutionView("output");
    } else {
      setResolutionView("input");
    }

    setToggleResolution(e.target.checked);
  };

  return (
    <>
      <div className="flex flex-col space-y-2">
        <div className="w-full mx-auto space-y-6 text-white">
          <div className="flex flex-col px-4 py-4 space-y-6 bg-[#181A1C] rounded-md border border-border">
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between border-b border-border">
                <div className="flex-wrap items-center hidden w-full sm:flex max-w-fit">
                  {/* {Object.keys(data).length > 0 && ()} */}
                  <button
                    className={`text-xs pb-3 border-b-2 font-medium flex justify-center items-center space-x-2 min-w-16 px-2 tracking-wider transition-colors duration-300 ${
                      currentTab === "dataframe"
                        ? "text-accent border-secondary"
                        : "text-white/40 border-transparent"
                    }`}
                    onClick={() => setCurrentTab("dataframe")}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 11 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-3 h-3 ${
                          currentTab === "dataframe"
                            ? "fill-white"
                            : "fill-[#5F6368]"
                        }`}
                      >
                        <path d="M0.333252 10.8337V6.83366H2.33325V10.8337H0.333252ZM4.33325 10.8337V3.50033H6.33325V10.8337H4.33325ZM8.33325 10.8337V0.166992H10.3333V10.8337H8.33325Z" />
                      </svg>
                    </span>

                    <span>Dataframe</span>
                  </button>

                  <button
                    className={`text-xs pb-3 border-b-2 font-medium flex justify-center items-center space-x-2 min-w-16 px-2 tracking-wider capitalize transition-colors duration-300 ${
                      currentTab === "sql-response"
                        ? "text-accent border-secondary"
                        : "text-white/40 border-transparent"
                    }`}
                    onClick={() => setCurrentTab("sql-response")}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 15 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-3 h-3 ${
                          currentTab === "sql-response"
                            ? "fill-white"
                            : "fill-[#5F6368]"
                        }`}
                      >
                        <path d="M5.23325 13.583C4.0777 13.0497 3.13881 12.2441 2.41659 11.1663C1.69436 10.0886 1.33325 8.8719 1.33325 7.51634C1.33325 7.22745 1.34714 6.94412 1.37492 6.66634C1.4027 6.38856 1.44992 6.11634 1.51659 5.84967L0.749919 6.29967L0.083252 5.14967L3.26659 3.31634L5.09992 6.48301L3.93325 7.14967L3.03325 5.58301C2.91103 5.88301 2.81936 6.19412 2.75825 6.51634C2.69714 6.83856 2.66659 7.1719 2.66659 7.51634C2.66659 8.59412 2.96103 9.57467 3.54992 10.458C4.13881 11.3413 4.92214 11.9941 5.89992 12.4163L5.23325 13.583ZM10.3333 5.49967V4.16634H12.1499C11.6388 3.53301 11.0221 3.04134 10.2999 2.69134C9.5777 2.34134 8.81103 2.16634 7.99992 2.16634C7.38881 2.16634 6.81103 2.26079 6.26658 2.44967C5.72214 2.63856 5.22214 2.90523 4.76658 3.24967L4.09992 2.08301C4.65547 1.69412 5.26103 1.38856 5.91658 1.16634C6.57214 0.944119 7.26658 0.833008 7.99992 0.833008C8.8777 0.833008 9.71659 0.996897 10.5166 1.32467C11.3166 1.65245 12.0333 2.12745 12.6666 2.74967V1.83301H13.9999V5.49967H10.3333ZM9.89992 15.4997L6.71658 13.6663L8.54992 10.4997L9.69992 11.1663L8.74992 12.7997C10.061 12.6108 11.1527 12.0163 12.0249 11.0163C12.8971 10.0163 13.3333 8.84412 13.3333 7.49967C13.3333 7.37745 13.3305 7.26356 13.3249 7.15801C13.3194 7.05245 13.3055 6.94412 13.2833 6.83301H14.6333C14.6444 6.94412 14.6527 7.05245 14.6583 7.15801C14.6638 7.26356 14.6666 7.37745 14.6666 7.49967C14.6666 8.99967 14.2194 10.3413 13.3249 11.5247C12.4305 12.708 11.2666 13.5052 9.83325 13.9163L10.5666 14.3497L9.89992 15.4997Z" />
                      </svg>
                    </span>

                    <span>SQL Response</span>
                  </button>
                </div>
              </div>

              <div className="sm:hidden">
                <SelectOption options={options} onSelect={handleSelect} />
              </div>
            </div>

            {currentTab === "dataframe" && (
              <div className="flex flex-col w-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span
                      className={`text-sm font-medium ${
                        currentDataframe === "table"
                          ? "text-white"
                          : "text-white/50"
                      }`}
                    >
                      Table
                    </span>

                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={toggleDataframe}
                        value={toggleDataframe}
                        className="sr-only peer"
                        onChange={(e) => handleDataframeChange(e)}
                      />
                      <div className="relative w-11 h-6 bg-[#212327] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#295EF4] after:border-[#295EF4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#212327]"></div>
                    </label>

                    <span
                      className={`text-sm font-medium ${
                        currentDataframe === "chart"
                          ? "text-white"
                          : "text-white/50"
                      }`}
                    >
                      Chart
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    {currentDataframe === "chart" && (
                      <div
                        className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-white/50 hover:text-white group"
                        onClick={() => setShowGraphChange(true)}
                      >
                        <span className="flex items-center justify-center">
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 fill-white/50 group-hover:fill-white"
                          >
                            <path d="M8 14.6641C7.16667 14.6641 6.38611 14.5057 5.65833 14.1891C4.93056 13.8724 4.29722 13.4446 3.75833 12.9057C3.21944 12.3668 2.79167 11.7335 2.475 11.0057C2.15833 10.278 2 9.4974 2 8.66406H3.33333C3.33333 9.96406 3.78611 11.0668 4.69167 11.9724C5.59722 12.878 6.7 13.3307 8 13.3307C9.3 13.3307 10.4028 12.878 11.3083 11.9724C12.2139 11.0668 12.6667 9.96406 12.6667 8.66406C12.6667 7.36406 12.2139 6.26128 11.3083 5.35573C10.4028 4.45017 9.3 3.9974 8 3.9974H7.9L8.93333 5.03073L8 5.9974L5.33333 3.33073L8 0.664062L8.93333 1.63073L7.9 2.66406H8C8.83333 2.66406 9.61389 2.8224 10.3417 3.13906C11.0694 3.45573 11.7028 3.88351 12.2417 4.4224C12.7806 4.96129 13.2083 5.59462 13.525 6.3224C13.8417 7.05017 14 7.83073 14 8.66406C14 9.4974 13.8417 10.278 13.525 11.0057C13.2083 11.7335 12.7806 12.3668 12.2417 12.9057C11.7028 13.4446 11.0694 13.8724 10.3417 14.1891C9.61389 14.5057 8.83333 14.6641 8 14.6641Z" />
                          </svg>
                        </span>

                        <span>Change graph type</span>
                      </div>
                    )}

                    <FinetuningWidget
                      runid={eventStats.run_id}
                      eventId={eventId}
                    />
                  </div>
                </div>

                {currentDataframe === "table" && (
                  <div className="relative w-full h-full group">
                    <PivotGraphTable
                      name="datasource"
                      payload={{
                        datasource_id: slug,
                        run_id: eventStats.run_id,
                        event_id: eventId,
                      }}
                    />
                  </div>
                )}

                {currentDataframe === "chart" && (
                  <div className="w-full h-[400px] relative group">
                    <PivotGraph
                      name="datasource"
                      payload={{
                        datasource_id: slug,
                        run_id: eventStats.run_id,
                        event_id: eventId,
                      }}
                      config={visualizationInfo}
                    />
                  </div>
                )}
              </div>
            )}

            {/* {currentTab === "dataframe" && Object.keys(data).length === 0 && (
              <div className="flex items-center justify-center w-full h-48 rounded-br-md rounded-bl-md bg-background">
                <div className="flex flex-col items-center justify-center w-full space-y-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bordeborder-border">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-[#E4C063]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <span className="text-sm font-normal tracking-wide text-white">
                    No data generated
                  </span>
                </div>
              </div>
            )} */}

            {currentTab === "sql-response" && (
              <div className="flex flex-col w-full space-y-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`relative flex w-44 ${
                      toggleResponse ? "shadow-lg" : ""
                    }`}
                  >
                    <div className="cursor-pointer w-full bg-[#26282D] rounded-md">
                      <div
                        className={`flex items-center justify-between w-full px-2 py-2 rounded-md`}
                        onClick={() => setToggleResponse(!toggleResponse)}
                      >
                        {toggleResponse ||
                          (currentResponse === "summary" && (
                            <div className="flex items-center justify-center space-x-2">
                              <span className="flex items-center justify-center">
                                <svg
                                  viewBox="0 0 12 13"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 fill-white"
                                >
                                  <path d="M1.33333 12.5C0.966667 12.5 0.652778 12.3694 0.391667 12.1083C0.130556 11.8472 0 11.5333 0 11.1667V1.83333C0 1.46667 0.130556 1.15278 0.391667 0.891667C0.652778 0.630556 0.966667 0.5 1.33333 0.5H8L12 4.5V11.1667C12 11.5333 11.8694 11.8472 11.6083 12.1083C11.3472 12.3694 11.0333 12.5 10.6667 12.5H1.33333ZM2.66667 9.83333H9.33333V8.5H2.66667V9.83333ZM2.66667 7.16667H9.33333V5.83333H2.66667V7.16667ZM2.66667 4.5H7.33333V3.16667H2.66667V4.5Z" />
                                </svg>
                              </span>

                              <span className="text-sm font-medium text-white line-clamp-1 whitespace-nowrap">
                                SQL Summary
                              </span>
                            </div>
                          ))}

                        {toggleResponse ||
                          (currentResponse === "generation" && (
                            <div className="flex items-center justify-center space-x-2">
                              <span className="flex items-center justify-center">
                                <svg
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 fill-white"
                                >
                                  <path d="M8.16667 11C8.3 11 8.41667 10.95 8.51667 10.85C8.61667 10.75 8.66667 10.6333 8.66667 10.5C8.66667 10.3667 8.61667 10.25 8.51667 10.15C8.41667 10.05 8.3 10 8.16667 10C8.03333 10 7.91667 10.05 7.81667 10.15C7.71667 10.25 7.66667 10.3667 7.66667 10.5C7.66667 10.6333 7.71667 10.75 7.81667 10.85C7.91667 10.95 8.03333 11 8.16667 11ZM10 11C10.1333 11 10.25 10.95 10.35 10.85C10.45 10.75 10.5 10.6333 10.5 10.5C10.5 10.3667 10.45 10.25 10.35 10.15C10.25 10.05 10.1333 10 10 10C9.86667 10 9.75 10.05 9.65 10.15C9.55 10.25 9.5 10.3667 9.5 10.5C9.5 10.6333 9.55 10.75 9.65 10.85C9.75 10.95 9.86667 11 10 11ZM11.8333 11C11.9667 11 12.0833 10.95 12.1833 10.85C12.2833 10.75 12.3333 10.6333 12.3333 10.5C12.3333 10.3667 12.2833 10.25 12.1833 10.15C12.0833 10.05 11.9667 10 11.8333 10C11.7 10 11.5833 10.05 11.4833 10.15C11.3833 10.25 11.3333 10.3667 11.3333 10.5C11.3333 10.6333 11.3833 10.75 11.4833 10.85C11.5833 10.95 11.7 11 11.8333 11ZM10 13.8333C9.07778 13.8333 8.29167 13.5083 7.64167 12.8583C6.99167 12.2083 6.66667 11.4222 6.66667 10.5C6.66667 9.57778 6.99167 8.79167 7.64167 8.14167C8.29167 7.49167 9.07778 7.16667 10 7.16667C10.9222 7.16667 11.7083 7.49167 12.3583 8.14167C13.0083 8.79167 13.3333 9.57778 13.3333 10.5C13.3333 11.4222 13.0083 12.2083 12.3583 12.8583C11.7083 13.5083 10.9222 13.8333 10 13.8333ZM2.66667 4.5H9.33333V3.16667H2.66667V4.5ZM5.78333 12.5H1.33333C0.966667 12.5 0.652778 12.3694 0.391667 12.1083C0.130556 11.8472 0 11.5333 0 11.1667V1.83333C0 1.46667 0.130556 1.15278 0.391667 0.891667C0.652778 0.630556 0.966667 0.5 1.33333 0.5H10.6667C11.0333 0.5 11.3472 0.630556 11.6083 0.891667C11.8694 1.15278 12 1.46667 12 1.83333V6.3C11.6778 6.14444 11.3528 6.02778 11.025 5.95C10.6972 5.87222 10.3556 5.83333 10 5.83333C9.87778 5.83333 9.76389 5.83611 9.65833 5.84167C9.55278 5.84722 9.44444 5.86111 9.33333 5.88333V5.83333H2.66667V7.16667H6.75C6.55 7.35556 6.36944 7.56111 6.20833 7.78333C6.04722 8.00556 5.90556 8.24444 5.78333 8.5H2.66667V9.83333H5.38333C5.36111 9.94444 5.34722 10.0528 5.34167 10.1583C5.33611 10.2639 5.33333 10.3778 5.33333 10.5C5.33333 10.8667 5.36667 11.2083 5.43333 11.525C5.5 11.8417 5.61667 12.1667 5.78333 12.5Z" />
                                </svg>
                              </span>

                              <span className="text-sm font-medium text-white line-clamp-1 whitespace-nowrap">
                                SQL Generation
                              </span>
                            </div>
                          ))}

                        {toggleResponse ||
                          (eventStats.regenerate !== null &&
                            currentResponse === "resolution" && (
                              <div className="flex items-center justify-center space-x-2">
                                <span className="flex items-center justify-center">
                                  <svg
                                    viewBox="0 0 14 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 fill-white"
                                  >
                                    <path d="M7.00016 10.833C7.18905 10.833 7.34738 10.7691 7.47516 10.6413C7.60294 10.5136 7.66683 10.3552 7.66683 10.1663C7.66683 9.97745 7.60294 9.81912 7.47516 9.69134C7.34738 9.56356 7.18905 9.49967 7.00016 9.49967C6.81127 9.49967 6.65294 9.56356 6.52516 9.69134C6.39738 9.81912 6.3335 9.97745 6.3335 10.1663C6.3335 10.3552 6.39738 10.5136 6.52516 10.6413C6.65294 10.7691 6.81127 10.833 7.00016 10.833ZM6.3335 8.16634H7.66683V4.16634H6.3335V8.16634ZM7.00016 14.1663C6.07794 14.1663 5.21127 13.9913 4.40016 13.6413C3.58905 13.2913 2.8835 12.8163 2.2835 12.2163C1.6835 11.6163 1.2085 10.9108 0.858496 10.0997C0.508496 9.28856 0.333496 8.4219 0.333496 7.49967C0.333496 6.57745 0.508496 5.71079 0.858496 4.89967C1.2085 4.08856 1.6835 3.38301 2.2835 2.78301C2.8835 2.18301 3.58905 1.70801 4.40016 1.35801C5.21127 1.00801 6.07794 0.833008 7.00016 0.833008C7.92238 0.833008 8.78905 1.00801 9.60016 1.35801C10.4113 1.70801 11.1168 2.18301 11.7168 2.78301C12.3168 3.38301 12.7918 4.08856 13.1418 4.89967C13.4918 5.71079 13.6668 6.57745 13.6668 7.49967C13.6668 8.4219 13.4918 9.28856 13.1418 10.0997C12.7918 10.9108 12.3168 11.6163 11.7168 12.2163C11.1168 12.8163 10.4113 13.2913 9.60016 13.6413C8.78905 13.9913 7.92238 14.1663 7.00016 14.1663Z" />
                                  </svg>
                                </span>

                                <span className="text-sm font-medium text-white line-clamp-1 whitespace-nowrap">
                                  Error Resolution
                                </span>
                              </div>
                            ))}

                        {toggleResponse && (
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-sm font-medium text-white/25 line-clamp-1 whitespace-nowrap">
                              Select
                            </span>
                          </div>
                        )}

                        {toggleResponse || (
                          <span className="flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="w-4 h-4 fill-white/50"
                            >
                              <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                            </svg>
                          </span>
                        )}

                        {toggleResponse && (
                          <span className="flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="w-4 h-4 fill-white"
                            >
                              <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>

                    {toggleResponse && (
                      <ul
                        className="flex flex-col w-full bg-[#26282D] rounded-md z-10 divide-y-2 divide-[#2D3035] absolute top-[110%] left-0"
                        ref={modalRef}
                      >
                        {eventStats.validation?.steps_followed.length > 0 && (
                          <li
                            className="py-2.5 px-2 flex items-center justify-between hover:bg-[#3c3e42] text-sm font-medium cursor-pointer text-white bg-[#26282D]"
                            onClick={() => {
                              setCurrentResponse("summary");
                              setToggleResponse(false);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center justify-center">
                                <svg
                                  viewBox="0 0 12 13"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 fill-white"
                                >
                                  <path d="M1.33333 12.5C0.966667 12.5 0.652778 12.3694 0.391667 12.1083C0.130556 11.8472 0 11.5333 0 11.1667V1.83333C0 1.46667 0.130556 1.15278 0.391667 0.891667C0.652778 0.630556 0.966667 0.5 1.33333 0.5H8L12 4.5V11.1667C12 11.5333 11.8694 11.8472 11.6083 12.1083C11.3472 12.3694 11.0333 12.5 10.6667 12.5H1.33333ZM2.66667 9.83333H9.33333V8.5H2.66667V9.83333ZM2.66667 7.16667H9.33333V5.83333H2.66667V7.16667ZM2.66667 4.5H7.33333V3.16667H2.66667V4.5Z" />
                                </svg>
                              </span>
                              <div className="line-clamp-1">SQL Summary</div>
                            </div>

                            <div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={currentResponse === "summary"}
                                  className={`w-4 h-4 text-blue-600 cursor-pointer rounded accent-[#295EF4] ${
                                    currentResponse === "summary"
                                      ? ""
                                      : "custom-checkbox"
                                  }`}
                                />
                              </div>
                            </div>
                          </li>
                        )}

                        <li
                          className="py-2.5 px-2 flex items-center justify-between hover:bg-[#3c3e42] text-sm font-medium cursor-pointer text-white bg-[#26282D]"
                          onClick={() => {
                            setCurrentResponse("generation");
                            setToggleResponse(false);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center justify-center">
                              <svg
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 fill-white"
                              >
                                <path d="M8.16667 11C8.3 11 8.41667 10.95 8.51667 10.85C8.61667 10.75 8.66667 10.6333 8.66667 10.5C8.66667 10.3667 8.61667 10.25 8.51667 10.15C8.41667 10.05 8.3 10 8.16667 10C8.03333 10 7.91667 10.05 7.81667 10.15C7.71667 10.25 7.66667 10.3667 7.66667 10.5C7.66667 10.6333 7.71667 10.75 7.81667 10.85C7.91667 10.95 8.03333 11 8.16667 11ZM10 11C10.1333 11 10.25 10.95 10.35 10.85C10.45 10.75 10.5 10.6333 10.5 10.5C10.5 10.3667 10.45 10.25 10.35 10.15C10.25 10.05 10.1333 10 10 10C9.86667 10 9.75 10.05 9.65 10.15C9.55 10.25 9.5 10.3667 9.5 10.5C9.5 10.6333 9.55 10.75 9.65 10.85C9.75 10.95 9.86667 11 10 11ZM11.8333 11C11.9667 11 12.0833 10.95 12.1833 10.85C12.2833 10.75 12.3333 10.6333 12.3333 10.5C12.3333 10.3667 12.2833 10.25 12.1833 10.15C12.0833 10.05 11.9667 10 11.8333 10C11.7 10 11.5833 10.05 11.4833 10.15C11.3833 10.25 11.3333 10.3667 11.3333 10.5C11.3333 10.6333 11.3833 10.75 11.4833 10.85C11.5833 10.95 11.7 11 11.8333 11ZM10 13.8333C9.07778 13.8333 8.29167 13.5083 7.64167 12.8583C6.99167 12.2083 6.66667 11.4222 6.66667 10.5C6.66667 9.57778 6.99167 8.79167 7.64167 8.14167C8.29167 7.49167 9.07778 7.16667 10 7.16667C10.9222 7.16667 11.7083 7.49167 12.3583 8.14167C13.0083 8.79167 13.3333 9.57778 13.3333 10.5C13.3333 11.4222 13.0083 12.2083 12.3583 12.8583C11.7083 13.5083 10.9222 13.8333 10 13.8333ZM2.66667 4.5H9.33333V3.16667H2.66667V4.5ZM5.78333 12.5H1.33333C0.966667 12.5 0.652778 12.3694 0.391667 12.1083C0.130556 11.8472 0 11.5333 0 11.1667V1.83333C0 1.46667 0.130556 1.15278 0.391667 0.891667C0.652778 0.630556 0.966667 0.5 1.33333 0.5H10.6667C11.0333 0.5 11.3472 0.630556 11.6083 0.891667C11.8694 1.15278 12 1.46667 12 1.83333V6.3C11.6778 6.14444 11.3528 6.02778 11.025 5.95C10.6972 5.87222 10.3556 5.83333 10 5.83333C9.87778 5.83333 9.76389 5.83611 9.65833 5.84167C9.55278 5.84722 9.44444 5.86111 9.33333 5.88333V5.83333H2.66667V7.16667H6.75C6.55 7.35556 6.36944 7.56111 6.20833 7.78333C6.04722 8.00556 5.90556 8.24444 5.78333 8.5H2.66667V9.83333H5.38333C5.36111 9.94444 5.34722 10.0528 5.34167 10.1583C5.33611 10.2639 5.33333 10.3778 5.33333 10.5C5.33333 10.8667 5.36667 11.2083 5.43333 11.525C5.5 11.8417 5.61667 12.1667 5.78333 12.5Z" />
                              </svg>
                            </span>
                            <div className="line-clamp-1">SQL Generation</div>
                          </div>

                          <div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={currentResponse === "generation"}
                                className={`w-4 h-4 text-blue-600 cursor-pointer rounded accent-[#295EF4] ${
                                  currentResponse === "generation"
                                    ? ""
                                    : "custom-checkbox"
                                }`}
                              />
                            </div>
                          </div>
                        </li>

                        {eventStats.regenerate !== null && (
                          <li
                            className="py-2.5 px-2 flex items-center justify-between hover:bg-[#3c3e42] text-sm font-medium cursor-pointer text-white bg-[#26282D]"
                            onClick={() => {
                              setCurrentResponse("resolution");
                              setToggleResponse(false);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center justify-center">
                                <svg
                                  viewBox="0 0 14 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 fill-white"
                                >
                                  <path d="M7.00016 10.833C7.18905 10.833 7.34738 10.7691 7.47516 10.6413C7.60294 10.5136 7.66683 10.3552 7.66683 10.1663C7.66683 9.97745 7.60294 9.81912 7.47516 9.69134C7.34738 9.56356 7.18905 9.49967 7.00016 9.49967C6.81127 9.49967 6.65294 9.56356 6.52516 9.69134C6.39738 9.81912 6.3335 9.97745 6.3335 10.1663C6.3335 10.3552 6.39738 10.5136 6.52516 10.6413C6.65294 10.7691 6.81127 10.833 7.00016 10.833ZM6.3335 8.16634H7.66683V4.16634H6.3335V8.16634ZM7.00016 14.1663C6.07794 14.1663 5.21127 13.9913 4.40016 13.6413C3.58905 13.2913 2.8835 12.8163 2.2835 12.2163C1.6835 11.6163 1.2085 10.9108 0.858496 10.0997C0.508496 9.28856 0.333496 8.4219 0.333496 7.49967C0.333496 6.57745 0.508496 5.71079 0.858496 4.89967C1.2085 4.08856 1.6835 3.38301 2.2835 2.78301C2.8835 2.18301 3.58905 1.70801 4.40016 1.35801C5.21127 1.00801 6.07794 0.833008 7.00016 0.833008C7.92238 0.833008 8.78905 1.00801 9.60016 1.35801C10.4113 1.70801 11.1168 2.18301 11.7168 2.78301C12.3168 3.38301 12.7918 4.08856 13.1418 4.89967C13.4918 5.71079 13.6668 6.57745 13.6668 7.49967C13.6668 8.4219 13.4918 9.28856 13.1418 10.0997C12.7918 10.9108 12.3168 11.6163 11.7168 12.2163C11.1168 12.8163 10.4113 13.2913 9.60016 13.6413C8.78905 13.9913 7.92238 14.1663 7.00016 14.1663Z" />
                                </svg>
                              </span>
                              <div className="line-clamp-1">
                                Error Resolution
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={currentResponse === "resolution"}
                                  className={`w-4 h-4 text-blue-600 rounded cursor-pointer accent-[#295EF4] ${
                                    currentResponse === "resolution"
                                      ? ""
                                      : "custom-checkbox"
                                  }`}
                                />
                              </div>
                            </div>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {currentResponse === "generation" && (
                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-sm font-medium ${
                          generationView === "input"
                            ? "text-white"
                            : "text-white/50"
                        }`}
                      >
                        Input
                      </span>

                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={toggleGeneration}
                          value={toggleGeneration}
                          className="sr-only peer"
                          onChange={(e) => handleGenerationChange(e)}
                        />
                        <div className="relative w-11 h-6 bg-[#212327] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#295EF4] after:border-[#295EF4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#212327]"></div>
                      </label>

                      <span
                        className={`text-sm font-medium ${
                          generationView === "output"
                            ? "text-white"
                            : "text-white/50"
                        }`}
                      >
                        Output
                      </span>
                    </div>
                  )}

                  {currentResponse === "resolution" && (
                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-sm font-medium ${
                          resolutionView === "input"
                            ? "text-white"
                            : "text-white/50"
                        }`}
                      >
                        Input
                      </span>

                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={toggleResolution}
                          value={toggleResolution}
                          className="sr-only peer"
                          onChange={(e) => handleResolutionChange(e)}
                        />
                        <div className="relative w-11 h-6 bg-[#212327] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[#295EF4] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#295EF4] after:border-[#295EF4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#212327]"></div>
                      </label>

                      <span
                        className={`text-sm font-medium ${
                          resolutionView === "output"
                            ? "text-white"
                            : "text-white/50"
                        }`}
                      >
                        Output
                      </span>
                    </div>
                  )}
                </div>

                {currentResponse === "summary" && (
                  <div className="flex flex-col space-y-4">
                    {eventStats.validation?.steps_followed.length > 0 && (
                      <div className="flex flex-col space-y-4">
                        <p className="text-sm font-normal text-white">
                          Steps followed
                        </p>

                        <ul className="flex flex-col p-4 space-y-2 border rounded-md border-[#212227] bg-[#1B1D1F] max-h-[400px] h-full recent__bar overflow-y-auto">
                          {eventStats.validation?.steps_followed?.map(
                            (follow, index) => {
                              return (
                                <li
                                  className="flex items-center space-x-2 text-xs tracking-wide text-white"
                                  key={index}
                                >
                                  <span>{index + 1}.</span>
                                  <span className="w-full font-medium leading-6 text-white">
                                    {follow}
                                  </span>
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                    )}

                    {eventStats.validation?.errors_in_sql.length > 0 && (
                      <div className="flex flex-col space-y-4">
                        <p className="text-sm font-normal text-white">
                          Errors in SQL
                        </p>

                        <ul className="flex flex-col p-4 space-y-4 border rounded-md border-[#212227] bg-[#1B1D1F] max-h-[400px] h-full recent__bar overflow-y-auto">
                          {eventStats.validation?.errors_in_sql?.map(
                            (error, index) => {
                              return (
                                <li
                                  className="flex pb-4 space-x-4 text-xs tracking-wide text-white horizontal"
                                  key={index}
                                >
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#323232]">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4 text-[#8D8E8F]"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </span>

                                  <span className="w-full font-medium leading-6 text-white">
                                    {error}
                                  </span>
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {currentResponse === "generation" && (
                  <div>
                    {generationView === "input" && (
                      <GenerationInput eventStats={eventStats} />
                    )}

                    {generationView === "output" && (
                      <GenerationOutput eventStats={eventStats} />
                    )}
                  </div>
                )}

                {currentResponse === "resolution" && (
                  <div>
                    {resolutionView === "input" && (
                      <ResolutionInput eventStats={eventStats} />
                    )}

                    {resolutionView === "output" && (
                      <ResolutionOutput eventStats={eventStats} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TableModal show={showTable} setShow={setShowTable} data={seeMoreTable} />

      {showGraphChange && (
        <DatasourceGraphMenu
          show={showGraphChange}
          setShow={setShowGraphChange}
          dataField={dataframe}
          datasourceId={slug}
          eventId={eventId}
          runId={eventStats.run_id}
          setChartType={setChartType}
          visualizationInfo={visualizationInfo}
          setVisualizationInfo={setVisualizationInfo}
        />
      )}
    </>
  );
};

export default OverallResponse;
