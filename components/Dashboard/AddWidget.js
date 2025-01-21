import React, { useEffect, useRef, useState } from "react";
import {
  useExecuteSqlQueryMutation,
  useGetDatasourcesListQuery,
  useStopDatasourceRunMutation,
} from "@/store/datasource";
import { useStreamRunDatasourceMutation } from "@/store/stream";
import { useGetDatasourceMutation } from "@/store/datasource";
import SuccessModal from "@/components/Modal/SuccessModal";
import useDebounce from "@/hooks/useDebounce";
import {
  useAddWidgetFromDatasourceRunMutation,
  useAddWidgetFromSqlMutation,
} from "@/store/dashboard";
import CreateWidget from "../Modal/CreateWidget";
import Split from "react-split";
import DatasourceResizableTable from "../Datasource/DatasourceResizableTable";
import DatasourcePivotGraph from "../Datasource/DatasourcePivotGraph";
import { Editor } from "@monaco-editor/react";
import { useSelector } from "react-redux";
import DatasourceGraphMenu from "./DatasourceGraphMenu";
import { useTheme } from "@/hooks/useTheme";
import { useGetAssistantsQuery } from "@/store/assistant";
import AssistantAnalyzer from "./AssistantAnalyzer";
import { AssistantIcon } from "../Icons/icon";

const darkTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "FFFFFF", background: "2A2D34" },
    { token: "invalid", foreground: "f44747" },
    { token: "emphasis", fontStyle: "italic" },
    { token: "strong", fontStyle: "bold" },
  ],
  colors: {
    "editor.foreground": "#F8F8F8",
    "editor.background": "#09090b",
    "editor.selectionBackground": "#264f78",
    "editor.lineHighlightBackground": "#09090b",
    "editorCursor.foreground": "#A7A7A7",
    "editorWhitespace.foreground": "#CAE2FB3D",
    "minimap.background": "#202020",
  },
};

const lightTheme = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "", foreground: "000000", background: "FFFFFF" }, // Black text on white background
    { token: "invalid", foreground: "D32F2F" }, // Bright red for invalid tokens
    { token: "emphasis", fontStyle: "italic" }, // Italic for emphasis
    { token: "strong", fontStyle: "bold" }, // Bold for strong text
  ],
  colors: {
    "editor.foreground": "#1E1E1E", // Dark text for better readability
    "editor.background": "#FFFFFF", // White background
    "editor.selectionBackground": "#B4D7FF", // Light blue for selection
    "editor.lineHighlightBackground": "#F0F0F0", // Light gray for line highlight
    "editorCursor.foreground": "#000000", // Black cursor
    "editorWhitespace.foreground": "#D3D3D3", // Light gray for whitespace
    "minimap.background": "#F5F5F5", // Very light gray for minimap background
  },
};

const Options = {
  showFoldingControls: "mouseover",
  smoothScrolling: true,
  suggestOnTriggerCharacters: true,
  wordBasedSuggestions: true,
  wordSeparators: "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
  wordWrap: true,
  wordWrapBreakAfterCharacters: "\t})]?|&,;",
  wordWrapBreakBeforeCharacters: "{([+",
  wordWrapBreakObtrusiveCharacters: ".",
  wordWrapColumn: 80,
  wordWrapMinified: true,
  wrappingIndent: "none",
  minimap: {
    enabled: false,
  },
  showUnused: false,
  fontSize: 14,
  lineHeight: 20,
  mouseWheelZoom: true,
  readOnly: false,
  selectOnLineNumbers: true,
  selectionClipboard: true,
  selectionHighlight: true,
};

const AddWidget = ({
  show,
  setShow,
  currentSection,
  refetchDashboard,
  refetchSectionList,
  dashboardId,
  setShowAddWidgetSuccess = () => {},
}) => {
  const [slug, setSlug] = useState(null);
  const [currentDatasource, setCurrentDatasource] = useState({});
  const [currentAssistant, setCurrentAssistant] = useState({});
  const [toggleDatasource, setToggleDatasource] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAssistantQuery, setSearchAssistantQuery] = useState("");
  const [createWidget, setCreateWidget] = useState(false);
  const [showSuccessWidget, setShowSuccessWidget] = useState(false);

  const [query, setQuery] = useState("");
  const [sqlRunQuery, setSqlRunQuery] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [currentNextEvent, setCurrentNextEvent] = useState("");
  const [visualizationInfo, setVisualizationInfo] = useState({});
  const [currentOutput, setCurrentOutput] = useState("table");
  const [eventId, setEventId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showGraphChange, setShowGraphChange] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);
  const [dataframe, setDataframe] = useState({});
  const [activeRun, setActiveRun] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [usedExamples, setUsedExamples] = useState([]);
  const [generationError, setGenerationError] = useState("");
  const [currentAnalyzer, setCurrentAnalyzer] = useState("datasource");

  const [eventStats, setEventStats] = useState({
    run_id: null,
    generation: null,
    generation_execution: null,
    regenerate: null,
    regenerate_execution: null,
    validation: null,
  });
  const { theme: customTheme } = useTheme();
  const modalRef = useRef(null);
  const datasourceRef = useRef(null);

  const events = useSelector((state) => state.sse.events);
  const isEventsConnectionOpen = useSelector(
    (state) => state.sse.isConnectionOpen
  );

  const [getDatasource, { data: getSqlRes, isLoading: getDatasourceLoading }] =
    useGetDatasourceMutation();

  const [stopDatasourceRun, { isLoading: stopDatasourceLoading }] =
    useStopDatasourceRunMutation();

  const [isStopping, setIsStopping] = useState(false);
  useEffect(() => {
    if (stopDatasourceLoading) {
      setIsStopping(true);
    }
  }, [stopDatasourceLoading]);
  const [executeSqlQuery, { isLoading: executeSqlLoading }] =
    useExecuteSqlQueryMutation();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedAssistantSearchQuery = useDebounce(searchAssistantQuery, 500);

  const { data: getRes, isLoading: datasourceLoading } =
    useGetDatasourcesListQuery({
      skip: 0,
      limit: 100,
      sort_by: "A-Z",
      ds_type: "sql_generator",
      query: debouncedSearchQuery,
    });

  const { data: getAssistantsRes, isLoading: isAssistantsLoading } =
    useGetAssistantsQuery(
      {
        skip: 0,
        limit: 100,
        sort_by: "A-Z",
        query: debouncedAssistantSearchQuery,
      },
      {
        refetchOnMountOrArgChange: true,
      }
    );

  const [streamRunDatasource, {}] = useStreamRunDatasourceMutation();

  // const [addWidgetFromDatasourceRun, { isLoading: addWidgetLoading }] =
  //   useAddWidgetFromDatasourceRunMutation();

  const [addWidgetFromSql, { isLoading: addWidgetLoading }] =
    useAddWidgetFromSqlMutation();

  const resetSidebar = () => {
    setShow(false);
  };

  useEffect(() => {
    if (!isEventsConnectionOpen && queryLoading) {
      if (eventStats.run_id) {
        setQueryLoading(false);
        setShowResult(true);
      }

      if (
        !eventStats.generation_execution &&
        !eventStats.regenerate_execution
      ) {
        let errorMessage;

        if (eventStats.generation.steps_to_follow) {
          errorMessage = eventStats?.generation?.steps_to_follow;
        }

        if (eventStats.generation.error_message) {
          setGenerationError(eventStats.generation.error_message);
        }

        setSqlRunQuery(`/* 
         ${errorMessage || ""} 
         */`);
      }
    }
  }, [isEventsConnectionOpen]);

  useEffect(() => {
    if (events && events.length > 0) {
      let shouldDisplayNextEvent = true;

      for (let i = 0; i < events.length; i++) {
        const event = events[i];

        if (event.event_type === "datasource_run") {
          setEventStats((prev) => ({
            ...prev,
            run_id: event.run_id,
          }));
        }

        if (event.event_type === "sql_datasource_sql_generate") {
          setEventStats((prev) => ({
            ...prev,
            generation: event,
          }));
        }

        if (
          event.event_type === "sql_datasource_sql_execution" &&
          event.sql_source === "SQLDatasourceSQLGeneration"
        ) {
          setEventStats((prev) => ({
            ...prev,
            generation_execution: event,
          }));

          if (event?.sql) {
            setSqlRunQuery(event.sql);
            setInitialQuery(event.sql);
          }

          if (event?.data_visualization_config) {
            setVisualizationInfo(event.data_visualization_config);
          }

          if (event?.id) {
            setEventId(event.id);
          }
        }

        if (event.event_type === "sql_datasource_sql_regenerate") {
          setEventStats((prev) => ({
            ...prev,
            regenerate: event,
          }));
        }

        if (
          event.event_type === "sql_datasource_sql_execution" &&
          event.sql_source === "SQLDatasourceSQLRegenerate"
        ) {
          setEventStats((prev) => ({
            ...prev,
            regenerate_execution: event,
          }));

          if (event?.sql) {
            setSqlRunQuery(event.sql);
            setInitialQuery(event.sql);
          }

          if (event?.data_visualization_config) {
            setVisualizationInfo(event.data_visualization_config);
          }

          if (event?.id) {
            setEventId(event.id);
          }
        }

        if (event.event_type === "sql_datasource_validation") {
          setEventStats((prev) => ({
            ...prev,
            validation: event,
          }));
        }

        if (shouldDisplayNextEvent && event.next_event) {
          setCurrentNextEvent(event.next_event);

          if (event.event_type === "sql_datasource_validation") {
            shouldDisplayNextEvent = false;
            setCurrentNextEvent("");
          }
        }
      }
    }
  }, [events]);

  const handleResetEvents = () => {
    setSqlRunQuery("");
    setCurrentNextEvent("");
    setQueryLoading(false);
    setEventStats({
      run_id: null,
      generation: null,
      generation_execution: null,
      regenerate: null,
      regenerate_execution: null,
      validation: null,
    });
    setVisualizationInfo({});
    setCurrentOutput("table");
    setEventId(null);
    setShowResult(false);
    setShowGraphChange(false);
    setShowThoughts(false);
    setDataframe({});
    setActiveRun(false);
    setInitialQuery("");
    setResetKey((prev) => prev + 1);
  };

  const handleOutsideClick = (e) => {
    if (datasourceRef.current && !datasourceRef.current.contains(e.target)) {
      setToggleDatasource(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleDatasourceChange = (datasource) => {
    setQuery("");
    setCurrentAssistant({});
    handleResetEvents();
    getDatasource({ datasource_id: datasource.id });
    setSlug(datasource.id);
    setCurrentDatasource(datasource);
    setToggleDatasource(false);
  };

  const handleQuery = () => {
    if (!query.trim()) return;
    handleResetEvents();
    setGenerationError("");
    setQueryLoading(true);
    setDataframe({});

    if (query !== "") {
      try {
        streamRunDatasource({
          datasource_id: slug,
          payload: {
            user_query: query,
          },
        });
        setIsStopping(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        const cursorPosition = e.target.selectionStart;
        setQuery(
          query.slice(0, cursorPosition) + "\n" + query.slice(cursorPosition)
        );
        e.preventDefault();
      } else {
        handleQuery();
        e.preventDefault();
      }
    }
  };

  const handleRunExecutionInsights = () => {
    setGenerationError("");
    setDataframe({});

    executeSqlQuery({
      datasource_id: slug,
      payload: {
        query: sqlRunQuery,
      },
    }).then((response) => {
      if (response.data) {
        setDataframe(response.data.dataframe);
        setVisualizationInfo(response.data.visualization_config);
        setInitialQuery(sqlRunQuery);
        setActiveRun(false);
        setShowResult(true);
      }

      if (response.error) {
        console.log("response", response.error);
        setDataframe({});
      }
    });
  };

  const handleStopChat = () => {
    // Stop the current data source run
    if (eventStats.run_id && slug) {
      stopDatasourceRun({ datasource_id: slug, run_id: eventStats.run_id });
    }
  };

  const handleEditorChange = (newQuery) => {
    setSqlRunQuery(newQuery);

    if (newQuery !== initialQuery) {
      setActiveRun(true);
    } else {
      setActiveRun(false);
    }
  };

  const handleAddWidget = () => {
    let eventId;

    if (eventStats.generation_execution) {
      eventId = eventStats.generation_execution.id;
    }

    if (eventStats.regenerate_execution) {
      eventId = eventStats.regenerate_execution.id;
    }

    const payload = {
      // datasource_run_id: eventStats.run_id,
      // event_id: eventId,
      label: query,
      sql_cmd: sqlRunQuery,
      datasource_id: slug,
      data_visualization_config: visualizationInfo,
    };

    addWidgetFromSql({
      dashboard_id: dashboardId,
      section_id: currentSection,
      payload: payload,
    }).then((response) => {
      if (response) {
        refetchDashboard();
        setCreateWidget(false);
        setShowSuccessWidget(true);
        handleResetEvents();
        setQuery("");
        setShow(false);
        setShowAddWidgetSuccess(true);
      } else {
        setCreateWidget(false);
      }
    });
  };

  useEffect(() => {
    let generationExamplesUsed = [];
    let regenerateExamplesUsed = [];

    if (eventStats?.generation?.examples_used) {
      generationExamplesUsed = [...eventStats?.generation?.examples_used];
    }

    if (eventStats?.regenerate?.examples_used) {
      regenerateExamplesUsed = [...eventStats?.regenerate?.examples_used];
    }

    const mergeExamples = [
      ...new Set([...generationExamplesUsed, ...regenerateExamplesUsed]),
    ];
    setUsedExamples(mergeExamples);
  }, [eventStats]);

  const generateKey = () => {
    return `assistant-${currentAssistant?.id}`;
  };

  return (
    <>
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
          show ? "" : "hidden"
        }`}
      >
        <div
          className="fixed top-0 bottom-0 right-0 w-full h-full max-w-[700px] overflow-hidden overflow-x-hidden border-l border-border-color bg-page"
          ref={modalRef}
        >
          <div className="relative flex flex-col flex-1 h-full">
            {!showThoughts && (
              <div className="flex sticky top-0 left-0 z-[100] h-12 bg-page w-full items-center py-3 px-4 justify-between border-b border-border-color">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-4 text-sm font-medium tracking-wide text-primary-text">
                    <span
                      className="flex items-center justify-center"
                      onClick={() => {
                        resetSidebar();
                      }}
                    >
                      <svg
                        viewBox="0 0 12 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 fill-[#878787] hover:fill-white cursor-pointer"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                        />
                      </svg>
                    </span>

                    <span className="text-nowrap">Add widget</span>
                  </div>

                  {Object.keys(currentAssistant).length === 0 &&
                    Object.keys(currentDatasource).length > 0 && (
                      <div className="relative flex w-full" ref={datasourceRef}>
                        <div
                          className={`w-full cursor-pointer border bg-dropdown-bg rounded-md ${
                            toggleDatasource
                              ? "border-[#242729]"
                              : "border-transparent"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between w-full h-8 px-4 py-2 space-x-2 border rounded-md min-w-80 border-dropdown-border"
                            onClick={() =>
                              setToggleDatasource(!toggleDatasource)
                            }
                          >
                            {currentDatasource?.name ? (
                              <span className="text-xs font-medium text-dropdown-text line-clamp-1 whitespace-nowrap">
                                {currentDatasource?.name}
                              </span>
                            ) : (
                              <span className="text-xs font-medium capitalize text-input-placeholder line-clamp-1 whitespace-nowrap">
                                Choose datasource or assistant
                              </span>
                            )}

                            {toggleDatasource || (
                              <span className="flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="w-5 h-5 fill-dropdown-icon"
                                >
                                  <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                                </svg>
                              </span>
                            )}

                            {toggleDatasource && (
                              <span className="flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="w-5 h-5 fill-dropdown-icon"
                                >
                                  <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>

                        {toggleDatasource && (
                          <ul className="flex flex-col w-full bg-dropdown-bg rounded-md max-h-52 overflow-y-auto recent__bar z-10 absolute top-[110%] left-0 shadow-md border-dropdown-border border">
                            <li className="sticky top-0 left-0 w-full bg-dropdown-bg">
                              <ul className="flex items-center">
                                <li
                                  className={`min-h-8 text-sm font-medium flex items-center space-x-2 justify-center px-2 border-b-2 cursor-pointer ${
                                    currentAnalyzer === "datasource"
                                      ? "border-tabs-active text-tabs-active"
                                      : "border-transparent text-tabs-text hover:text-tabs-hover"
                                  }`}
                                  onClick={() =>
                                    setCurrentAnalyzer("datasource")
                                  }
                                >
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className={`w-4 h-4 ${
                                        currentAnalyzer === "datasource"
                                          ? "fill-active-icon"
                                          : "fill-icon-color"
                                      }`}
                                    >
                                      <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                                    </svg>
                                  </span>
                                  <span>Datasources</span>
                                </li>

                                <li
                                  className={`min-h-8 text-sm font-medium flex items-center space-x-2 justify-center px-2 border-b-2 cursor-pointer ${
                                    currentAnalyzer === "assistant"
                                      ? "border-tabs-active text-tabs-active"
                                      : "border-transparent text-tabs-text hover:text-tabs-hover"
                                  }`}
                                  onClick={() =>
                                    setCurrentAnalyzer("assistant")
                                  }
                                >
                                  <span className="flex items-center justify-center">
                                    <AssistantIcon size={4} />
                                  </span>
                                  <span>Assistants</span>
                                </li>
                              </ul>
                            </li>

                            <li className="sticky top-0 left-0 w-full p-2 bg-dropdown-bg">
                              {currentAnalyzer === "datasource" && (
                                <input
                                  type="text"
                                  className="w-full h-8 px-2 text-xs border rounded-md outline-none bg-dropdown-bg text-primary-text border-dropdown-border placeholder:text-input-placeholder focus:border-active-border"
                                  placeholder="Search datasource"
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                />
                              )}

                              {currentAnalyzer === "assistant" && (
                                <input
                                  type="text"
                                  className="w-full h-8 px-2 text-xs border rounded-md outline-none bg-dropdown-bg text-primary-text border-dropdown-border placeholder:text-input-placeholder focus:border-active-border"
                                  placeholder="Search assistant"
                                  value={searchAssistantQuery}
                                  onChange={(e) =>
                                    setSearchAssistantQuery(e.target.value)
                                  }
                                />
                              )}
                            </li>

                            {currentAnalyzer === "datasource" &&
                              datasourceLoading && (
                                <li className="flex items-center justify-center h-40 px-4">
                                  <div role="status">
                                    <svg
                                      aria-hidden="true"
                                      className="w-4 h-4 animate-spin text-primary-text fill-btn-primary"
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
                                </li>
                              )}

                            {datasourceLoading || getRes?.length > 0 || (
                              <li className="flex items-center justify-center h-40 px-4 text-xs font-medium text-center capitalize text-dropdown-text">
                                Datasource not available
                              </li>
                            )}

                            {!datasourceLoading &&
                              currentAnalyzer === "datasource" &&
                              getRes?.length > 0 &&
                              getRes
                                ?.filter((item) => {
                                  return (
                                    item.ds_config.ds_type !== "semi_structured"
                                  );
                                })
                                ?.map((datasource) => {
                                  return (
                                    <li
                                      className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-active-bg-hover text-dropdown-text bg-dropdown-bg"
                                      onClick={() =>
                                        handleDatasourceChange(datasource)
                                      }
                                    >
                                      <div className="flex items-center space-x-2 line-clamp-1">
                                        <span className="flex items-center justify-center">
                                          <svg
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4 fill-icon-color"
                                          >
                                            <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                                          </svg>
                                        </span>

                                        <span>{datasource.name}</span>

                                        {currentDatasource.id ===
                                          datasource.id && (
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

                                      {datasource?.ds_config?.ds_type ===
                                        "sql_generator" && (
                                        <div className="text-xs flex font-medium items-center justify-center space-x-2 text-[#40AD7D] w-fit">
                                          <span>Structured</span>
                                        </div>
                                      )}

                                      {datasource?.ds_config?.ds_type ===
                                        "semi_structured" && (
                                        <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#A840AD] w-fit">
                                          <span>Semi-Structured</span>
                                        </div>
                                      )}

                                      {datasource?.ds_config?.ds_type ===
                                        "third_party" && (
                                        <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#AD7A40] w-fit">
                                          <span>Third Party</span>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}

                            {!isAssistantsLoading &&
                              currentAnalyzer === "assistant" &&
                              getAssistantsRes?.length > 0 &&
                              getAssistantsRes?.map((assistant) => {
                                return (
                                  <li
                                    className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-active-bg-hover text-dropdown-text bg-dropdown-bg"
                                    onClick={() => {
                                      setCurrentDatasource({});
                                      setCurrentAssistant(assistant);
                                      setToggleDatasource(false);
                                    }}
                                  >
                                    <div className="flex items-center space-x-2 line-clamp-1">
                                      <span className="flex items-center justify-center">
                                        <AssistantIcon size={4} />
                                      </span>

                                      <span>{assistant.name}</span>

                                      {currentAssistant.id === assistant.id && (
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
                                  </li>
                                );
                              })}
                          </ul>
                        )}
                      </div>
                    )}

                  {Object.keys(currentDatasource).length === 0 &&
                    Object.keys(currentAssistant).length > 0 && (
                      <div className="relative flex w-full" ref={datasourceRef}>
                        <div
                          className={`w-full cursor-pointer border bg-dropdown-bg rounded-md ${
                            toggleDatasource
                              ? "border-[#242729]"
                              : "border-transparent"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between w-full h-8 px-4 py-2 space-x-2 border rounded-md min-w-80 border-dropdown-border"
                            onClick={() =>
                              setToggleDatasource(!toggleDatasource)
                            }
                          >
                            {currentAssistant?.name ? (
                              <span className="text-xs font-medium text-dropdown-text line-clamp-1 whitespace-nowrap">
                                {currentAssistant?.name}
                              </span>
                            ) : (
                              <span className="text-xs font-medium capitalize text-input-placeholder line-clamp-1 whitespace-nowrap">
                                Choose datasource or assistant
                              </span>
                            )}

                            {toggleDatasource || (
                              <span className="flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="w-5 h-5 fill-dropdown-icon"
                                >
                                  <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                                </svg>
                              </span>
                            )}

                            {toggleDatasource && (
                              <span className="flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="w-5 h-5 fill-dropdown-icon"
                                >
                                  <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>

                        {toggleDatasource && (
                          <ul className="flex flex-col w-full bg-dropdown-bg rounded-md max-h-52 overflow-y-auto recent__bar z-10 absolute top-[110%] left-0 shadow-md border-dropdown-border border">
                            <li className="sticky top-0 left-0 w-full bg-dropdown-bg">
                              <ul className="flex items-center">
                                <li
                                  className={`min-h-8 text-sm font-medium flex items-center space-x-2 justify-center px-2 border-b-2 cursor-pointer ${
                                    currentAnalyzer === "datasource"
                                      ? "border-tabs-active text-tabs-active"
                                      : "border-transparent text-tabs-text hover:text-tabs-hover"
                                  }`}
                                  onClick={() =>
                                    setCurrentAnalyzer("datasource")
                                  }
                                >
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className={`w-4 h-4 ${
                                        currentAnalyzer === "datasource"
                                          ? "fill-active-icon"
                                          : "fill-icon-color"
                                      }`}
                                    >
                                      <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                                    </svg>
                                  </span>
                                  <span>Datasources</span>
                                </li>

                                <li
                                  className={`min-h-8 text-sm font-medium flex items-center space-x-2 justify-center px-2 border-b-2 cursor-pointer ${
                                    currentAnalyzer === "assistant"
                                      ? "border-tabs-active text-tabs-active"
                                      : "border-transparent text-tabs-text hover:text-tabs-hover"
                                  }`}
                                  onClick={() =>
                                    setCurrentAnalyzer("assistant")
                                  }
                                >
                                  <span className="flex items-center justify-center">
                                    <AssistantIcon size={4} />
                                  </span>
                                  <span>Assistants</span>
                                </li>
                              </ul>
                            </li>

                            <li className="sticky top-0 left-0 w-full p-2 bg-dropdown-bg">
                              {currentAnalyzer === "datasource" && (
                                <input
                                  type="text"
                                  className="w-full h-8 px-2 text-xs border rounded-md outline-none bg-dropdown-bg text-primary-text border-dropdown-border placeholder:text-input-placeholder focus:border-active-border"
                                  placeholder="Search datasource"
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                />
                              )}

                              {currentAnalyzer === "assistant" && (
                                <input
                                  type="text"
                                  className="w-full h-8 px-2 text-xs border rounded-md outline-none bg-dropdown-bg text-primary-text border-dropdown-border placeholder:text-input-placeholder focus:border-active-border"
                                  placeholder="Search assistant"
                                  value={searchAssistantQuery}
                                  onChange={(e) =>
                                    setSearchAssistantQuery(e.target.value)
                                  }
                                />
                              )}
                            </li>

                            {currentAnalyzer === "datasource" &&
                              datasourceLoading && (
                                <li className="flex items-center justify-center h-40 px-4">
                                  <div role="status">
                                    <svg
                                      aria-hidden="true"
                                      className="w-4 h-4 animate-spin text-primary-text fill-btn-primary"
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
                                </li>
                              )}

                            {isAssistantsLoading ||
                              getAssistantsRes?.length > 0 || (
                                <li className="flex items-center justify-center h-40 px-4 text-xs font-medium text-center capitalize text-dropdown-text">
                                  Assistant not available
                                </li>
                              )}

                            {!datasourceLoading &&
                              currentAnalyzer === "datasource" &&
                              getRes?.length > 0 &&
                              getRes
                                ?.filter((item) => {
                                  return (
                                    item.ds_config.ds_type !== "semi_structured"
                                  );
                                })
                                ?.map((datasource) => {
                                  return (
                                    <li
                                      className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-borderhover:bg-active-bg-hover text-dropdown-text bg-dropdown-bg"
                                      onClick={() =>
                                        handleDatasourceChange(datasource)
                                      }
                                    >
                                      <div className="flex items-center space-x-2 line-clamp-1">
                                        <span className="flex items-center justify-center">
                                          <svg
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4 fill-icon-color"
                                          >
                                            <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                                          </svg>
                                        </span>

                                        <span>{datasource.name}</span>

                                        {currentDatasource.id ===
                                          datasource.id && (
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

                                      {datasource?.ds_config?.ds_type ===
                                        "sql_generator" && (
                                        <div className="text-xs flex font-medium items-center justify-center space-x-2 text-[#40AD7D] w-fit">
                                          <span>Structured</span>
                                        </div>
                                      )}

                                      {datasource?.ds_config?.ds_type ===
                                        "semi_structured" && (
                                        <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#A840AD] w-fit">
                                          <span>Semi-Structured</span>
                                        </div>
                                      )}

                                      {datasource?.ds_config?.ds_type ===
                                        "third_party" && (
                                        <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#AD7A40] w-fit">
                                          <span>Third Party</span>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}

                            {!isAssistantsLoading &&
                              currentAnalyzer === "assistant" &&
                              getAssistantsRes?.length > 0 &&
                              getAssistantsRes?.map((assistant) => {
                                return (
                                  <li
                                    className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-active-bg-hover text-dropdown-text bg-dropdown-bg"
                                    onClick={() => {
                                      setCurrentDatasource({});
                                      setCurrentAssistant(assistant);
                                      setToggleDatasource(false);
                                    }}
                                  >
                                    <div className="flex items-center space-x-2 line-clamp-1">
                                      <span className="flex items-center justify-center">
                                        <AssistantIcon size={4} />
                                      </span>

                                      <span>{assistant.name}</span>

                                      {currentAssistant.id === assistant.id && (
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
                                  </li>
                                );
                              })}
                          </ul>
                        )}
                      </div>
                    )}
                </div>

                {currentAnalyzer === "datasource" &&
                  Object.keys(currentDatasource).length > 0 && (
                    <button
                      type="button"
                      className="flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md h-7 text-btn-primary-text bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                      onClick={() => handleAddWidget()}
                      disabled={
                        queryLoading ||
                        eventStats.run_id === null ||
                        addWidgetLoading
                      }
                    >
                      {addWidgetLoading && (
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

                      <span>Add Widget</span>
                    </button>
                  )}
              </div>
            )}

            {showThoughts && (
              <div className="sticky top-0 left-0 flex items-center justify-between w-full px-4 py-3 border-b bg-page border-border-color">
                <div className="flex items-center space-x-4 text-xs font-semibold tracking-wide text-primary-text">
                  <span
                    className="flex items-center justify-center"
                    onClick={() => setShowThoughts(false)}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                    >
                      <path d="M6.51953 10.8335L11.1862 15.5002L9.9987 16.6668L3.33203 10.0002L9.9987 3.3335L11.1862 4.50016L6.51953 9.16683H16.6654V10.8335H6.51953Z" />
                    </svg>
                  </span>

                  <span className="text-primary-text">Thoughts</span>
                </div>
              </div>
            )}

            {Object.keys(currentDatasource).length > 0 ||
              Object.keys(currentAssistant).length > 0 || (
                <div className="flex items-center justify-center flex-1 h-full">
                  <div className="flex flex-col space-y-3 text-center">
                    <span className="flex items-center justify-center">
                      <svg
                        viewBox="0 0 48 47"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 fill-icon-color"
                      >
                        <path d="M19.2311 32.8327C23.12 32.8327 26.4256 31.4716 29.1478 28.7493C31.87 26.0271 33.2311 22.7216 33.2311 18.8327C33.2311 14.9438 31.87 11.6382 29.1478 8.91602C26.4256 6.19379 23.12 4.83268 19.2311 4.83268C15.3422 4.83268 12.0367 6.19379 9.31445 8.91602C6.59223 11.6382 5.23112 14.9438 5.23112 18.8327C5.23112 22.7216 6.59223 26.0271 9.31445 28.7493C12.0367 31.4716 15.3422 32.8327 19.2311 32.8327ZM16.8978 25.8327V9.49935H21.5645V25.8327H16.8978ZM8.73112 25.8327V14.166H13.3978V25.8327H8.73112ZM25.0645 25.8327V16.4993H29.7311V25.8327H25.0645ZM43.9645 46.8327L30.7228 33.591C29.1283 34.8355 27.3589 35.798 25.4145 36.4785C23.47 37.1591 21.4089 37.4993 19.2311 37.4993C14.02 37.4993 9.60612 35.691 5.98945 32.0743C2.37279 28.4577 0.564453 24.0438 0.564453 18.8327C0.564453 13.6216 2.37279 9.20768 5.98945 5.59102C9.60612 1.97435 14.02 0.166016 19.2311 0.166016C24.4422 0.166016 28.8561 1.97435 32.4728 5.59102C36.0895 9.20768 37.8978 13.6216 37.8978 18.8327C37.8978 21.0105 37.5575 23.0716 36.877 25.016C36.1964 26.9605 35.2339 28.7299 33.9895 30.3243L47.2311 43.566L43.9645 46.8327Z" />
                      </svg>
                    </span>

                    <p className="text-sm font-semibold text-primary-text">
                      Connect, analyze, and display insights as widgets.
                    </p>

                    <p className="text-xs font-medium text-secondary-text">
                      Select the datasource or assistant to analyze the data and
                      view insights.
                    </p>

                    <div className="relative flex w-full" ref={datasourceRef}>
                      <div
                        className={`w-full cursor-pointer border bg-dropdown-bg rounded-md ${
                          toggleDatasource
                            ? "border-[#242729]"
                            : "border-transparent"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between w-full h-8 px-2 py-2 space-x-2 border rounded-md min-w-80 border-dropdown-border"
                          onClick={() => setToggleDatasource(!toggleDatasource)}
                        >
                          {currentDatasource?.name ? (
                            <span className="text-xs font-medium text-dropdown-text line-clamp-1 whitespace-nowrap">
                              {currentDatasource?.name}
                            </span>
                          ) : currentAssistant?.name ? (
                            <span className="text-xs font-medium text-dropdown-text line-clamp-1 whitespace-nowrap">
                              {currentAssistant?.name}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-input-placeholder line-clamp-1 whitespace-nowrap">
                              Choose datasource or assistant
                            </span>
                          )}

                          {toggleDatasource ? (
                            <span className="flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-5 h-5 fill-dropdown-icon"
                              >
                                <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
                              </svg>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-5 h-5 fill-dropdown-icon"
                              >
                                <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>

                      {toggleDatasource && (
                        <ul className="flex flex-col w-full bg-dropdown-bg rounded-md max-h-52 overflow-y-auto recent__bar z-10 absolute top-[110%] left-0 shadow-md border-dropdown-border border">
                          <li className="sticky top-0 left-0 w-full bg-dropdown-bg">
                            <ul className="flex items-center">
                              <li
                                className={`min-h-8 text-sm font-medium flex items-center space-x-2 justify-center px-2 border-b-2 cursor-pointer ${
                                  currentAnalyzer === "datasource"
                                    ? "border-tabs-active text-tabs-active"
                                    : "border-transparent text-tabs-text hover:text-tabs-hover"
                                }`}
                                onClick={() => setCurrentAnalyzer("datasource")}
                              >
                                <span className="flex items-center justify-center">
                                  <svg
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-4 h-4 ${
                                      currentAnalyzer === "datasource"
                                        ? "fill-active-icon"
                                        : "fill-icon-color"
                                    }`}
                                  >
                                    <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                                  </svg>
                                </span>
                                <span>Datasources</span>
                              </li>

                              <li
                                className={`min-h-8 text-sm font-medium flex items-center space-x-2 justify-center px-2 border-b-2 cursor-pointer ${
                                  currentAnalyzer === "assistant"
                                    ? "border-tabs-active text-tabs-active"
                                    : "border-transparent text-tabs-text hover:text-tabs-hover"
                                }`}
                                onClick={() => setCurrentAnalyzer("assistant")}
                              >
                                <span className="flex items-center justify-center">
                                  <AssistantIcon size={4} />
                                </span>
                                <span>Assistants</span>
                              </li>
                            </ul>
                          </li>

                          <li className="sticky top-0 left-0 w-full p-2 bg-dropdown-bg">
                            {currentAnalyzer === "datasource" && (
                              <input
                                type="text"
                                className="w-full h-8 px-2 text-xs border rounded-md outline-none bg-dropdown-bg text-primary-text border-dropdown-border placeholder:text-input-placeholder focus:border-active-border"
                                placeholder="Search datasource"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            )}

                            {currentAnalyzer === "assistant" && (
                              <input
                                type="text"
                                className="w-full h-8 px-2 text-xs border rounded-md outline-none bg-dropdown-bg text-primary-text border-dropdown-border placeholder:text-input-placeholder focus:border-active-border"
                                placeholder="Search assistant"
                                value={searchAssistantQuery}
                                onChange={(e) =>
                                  setSearchAssistantQuery(e.target.value)
                                }
                              />
                            )}
                          </li>

                          {currentAnalyzer === "datasource" &&
                            datasourceLoading && (
                              <li className="flex items-center justify-center h-40 px-4">
                                <div role="status">
                                  <svg
                                    aria-hidden="true"
                                    className="w-4 h-4 animate-spin text-primary-text fill-btn-primary"
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
                              </li>
                            )}

                          {(currentAnalyzer === "datasource" &&
                            datasourceLoading) ||
                            getRes?.length > 0 || (
                              <li className="flex items-center justify-center h-40 px-4 text-xs font-medium text-center capitalize text-dropdown-text">
                                Datasource not available
                              </li>
                            )}

                          {(currentAnalyzer === "assistant" &&
                            isAssistantsLoading) ||
                            getAssistantsRes?.length > 0 || (
                              <li className="flex items-center justify-center h-40 px-4 text-xs font-medium text-center capitalize text-dropdown-text">
                                Assistant not available
                              </li>
                            )}

                          {!datasourceLoading &&
                            currentAnalyzer === "datasource" &&
                            getRes?.length > 0 &&
                            getRes
                              ?.filter((item) => {
                                return (
                                  item.ds_config.ds_type !== "semi_structured"
                                );
                              })
                              ?.map((datasource) => {
                                return (
                                  <li
                                    className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-active-bg-hover text-dropdown-text bg-dropdown-bg"
                                    onClick={() =>
                                      handleDatasourceChange(datasource)
                                    }
                                  >
                                    <div className="flex items-center space-x-2 line-clamp-1">
                                      <span className="flex items-center justify-center">
                                        <svg
                                          viewBox="0 0 16 16"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-4 h-4 fill-icon-color"
                                        >
                                          <path d="M8 14C6.32222 14 4.90278 13.7417 3.74167 13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 10.9917 3.76667C9.99722 3.47778 9 3.33333 8 3.33333C6.98889 3.33333 5.99722 3.475 5.025 3.75833C4.05278 4.04167 3.48889 4.35 3.33333 4.68333C3.48889 5.01667 4.05278 5.32222 5.025 5.6C5.99722 5.87778 6.98889 6.01667 8 6.01667ZM8 9.33333C8.46667 9.33333 8.91667 9.31111 9.35 9.26667C9.78333 9.22222 10.1972 9.15833 10.5917 9.075C10.9861 8.99167 11.3583 8.88889 11.7083 8.76667C12.0583 8.64444 12.3778 8.50556 12.6667 8.35V6.35C12.3778 6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 6.88889 10.9861 6.99167 10.5917 7.075C10.1972 7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 7.15833 5.375 7.075C4.98056 6.99167 4.61111 6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 8.99167 5.375 9.075C5.76944 9.15833 6.18889 9.22222 6.63333 9.26667C7.07778 9.31111 7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 12.6667 9.03056 12.6278 9.55833 12.55C10.0861 12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 10.9861 10.325 10.5917 10.4083C10.1972 10.4917 9.78333 10.5556 9.35 10.6C8.91667 10.6444 8.46667 10.6667 8 10.6667C7.53333 10.6667 7.07778 10.6444 6.63333 10.6C6.18889 10.5556 5.76944 10.4917 5.375 10.4083C4.98056 10.325 4.61111 10.2222 4.26667 10.1C3.92222 9.97778 3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 11.5 3.56389 11.6611 3.85833 11.8167C4.15278 11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 12.3694 5.9 12.4722 6.43333 12.55C6.96667 12.6278 7.48889 12.6667 8 12.6667Z" />
                                        </svg>
                                      </span>

                                      <span>{datasource.name}</span>

                                      {currentDatasource.id ===
                                        datasource.id && (
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

                                    {datasource?.ds_config?.ds_type ===
                                      "sql_generator" && (
                                      <div className="text-xs flex font-medium items-center justify-center space-x-2 text-[#40AD7D] w-fit">
                                        <span>Structured</span>
                                      </div>
                                    )}

                                    {datasource?.ds_config?.ds_type ===
                                      "semi_structured" && (
                                      <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#A840AD] w-fit">
                                        <span>Semi-Structured</span>
                                      </div>
                                    )}

                                    {datasource?.ds_config?.ds_type ===
                                      "third_party" && (
                                      <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#AD7A40] w-fit">
                                        <span>Third Party</span>
                                      </div>
                                    )}
                                  </li>
                                );
                              })}

                          {!isAssistantsLoading &&
                            currentAnalyzer === "assistant" &&
                            getAssistantsRes?.length > 0 &&
                            getAssistantsRes?.map((assistant) => {
                              return (
                                <li
                                  className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-active-bg-hover text-dropdown-text bg-dropdown-bg"
                                  onClick={() => {
                                    setCurrentDatasource({});
                                    setCurrentAssistant(assistant);
                                    setToggleDatasource(false);
                                  }}
                                >
                                  <div className="flex items-center space-x-2 line-clamp-1">
                                    <span className="flex items-center justify-center">
                                        <AssistantIcon size={4} />
                                    </span>

                                    <span>{assistant.name}</span>

                                    {currentAssistant.id === assistant.id && (
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
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {!getDatasourceLoading &&
              Object.keys(currentAssistant).length === 0 &&
              Object.keys(currentDatasource).length > 0 && (
                <div className="w-full h-full max-h-full">
                  {getSqlRes?.ds_config?.ds_type === "third_party" &&
                  getSqlRes?.ds_config?.last_transformation_synced_at ===
                    null ? (
                    <div className="flex items-center justify-center w-full h-full max-h-full text-white">
                      <div className="flex flex-col items-center w-full max-w-full">
                        <svg
                          viewBox="0 0 38 38"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-10 h-10 fill-icon-color-hover"
                        >
                          <path d="M0.335938 37.6673V33.0006H6.7526L5.81927 32.184C3.79705 30.3951 2.3776 28.3534 1.56094 26.059C0.744271 23.7645 0.335938 21.4506 0.335938 19.1173C0.335938 14.8007 1.62899 10.9604 4.2151 7.59648C6.80121 4.2326 10.1748 2.00621 14.3359 0.917318V5.81732C11.5359 6.82843 9.28038 8.54926 7.56927 10.9798C5.85816 13.4104 5.0026 16.1229 5.0026 19.1173C5.0026 20.8673 5.33316 22.5687 5.99427 24.2215C6.65538 25.8743 7.68594 27.4007 9.08594 28.8006L9.66927 29.384V23.6673H14.3359V37.6673H0.335938ZM23.6693 37.084V32.184C26.4693 31.1729 28.7248 29.452 30.4359 27.0215C32.147 24.5909 33.0026 21.8784 33.0026 18.884C33.0026 17.134 32.672 15.4326 32.0109 13.7798C31.3498 12.127 30.3193 10.6007 28.9193 9.20065L28.3359 8.61732V14.334H23.6693V0.333984H37.6693V5.00065H31.2526L32.1859 5.81732C34.0915 7.72287 35.4818 9.79371 36.3568 12.0298C37.2318 14.2659 37.6693 16.5506 37.6693 18.884C37.6693 23.2006 36.3762 27.0409 33.7901 30.4048C31.204 33.7687 27.8304 35.9951 23.6693 37.084Z" />
                        </svg>

                        <p className="mt-3 text-base font-medium text-primary-text">
                          First data sync is currently in progress...
                        </p>

                        <p className="w-full max-w-xl mx-auto text-sm font-normal text-center text-secondary-text">
                          Please wait while your data is syncing. You will be
                          notified once your datasource is available
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full max-h-full">
                      {showThoughts || (
                        <Split
                          className="split_column"
                          direction="vertical"
                          minSize={100}
                          gutterSize={6}
                          cursor="n-resize"
                          sizes={[50, 50]}
                        >
                          <div className="z-10 flex flex-col w-full h-full max-h-full">
                            <div className="flex items-center px-3 h-[72px] space-x-3 relative">
                              <input
                                type="text"
                                className="w-full h-12 pl-12 text-xs font-medium bg-transparent border rounded-full outline-none pr-14 2xl:text-sm text-input-text border-input-border placeholder:text-input-placeholder"
                                placeholder="Search database or table name here..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                disabled={queryLoading}
                                readOnly={queryLoading}
                              />

                              <span className="absolute flex items-center justify-center -translate-y-1/2 left-5 top-1/2">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g clip-path="url(#clip0_966_16242)">
                                    <path
                                      d="M6.50132 16.0003C6.3433 16.0011 6.1888 15.9537 6.05847 15.8644C5.92814 15.775 5.82817 15.648 5.77194 15.5003L4.52694 12.2628C4.50172 12.1976 4.46315 12.1384 4.41369 12.0889C4.36424 12.0394 4.30499 12.0009 4.23975 11.9757L1.00131 10.7297C0.853797 10.6731 0.726915 10.5731 0.637414 10.4429C0.547912 10.3126 0.5 10.1583 0.5 10.0003C0.5 9.84233 0.547912 9.68803 0.637414 9.55782C0.726915 9.4276 0.853797 9.32758 1.00131 9.27096L4.23882 8.02596C4.30405 8.00075 4.3633 7.96217 4.41276 7.91272C4.46221 7.86326 4.50079 7.80401 4.526 7.73878L5.77194 4.50034C5.82856 4.35282 5.92857 4.22594 6.05879 4.13644C6.18901 4.04694 6.34331 3.99902 6.50132 3.99902C6.65932 3.99902 6.81362 4.04694 6.94384 4.13644C7.07405 4.22594 7.17407 4.35282 7.23069 4.50034L8.47569 7.73784C8.50091 7.80308 8.53948 7.86232 8.58893 7.91178C8.63839 7.96124 8.69764 7.99981 8.76288 8.02503L11.9816 9.26346C12.1352 9.32037 12.2674 9.4232 12.3604 9.55796C12.4534 9.69272 12.5026 9.85286 12.5013 10.0166C12.4989 10.1718 12.45 10.3228 12.3609 10.45C12.2717 10.5771 12.1465 10.6746 12.0013 10.7297L8.76381 11.9747C8.69858 11.9999 8.63933 12.0385 8.58987 12.088C8.54042 12.1374 8.50184 12.1967 8.47663 12.2619L7.23069 15.5003C7.17446 15.648 7.07449 15.775 6.94416 15.8644C6.81383 15.9537 6.65933 16.0011 6.50132 16.0003Z"
                                      fill="var(--input-text-placeholder)"
                                    />
                                    <path
                                      d="M2.74994 5.49991C2.6573 5.49991 2.56684 5.47184 2.49047 5.4194C2.4141 5.36696 2.35541 5.29262 2.32213 5.20616L1.79525 3.83616C1.78383 3.8062 1.76621 3.77899 1.74354 3.75632C1.72086 3.73364 1.69365 3.71602 1.66369 3.7046L0.293691 3.17773C0.207247 3.14444 0.132915 3.08574 0.0804885 3.00937C0.0280618 2.933 0 2.84255 0 2.74991C0 2.65728 0.0280618 2.56682 0.0804885 2.49045C0.132915 2.41408 0.207247 2.35539 0.293691 2.3221L1.66369 1.79523C1.69362 1.78375 1.72081 1.76611 1.74347 1.74345C1.76614 1.72078 1.78378 1.6936 1.79525 1.66366L2.31744 0.305851C2.34689 0.225914 2.39757 0.155514 2.46402 0.102216C2.53048 0.0489189 2.6102 0.0147393 2.69463 0.00335107C2.79599 -0.00897073 2.89856 0.0128976 2.98608 0.0654883C3.0736 0.118079 3.14105 0.198382 3.17775 0.293664L3.70463 1.66366C3.7161 1.6936 3.73374 1.72078 3.75641 1.74345C3.77908 1.76611 3.80626 1.78375 3.83619 1.79523L5.20619 2.3221C5.29263 2.35539 5.36697 2.41408 5.41939 2.49045C5.47182 2.56682 5.49988 2.65728 5.49988 2.74991C5.49988 2.84255 5.47182 2.933 5.41939 3.00937C5.36697 3.08574 5.29263 3.14444 5.20619 3.17773L3.83619 3.7046C3.80623 3.71602 3.77902 3.73364 3.75635 3.75632C3.73367 3.77899 3.71605 3.8062 3.70463 3.83616L3.17775 5.20616C3.14447 5.29262 3.08578 5.36696 3.00941 5.4194C2.93304 5.47184 2.84258 5.49991 2.74994 5.49991Z"
                                      fill="var(--input-text-placeholder)"
                                    />
                                    <path
                                      d="M12.4996 8.00019C12.3985 8.00016 12.2999 7.9695 12.2166 7.91226C12.1333 7.85503 12.0693 7.7739 12.033 7.67956L11.3193 5.82425C11.3067 5.79156 11.2874 5.76187 11.2627 5.7371C11.2379 5.71234 11.2082 5.69306 11.1755 5.6805L9.32022 4.96675C9.22597 4.93043 9.14492 4.86641 9.08776 4.78313C9.0306 4.69984 9 4.6012 9 4.50019C9 4.39917 9.0306 4.30053 9.08776 4.21724C9.14492 4.13396 9.22597 4.06994 9.32022 4.03362L11.1755 3.31987C11.2082 3.30732 11.2379 3.28803 11.2627 3.26327C11.2874 3.23851 11.3067 3.20882 11.3193 3.17612L12.0277 1.33394C12.0601 1.24682 12.1154 1.1701 12.1879 1.11194C12.2604 1.05378 12.3472 1.01634 12.4393 1.00362C12.5499 0.990235 12.6618 1.01417 12.7573 1.07164C12.8527 1.1291 12.9262 1.2168 12.9662 1.32081L13.6799 3.17612C13.6925 3.20882 13.7118 3.23851 13.7365 3.26327C13.7613 3.28803 13.791 3.30732 13.8237 3.31987L15.679 4.03362C15.7732 4.06994 15.8543 4.13396 15.9114 4.21724C15.9686 4.30053 15.9992 4.39917 15.9992 4.50019C15.9992 4.6012 15.9686 4.69984 15.9114 4.78313C15.8543 4.86641 15.7732 4.93043 15.679 4.96675L13.8237 5.6805C13.791 5.69306 13.7613 5.71234 13.7365 5.7371C13.7118 5.76187 13.6925 5.79156 13.6799 5.82425L12.9662 7.67956C12.9299 7.7739 12.8659 7.85503 12.7826 7.91226C12.6993 7.9695 12.6007 8.00016 12.4996 8.00019Z"
                                      fill="var(--input-text-placeholder)"
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_966_16242">
                                      <rect
                                        width="16"
                                        height="16"
                                        fill="white"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </span>

                              {queryLoading || (
                                <button
                                  className="absolute flex items-center justify-center w-8 h-8 text-xs font-medium tracking-wide -translate-y-1/2 rounded-full top-1/2 right-5 text-btn-primary-text whitespace-nowrap 2xl:text-sm bg-btn-primary hover:bg-btn-primary-hover group disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                                  onClick={handleQuery}
                                  disabled={query !== "" ? false : true}
                                >
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4 fill-btn-primary-icon group-disabled:fill-btn-primary-disable-text"
                                    >
                                      <path d="M7 16V3.825L1.4 9.425L0 8L8 0L16 8L14.6 9.425L9 3.825V16H7Z" />
                                    </svg>
                                  </span>
                                </button>
                              )}

                              {queryLoading && (
                                <button
                                  type="button"
                                  className="absolute flex items-center justify-center w-8 h-8 space-x-2 text-xs font-medium tracking-wide -translate-y-1/2 rounded-full top-1/2 right-5 text-btn-primary-text whitespace-nowrap 2xl:text-sm bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
                                  onClick={handleStopChat}
                                  disabled={isStopping}
                                >
                                  <span className="flex items-center justify-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 256 256"
                                      className="w-4 h-4 fill-btn-primary-icon group-disabled:fill-btn-primary-disable-text"
                                    >
                                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM112,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"></path>
                                    </svg>
                                  </span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center justify-between px-3 h-9 bg-secondary-bg">
                              <div className="flex items-center space-x-4">
                                <p className="text-xs font-semibold 2xl:text-sm text-primary-text">
                                  SQL Query
                                </p>

                                <button
                                  type="button"
                                  className="flex items-center justify-center h-6 px-3 space-x-1 text-xs font-medium tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary group hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                                  onClick={handleRunExecutionInsights}
                                  disabled={!activeRun}
                                >
                                  {executeSqlLoading || (
                                    <span className="flex items-center justify-center">
                                      <svg
                                        viewBox="0 0 8 11"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-3 h-3 fill-btn-primary-icon group-disabled:fill-btn-primary-disable-text"
                                      >
                                        <path d="M0.332031 10.1668V0.833496L7.66536 5.50016L0.332031 10.1668Z" />
                                      </svg>
                                    </span>
                                  )}

                                  {executeSqlLoading && (
                                    <div role="status">
                                      <svg
                                        aria-hidden="true"
                                        className="w-3 h-3 animate-spin text-primary-text fill-btn-primary"
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

                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                  )}

                                  <span>Run</span>
                                </button>
                              </div>

                              <div className="flex items-center space-x-4">
                                <button
                                  className="flex items-center space-x-2 text-xs font-medium group 2xl:text-sm disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable text-btn-normal-text hover:text-btn-normal-hover"
                                  type="button"
                                  onClick={() => setShowThoughts(true)}
                                  disabled={!showResult}
                                >
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 20 21"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4 fill-btn-normal-icon group-hover:fill-btn-normal-hover group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable"
                                    >
                                      <path d="M9.16797 14.6665H10.8346V9.6665H9.16797V14.6665ZM10.0013 7.99984C10.2374 7.99984 10.4353 7.91998 10.5951 7.76025C10.7548 7.60053 10.8346 7.40261 10.8346 7.1665C10.8346 6.93039 10.7548 6.73248 10.5951 6.57275C10.4353 6.41303 10.2374 6.33317 10.0013 6.33317C9.76519 6.33317 9.56727 6.41303 9.40755 6.57275C9.24783 6.73248 9.16797 6.93039 9.16797 7.1665C9.16797 7.40261 9.24783 7.60053 9.40755 7.76025C9.56727 7.91998 9.76519 7.99984 10.0013 7.99984ZM10.0013 18.8332C8.84852 18.8332 7.76519 18.6144 6.7513 18.1769C5.73741 17.7394 4.85547 17.1457 4.10547 16.3957C3.35547 15.6457 2.76172 14.7637 2.32422 13.7498C1.88672 12.7359 1.66797 11.6526 1.66797 10.4998C1.66797 9.34706 1.88672 8.26373 2.32422 7.24984C2.76172 6.23595 3.35547 5.354 4.10547 4.604C4.85547 3.854 5.73741 3.26025 6.7513 2.82275C7.76519 2.38525 8.84852 2.1665 10.0013 2.1665C11.1541 2.1665 12.2374 2.38525 13.2513 2.82275C14.2652 3.26025 15.1471 3.854 15.8971 4.604C16.6471 5.354 17.2409 6.23595 17.6784 7.24984C18.1159 8.26373 18.3346 9.34706 18.3346 10.4998C18.3346 11.6526 18.1159 12.7359 17.6784 13.7498C17.2409 14.7637 16.6471 15.6457 15.8971 16.3957C15.1471 17.1457 14.2652 17.7394 13.2513 18.1769C12.2374 18.6144 11.1541 18.8332 10.0013 18.8332ZM10.0013 17.1665C11.8624 17.1665 13.4388 16.5207 14.7305 15.229C16.0221 13.9373 16.668 12.3609 16.668 10.4998C16.668 8.63873 16.0221 7.06234 14.7305 5.77067C13.4388 4.479 11.8624 3.83317 10.0013 3.83317C8.14019 3.83317 6.5638 4.479 5.27214 5.77067C3.98047 7.06234 3.33464 8.63873 3.33464 10.4998C3.33464 12.3609 3.98047 13.9373 5.27214 15.229C6.5638 16.5207 8.14019 17.1665 10.0013 17.1665Z" />
                                    </svg>
                                  </span>
                                  <span>Thoughts</span>
                                </button>
                              </div>
                            </div>

                            {queryLoading === false ? (
                              <div className="flex flex-col flex-1 w-full h-full py-2 overflow-hidden">
                                <div className="relative flex-1 w-full h-full overflow-hidden">
                                  <Editor
                                    key={customTheme}
                                    height="100%"
                                    width="100%"
                                    theme={
                                      customTheme === "dark"
                                        ? "vs-dark"
                                        : "vs-light"
                                    }
                                    language="sql"
                                    value={sqlRunQuery}
                                    options={Options}
                                    onChange={(value) => {
                                      handleEditorChange(value);
                                    }}
                                    onMount={(editor, monaco) => {
                                      monaco.editor.defineTheme(
                                        "darkTheme",
                                        darkTheme
                                      );
                                      monaco.editor.defineTheme(
                                        "lightTheme",
                                        lightTheme
                                      );
                                      monaco.editor.setTheme(
                                        customTheme === "dark"
                                          ? "darkTheme"
                                          : "lightTheme"
                                      );
                                    }}
                                    placeholder="Enter your SQL formula."
                                    defaultValue={`\n\n\n\n\n\n\n\n\n`}
                                  />
                                </div>
                              </div>
                            ) : queryLoading === false &&
                              showResult === false ? (
                              <div className="flex flex-col flex-1 w-full h-full py-2 overflow-hidden">
                                <div className="flex flex-col items-center justify-center w-full h-full space-y-2 text-primary-text">
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-6 h-6 fill-icon-color"
                                    >
                                      <path d="M11 17H13V11H11V17ZM12 9C12.2833 9 12.5208 8.90417 12.7125 8.7125C12.9042 8.52083 13 8.28333 13 8C13 7.71667 12.9042 7.47917 12.7125 7.2875C12.5208 7.09583 12.2833 7 12 7C11.7167 7 11.4792 7.09583 11.2875 7.2875C11.0958 7.47917 11 7.71667 11 8C11 8.28333 11.0958 8.52083 11.2875 8.7125C11.4792 8.90417 11.7167 9 12 9ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z" />
                                    </svg>
                                  </span>

                                  <p className="text-sm font-semibold 2xl:text-base">
                                    No SQL
                                  </p>

                                  <p className="text-xs font-semibold 2xl:text-sm text-secondary-text">
                                    Submit your query above to generate the SQL
                                    here
                                  </p>
                                </div>
                              </div>
                            ) : queryLoading ? (
                              <div className="flex flex-col flex-1 w-full h-full py-2 overflow-hidden">
                                <div className="flex flex-col items-center justify-center h-full space-y-3">
                                  <div role="status">
                                    <svg
                                      aria-hidden="true"
                                      className="w-5 h-5 animate-spin text-primary-text fill-btn-primary"
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

                                  {currentNextEvent && (
                                    <p className="text-xs font-medium 2xl:text-sm text-secondary-text">
                                      {currentNextEvent}...
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div className="z-50 flex flex-col w-full h-full max-h-full bg-page">
                            <div className="flex items-center justify-between px-3 py-2.5 h-9 bg-secondary-bg">
                              <div className="flex items-center space-x-3">
                                <p className="text-xs font-semibold 2xl:text-sm text-primary-text">
                                  Output Results
                                </p>
                              </div>

                              {showResult &&
                                eventStats?.generation_execution
                                  ?.highest_confidence_score && (
                                  <div className="flex items-center space-x-2">
                                    <span className="flex items-center justify-center">
                                      {eventStats?.generation_execution
                                        ?.highest_confidence_score <= 50 && (
                                        <svg
                                          viewBox="0 0 8 14"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-3.5 h-3.5"
                                        >
                                          <path
                                            d="M1.33464 13.6654C1.14575 13.6654 0.987413 13.6015 0.859635 13.4737C0.731858 13.3459 0.667969 13.1876 0.667969 12.9987V2.33203C0.667969 2.14314 0.731858 1.98481 0.859635 1.85703C0.987413 1.72925 1.14575 1.66536 1.33464 1.66536H2.66797V0.332031H5.33464V1.66536H6.66797C6.85686 1.66536 7.01519 1.72925 7.14297 1.85703C7.27075 1.98481 7.33463 2.14314 7.33463 2.33203V12.9987C7.33463 13.1876 7.27075 13.3459 7.14297 13.4737C7.01519 13.6015 6.85686 13.6654 6.66797 13.6654H1.33464ZM2.0013 12.332H6.0013V2.9987H2.0013V12.332Z"
                                            fill="#C61B1B"
                                          />
                                        </svg>
                                      )}

                                      {eventStats?.generation_execution
                                        ?.highest_confidence_score > 50 &&
                                        eventStats?.generation_execution
                                          ?.highest_confidence_score <= 80 && (
                                          <svg
                                            viewBox="0 0 8 14"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-3.5 h-3.5"
                                          >
                                            <path
                                              d="M1.33464 13.6654C1.14575 13.6654 0.987413 13.6015 0.859635 13.4737C0.731858 13.3459 0.667969 13.1876 0.667969 12.9987V2.33203C0.667969 2.14314 0.731858 1.98481 0.859635 1.85703C0.987413 1.72925 1.14575 1.66536 1.33464 1.66536H2.66797V0.332031H5.33464V1.66536H6.66797C6.85686 1.66536 7.01519 1.72925 7.14297 1.85703C7.27075 1.98481 7.33463 2.14314 7.33463 2.33203V12.9987C7.33463 13.1876 7.27075 13.3459 7.14297 13.4737C7.01519 13.6015 6.85686 13.6654 6.66797 13.6654H1.33464ZM2.0013 6.9987H6.0013V2.9987H2.0013V6.9987Z"
                                              fill="#FFC107"
                                            />
                                          </svg>
                                        )}

                                      {eventStats?.generation_execution
                                        ?.highest_confidence_score > 80 && (
                                        <svg
                                          viewBox="0 0 8 14"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-3.5 h-3.5"
                                        >
                                          <path
                                            d="M1.33464 13.6693C1.14575 13.6693 0.987413 13.6054 0.859635 13.4776C0.731858 13.3498 0.667969 13.1915 0.667969 13.0026V2.33594C0.667969 2.14705 0.731858 1.98872 0.859635 1.86094C0.987413 1.73316 1.14575 1.66927 1.33464 1.66927H2.66797V0.335938H5.33464V1.66927H6.66797C6.85686 1.66927 7.01519 1.73316 7.14297 1.86094C7.27075 1.98872 7.33463 2.14705 7.33463 2.33594V13.0026C7.33463 13.1915 7.27075 13.3498 7.14297 13.4776C7.01519 13.6054 6.85686 13.6693 6.66797 13.6693H1.33464Z"
                                            fill="#1BC655"
                                          />
                                        </svg>
                                      )}
                                    </span>

                                    <span className="text-xs font-normal text-secondary-text">
                                      Confidence Score:
                                    </span>
                                    <span className="text-xs font-normal text-primary-text">
                                      {
                                        eventStats?.generation_execution
                                          ?.highest_confidence_score
                                      }
                                      %
                                    </span>
                                  </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between px-3 py-2.5 h-9 bg-page">
                              <div className="flex items-center space-x-4">
                                <button
                                  className={`flex items-center space-x-2 text-xs group font-medium group 2xl:text-sm disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable ${
                                    currentOutput === "table"
                                      ? "text-tabs-active"
                                      : "text-tabs-text hover:text-tabs-hover"
                                  }`}
                                  type="button"
                                  onClick={() => setCurrentOutput("table")}
                                  disabled={!showResult}
                                >
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className={`w-3 h-3 group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable ${
                                        currentOutput === "table"
                                          ? "fill-tabs-active"
                                          : "fill-btn-normal-icon group-hover:fill-btn-normal-hover"
                                      }`}
                                    >
                                      <path d="M0.5 13.8333V2.16667C0.5 1.70833 0.663194 1.31597 0.989583 0.989583C1.31597 0.663194 1.70833 0.5 2.16667 0.5H13.8333C14.2917 0.5 14.684 0.663194 15.0104 0.989583C15.3368 1.31597 15.5 1.70833 15.5 2.16667V13.8333C15.5 14.2917 15.3368 14.684 15.0104 15.0104C14.684 15.3368 14.2917 15.5 13.8333 15.5H2.16667C1.70833 15.5 1.31597 15.3368 0.989583 15.0104C0.663194 14.684 0.5 14.2917 0.5 13.8333ZM2.16667 5.5H13.8333V2.16667H2.16667V5.5ZM6.60417 9.66667H9.39583V7.16667H6.60417V9.66667ZM6.60417 13.8333H9.39583V11.3333H6.60417V13.8333ZM2.16667 9.66667H4.9375V7.16667H2.16667V9.66667ZM11.0625 9.66667H13.8333V7.16667H11.0625V9.66667ZM2.16667 13.8333H4.9375V11.3333H2.16667V13.8333ZM11.0625 13.8333H13.8333V11.3333H11.0625V13.8333Z" />
                                    </svg>
                                  </span>
                                  <span>Table</span>
                                </button>

                                <button
                                  className={`flex items-center space-x-2 text-xs group font-medium group 2xl:text-sm disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable ${
                                    currentOutput === "graph"
                                      ? "text-tabs-active"
                                      : "text-tabs-text hover:text-tabs-hover"
                                  }`}
                                  type="button"
                                  onClick={() => setCurrentOutput("graph")}
                                  disabled={!showResult}
                                >
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className={`w-3 h-3 group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable ${
                                        currentOutput === "graph"
                                          ? "fill-tabs-active"
                                          : "fill-btn-normal-icon group-hover:fill-btn-normal-hover"
                                      }`}
                                    >
                                      <path d="M0.5 15.5V13.8333L2.16667 12.1667V15.5H0.5ZM3.83333 15.5V10.5L5.5 8.83333V15.5H3.83333ZM7.16667 15.5V8.83333L8.83333 10.5208V15.5H7.16667ZM10.5 15.5V10.5208L12.1667 8.85417V15.5H10.5ZM13.8333 15.5V7.16667L15.5 5.5V15.5H13.8333ZM0.5 11.1875V8.83333L6.33333 3L9.66667 6.33333L15.5 0.5V2.85417L9.66667 8.6875L6.33333 5.35417L0.5 11.1875Z" />
                                    </svg>
                                  </span>
                                  <span>Chart</span>
                                </button>
                              </div>

                              {currentOutput === "graph" && (
                                <div className="flex items-center space-x-4">
                                  <button
                                    className="flex items-center space-x-2 text-xs font-medium group 2xl:text-sm disabled:text-btn-normal-disable disabled:hover:text-btn-normal-disable text-btn-normal-text hover:text-btn-normal-hover"
                                    type="button"
                                    onClick={() => setShowGraphChange(true)}
                                    disabled={!showResult}
                                  >
                                    <span className="flex items-center justify-center">
                                      <svg
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-3 h-3 fill-btn-normal-icon group-hover:fill-btn-normal-hover group-disabled:fill-btn-normal-disable group-disabled:hover:fill-btn-normal-disable"
                                      >
                                        <path d="M3.83333 12.1667H5.5V6.33333H3.83333V12.1667ZM7.16667 12.1667H8.83333V3.83333H7.16667V12.1667ZM10.5 12.1667H12.1667V8.83333H10.5V12.1667ZM2.16667 15.5C1.70833 15.5 1.31597 15.3368 0.989583 15.0104C0.663194 14.684 0.5 14.2917 0.5 13.8333V2.16667C0.5 1.70833 0.663194 1.31597 0.989583 0.989583C1.31597 0.663194 1.70833 0.5 2.16667 0.5H13.8333C14.2917 0.5 14.684 0.663194 15.0104 0.989583C15.3368 1.31597 15.5 1.70833 15.5 2.16667V13.8333C15.5 14.2917 15.3368 14.684 15.0104 15.0104C14.684 15.3368 14.2917 15.5 13.8333 15.5H2.16667ZM2.16667 13.8333H13.8333V2.16667H2.16667V13.8333Z" />
                                      </svg>
                                    </span>
                                    <span>Change graph type</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {generationError ? (
                              <div className="flex items-center justify-center h-full overflow-y-auto text-primary-text recent__bar">
                                <div className="flex flex-col items-center justify-center w-full h-full space-y-4 text-center">
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 48 48"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-5 h-5 fill-icon-color"
                                    >
                                      <path d="M10.6667 37.3333H16V18.6667H10.6667V37.3333ZM21.3333 37.3333H26.6667V10.6667H21.3333V37.3333ZM32 37.3333H37.3333V26.6667H32V37.3333ZM5.33333 48C3.86667 48 2.61111 47.4778 1.56667 46.4333C0.522222 45.3889 0 44.1333 0 42.6667V5.33333C0 3.86667 0.522222 2.61111 1.56667 1.56667C2.61111 0.522222 3.86667 0 5.33333 0H42.6667C44.1333 0 45.3889 0.522222 46.4333 1.56667C47.4778 2.61111 48 3.86667 48 5.33333V42.6667C48 44.1333 47.4778 45.3889 46.4333 46.4333C45.3889 47.4778 44.1333 48 42.6667 48H5.33333ZM5.33333 42.6667H42.6667V5.33333H5.33333V42.6667Z" />
                                    </svg>
                                  </span>

                                  <p className="w-full max-w-xl text-sm font-medium tracking-wider text-center text-primary-text">
                                    Model Error
                                  </p>

                                  <p className="w-full max-w-xl text-xs font-medium tracking-wider text-center text-secondary-text">
                                    {generationError}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              showResult &&
                              currentOutput === "table" && (
                                <div className="relative w-full h-full">
                                  <DatasourceResizableTable
                                    payload={{
                                      datasource_id: slug,
                                      run_id: eventStats.run_id,
                                      event_id: eventId,
                                    }}
                                    dataframe={dataframe}
                                    setDataframe={setDataframe}
                                    resetKey={resetKey}
                                    sqlRunQuery={sqlRunQuery}
                                  />
                                </div>
                              )
                            )}

                            {showResult && currentOutput === "graph" && (
                              <div className="relative w-full h-full">
                                <DatasourcePivotGraph
                                  payload={{
                                    datasource_id: slug,
                                    run_id: eventStats.run_id,
                                    event_id: eventId,
                                  }}
                                  config={visualizationInfo}
                                  sqlRunQuery={sqlRunQuery}
                                />
                              </div>
                            )}

                            {showResult || (
                              <div className="flex flex-col flex-1 w-full h-full py-2 overflow-hidden">
                                <div className="flex flex-col items-center justify-center w-full h-full space-y-2 text-primary-text">
                                  <span className="flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-6 h-6 fill-icon-color"
                                    >
                                      <path d="M11 17H13V11H11V17ZM12 9C12.2833 9 12.5208 8.90417 12.7125 8.7125C12.9042 8.52083 13 8.28333 13 8C13 7.71667 12.9042 7.47917 12.7125 7.2875C12.5208 7.09583 12.2833 7 12 7C11.7167 7 11.4792 7.09583 11.2875 7.2875C11.0958 7.47917 11 7.71667 11 8C11 8.28333 11.0958 8.52083 11.2875 8.7125C11.4792 8.90417 11.7167 9 12 9ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z" />
                                    </svg>
                                  </span>

                                  <p className="text-sm font-semibold 2xl:text-base">
                                    No Data
                                  </p>

                                  <p className="text-xs font-semibold 2xl:text-sm text-secondary-text">
                                    Start typing your query in the input box
                                    above to generate and view the data
                                    instantly.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </Split>
                      )}

                      {showThoughts && (
                        <div className="flex flex-col px-4 py-4 space-y-2">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center justify-center">
                              <svg
                                viewBox="0 0 16 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 fill-icon-color-hover"
                              >
                                <path d="M5.49609 12.8301V11.1634H15.4961V12.8301H5.49609ZM5.49609 7.83008V6.16341H15.4961V7.83008H5.49609ZM5.49609 2.83008V1.16341H15.4961V2.83008H5.49609ZM2.16276 13.6634C1.70443 13.6634 1.31207 13.5002 0.985677 13.1738C0.659288 12.8474 0.496094 12.4551 0.496094 11.9967C0.496094 11.5384 0.659288 11.1461 0.985677 10.8197C1.31207 10.4933 1.70443 10.3301 2.16276 10.3301C2.62109 10.3301 3.01346 10.4933 3.33984 10.8197C3.66623 11.1461 3.82943 11.5384 3.82943 11.9967C3.82943 12.4551 3.66623 12.8474 3.33984 13.1738C3.01346 13.5002 2.62109 13.6634 2.16276 13.6634ZM2.16276 8.66341C1.70443 8.66341 1.31207 8.50022 0.985677 8.17383C0.659288 7.84744 0.496094 7.45508 0.496094 6.99675C0.496094 6.53841 0.659288 6.14605 0.985677 5.81966C1.31207 5.49327 1.70443 5.33008 2.16276 5.33008C2.62109 5.33008 3.01346 5.49327 3.33984 5.81966C3.66623 6.14605 3.82943 6.53841 3.82943 6.99675C3.82943 7.45508 3.66623 7.84744 3.33984 8.17383C3.01346 8.50022 2.62109 8.66341 2.16276 8.66341ZM2.16276 3.66341C1.70443 3.66341 1.31207 3.50022 0.985677 3.17383C0.659288 2.84744 0.496094 2.45508 0.496094 1.99675C0.496094 1.53841 0.659288 1.14605 0.985677 0.819662C1.31207 0.493273 1.70443 0.330078 2.16276 0.330078C2.62109 0.330078 3.01346 0.493273 3.33984 0.819662C3.66623 1.14605 3.82943 1.53841 3.82943 1.99675C3.82943 2.45508 3.66623 2.84744 3.33984 3.17383C3.01346 3.50022 2.62109 3.66341 2.16276 3.66341Z" />
                              </svg>
                            </span>

                            <p className="text-xs font-semibold 2xl:text-sm text-primary-text">
                              Steps Followed to generate SQL
                            </p>
                          </div>

                          <div className="w-full py-3 pl-6 border-l border-border-color">
                            <textarea
                              className="w-full p-4 text-xs font-medium border rounded-md outline-none h-28 bg-page border-border-color min-h-28 text-secondary-text"
                              value={
                                eventStats?.generation?.steps_to_follow ||
                                eventStats?.regenerate?.steps_to_follow ||
                                ""
                              }
                              readOnly={true}
                            ></textarea>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="flex items-center justify-center">
                              <svg
                                viewBox="0 0 14 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 fill-icon-color-hover"
                              >
                                <path d="M5.79036 14.1665L10.1029 8.99984H6.76953L7.3737 4.27067L3.51953 9.83317H6.41536L5.79036 14.1665ZM3.66536 17.3332L4.4987 11.4998H0.332031L7.83203 0.666504H9.4987L8.66536 7.33317H13.6654L5.33203 17.3332H3.66536Z" />
                              </svg>
                            </span>

                            <p className="text-xs font-semibold 2xl:text-sm text-primary-text">
                              Examples Powering
                            </p>
                          </div>

                          <div className="flex flex-col w-full py-3 pl-6 space-y-2">
                            {usedExamples?.length > 0 &&
                              usedExamples?.map((Example, index) => {
                                return (
                                  <Examples
                                    data={Example}
                                    key={index}
                                    theme={customTheme}
                                  />
                                );
                              })}

                            {usedExamples?.length === 0 && (
                              <div className="flex flex-col items-center justify-center space-y-4 border rounded-md min-h-64 border-border-color">
                                <span className="flex items-center justify-center">
                                  <svg
                                    viewBox="0 0 24 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6 fill-icon-color"
                                  >
                                    <path d="M11 17.5H13V11.5H11V17.5ZM12 9.5C12.2833 9.5 12.5208 9.40417 12.7125 9.2125C12.9042 9.02083 13 8.78333 13 8.5C13 8.21667 12.9042 7.97917 12.7125 7.7875C12.5208 7.59583 12.2833 7.5 12 7.5C11.7167 7.5 11.4792 7.59583 11.2875 7.7875C11.0958 7.97917 11 8.21667 11 8.5C11 8.78333 11.0958 9.02083 11.2875 9.2125C11.4792 9.40417 11.7167 9.5 12 9.5ZM12 22.5C10.6167 22.5 9.31667 22.2375 8.1 21.7125C6.88333 21.1875 5.825 20.475 4.925 19.575C4.025 18.675 3.3125 17.6167 2.7875 16.4C2.2625 15.1833 2 13.8833 2 12.5C2 11.1167 2.2625 9.81667 2.7875 8.6C3.3125 7.38333 4.025 6.325 4.925 5.425C5.825 4.525 6.88333 3.8125 8.1 3.2875C9.31667 2.7625 10.6167 2.5 12 2.5C13.3833 2.5 14.6833 2.7625 15.9 3.2875C17.1167 3.8125 18.175 4.525 19.075 5.425C19.975 6.325 20.6875 7.38333 21.2125 8.6C21.7375 9.81667 22 11.1167 22 12.5C22 13.8833 21.7375 15.1833 21.2125 16.4C20.6875 17.6167 19.975 18.675 19.075 19.575C18.175 20.475 17.1167 21.1875 15.9 21.7125C14.6833 22.2375 13.3833 22.5 12 22.5ZM12 20.5C14.2333 20.5 16.125 19.725 17.675 18.175C19.225 16.625 20 14.7333 20 12.5C20 10.2667 19.225 8.375 17.675 6.825C16.125 5.275 14.2333 4.5 12 4.5C9.76667 4.5 7.875 5.275 6.325 6.825C4.775 8.375 4 10.2667 4 12.5C4 14.7333 4.775 16.625 6.325 18.175C7.875 19.725 9.76667 20.5 12 20.5Z" />
                                  </svg>
                                </span>

                                <p className="text-xs font-medium tracking-wider 2xl:text-sm text-secondary-text">
                                  No examples available to display here
                                  currently
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            {!isAssistantsLoading &&
              Object.keys(currentDatasource).length === 0 &&
              Object.keys(currentAssistant).length > 0 && (
                <AssistantAnalyzer
                  key={generateKey()}
                  currentAssistant={currentAssistant}
                  setShow={setShow}
                  currentSection={currentSection}
                  refetchDashboard={refetchDashboard}
                />
              )}
          </div>
        </div>
      </div>

      {createWidget && (
        <CreateWidget
          createWidget={createWidget}
          setCreateWidget={setCreateWidget}
          handleCreate={handleAddWidget}
        />
      )}

      {showSuccessWidget && (
        <SuccessModal
          show={showSuccessWidget}
          setShow={setShowSuccessWidget}
          heading="Success Confirmation"
          title={""}
          description="Widget Created Successfully"
          primaryBtn="Close"
          primaryChange={() => setShowSuccessWidget(false)}
        />
      )}

      {showGraphChange && (
        <DatasourceGraphMenu
          show={showGraphChange}
          setShow={setShowGraphChange}
          dataField={dataframe}
          datasourceId={slug}
          eventId={eventId}
          runId={eventStats.run_id}
          visualizationInfo={visualizationInfo}
          setVisualizationInfo={setVisualizationInfo}
          sqlRunQuery={sqlRunQuery}
        />
      )}
    </>
  );
};

export default AddWidget;

const Examples = ({ data, theme }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col space-y-3">
      <div
        className="flex items-center justify-between h-10 px-4 py-3 border rounded-md cursor-pointer border-border-color"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <p className="text-xs font-medium 2xl:text-sm text-primary-text line-clamp-1">
          {data?.user_query || ""}
        </p>

        {isCollapsed ? (
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 8 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-icon-color-hover"
            >
              <path d="M4 0.733415L0 4.73341L0.933333 5.66675L4 2.60008L7.06667 5.66675L8 4.73341L4 0.733415Z" />
            </svg>
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 fill-icon-color"
            >
              <path d="M0 12V6.66667H1.33333V9.73333L9.73333 1.33333H6.66667V0H12V5.33333H10.6667V2.26667L2.26667 10.6667H5.33333V12H0Z" />
            </svg>
          </span>
        )}
      </div>

      {isCollapsed && (
        <div className="pl-3">
          <div className="flex flex-col py-3 pl-3 space-y-3 border-l border-border-color">
            <p className="text-xs font-semibold 2xl:text-sm text-primary-text">
              SQL
            </p>

            <div className="relative flex-1 w-full h-full overflow-hidden border rounded-md border-border-color">
              <Editor
                key={theme}
                height="250px"
                width="100%"
                theme={theme === "dark" ? "vs-dark" : "vs"}
                language="sql"
                value={data?.sql_cmd || ""}
                options={Options}
                onMount={(editor, monaco) => {
                  monaco.editor.defineTheme("darkTheme", darkTheme);
                  monaco.editor.defineTheme("lightTheme", lightTheme);
                  monaco.editor.setTheme(
                    customTheme === "dark" ? "darkTheme" : "lightTheme"
                  );
                }}
                placeholder="Enter your SQL formula."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
