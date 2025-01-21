import React, { useEffect, useRef, useState } from "react";
import {
  useCreateChatMutation,
  useGetAssistantMutation,
  useGetAssistantsQuery,
  useGetChatThreadQueryQuery,
  useGetMessageByIdMutation,
  useStopMessageResponseMutation,
  useUserFeedbackMutation,
} from "@/store/assistant";
import { useStreamAssistantMessageMutation } from "@/store/stream";
import { useSelector } from "react-redux";
import FeedbackModal from "@/components/Modal/FeedbackModal";
import NotebookChatEvents from "./NotebookChatEvents";
import useAutoResizeTextArea from "@/hooks/useAutoResizeTextArea";
import { useTheme } from "@/hooks/useTheme";
import useDebounce from "@/hooks/useDebounce";
import { useGetDatasourcesListQuery } from "@/store/datasource";
import { AssistantIcon } from "@/components/Icons/icon";

const AssistantChatBot = ({
  insertBlock,
  id,
  initialData,
  source_block,
  handleRestSourceProps,
  handleChangeSource,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdChatId, setCreatedChatId] = useState(null);
  const [createdAssistantId, setCreatedAssistantId] = useState(null);
  const [history, setHistory] = useState([]);
  const [messageId, setMessageId] = useState(null);
  const [skeletonLoader, setSkeletonLoader] = useState(false);
  const [currentNextEvent, setCurrentNextEvent] = useState("");
  const [threadErrorMessage, setThreadErrorMessage] = useState("");
  const [isInputDisabled, setIsInputDisabled] = useState(true);
  const [toggleThought, setToggleThought] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const [currentDatasource, setCurrentDatasource] = useState({});
  const [currentAssistant, setCurrentAssistant] = useState({});
  const [toggleDatasource, setToggleDatasource] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAssistantQuery, setSearchAssistantQuery] = useState("");
  const [currentAnalyzer, setCurrentAnalyzer] = useState("datasource");
  const [showDropdown, setShowDropdown] = useState(false);

  const [page, setPage] = useState(0);
  const limit = 10;

  const scrollRef = useRef();
  const datasourceRef = useRef(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedAssistantSearchQuery = useDebounce(searchAssistantQuery, 500);

  const { theme } = useTheme();
  const textAreaRef = useAutoResizeTextArea();

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [prompt, textAreaRef]);

  const events = useSelector((state) => state.sse.events);
  const isEventsConnectionOpen = useSelector(
    (state) => state.sse.isConnectionOpen
  );

  const [createChat, { error: createChatError }] = useCreateChatMutation();
  const [getAssistant, { data: assistantRes }] = useGetAssistantMutation();
  const [streamAssistantMessage, { error: streamAssistantMessageError }] =
    useStreamAssistantMessageMutation();
  const [stopMessageResponse, { error: stopMessageResponseError }] =
    useStopMessageResponseMutation();
  const [getMessageById, { error: GetMessageByIdError }] =
    useGetMessageByIdMutation();

  useEffect(() => {
    getAssistant({ assistant_id: id });
  }, []);

  useEffect(() => {
    if (assistantRes) {
      setCurrentAssistant(assistantRes);
    }
  }, [assistantRes]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchData = async (data, createdId) => {
    scrollToBottom();
    setSkeletonLoader(true);

    const queryData = {
      messageId: "",
      name: "user",
      value: data,
      data: {},
    };

    setHistory((prev) => [queryData, ...prev]);

    streamAssistantMessage({
      assistant_id: id,
      chat_id: createdId,
      payload: {
        user_query: data,
      },
    });

    setPrompt("");
  };

  const handleSendMessage = (message) => {
    setAutoScrollEnabled(true);

    if (!message.trim()) return;
    if (isLoading) return;

    setIsLoading(true);

    if (createdChatId) {
      fetchData(message, createdChatId);
    } else {
      createChat({ assistant_id: id }).then((response) => {
        if (response.data) {
          if (response.data.id) {
            setCreatedChatId(response.data.id);
            fetchData(message, response.data.id);
          }
        } else {
          return null;
        }
      });
    }
  };

  const loadMoreHistory = () => {
    setAutoScrollEnabled(false);

    if (!chatThreadLoading && hasMoreHistory) {
      setPage((prev) => prev + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage(prompt);
      setPrompt("");
    }
  };

  const handleStopChat = () => {
    if (!messageId || !createdChatId) return;

    setIsLoading(false);
    setSkeletonLoader(false);

    stopMessageResponse({ assistant_id: id, message_id: messageId })
      .then((response) => {
        setIsStopping(true);

        if (response.error) {
          console.error("Failed to stop the response:", response.error);
        } else {
          console.log("Response successfully stopped");
        }
      })
      .catch((error) => {
        console.error("Error while stopping the response:", error);
      });

    // Clear the current messageId, so a new request can be started afresh
    setMessageId(null);
  };

  const handleDatasourceOutsideClick = (e) => {
    if (datasourceRef.current && !datasourceRef.current.contains(e.target)) {
      setSearchQuery("");
      setSearchAssistantQuery("");
      setToggleDatasource(false);
    }
  };

  useEffect(() => {
    if (toggleDatasource) {
      document.addEventListener("mousedown", handleDatasourceOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleDatasourceOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleDatasourceOutsideClick);
    };
  }, [toggleDatasource]);

  const {
    data: getChatThread,
    isLoading: chatThreadLoading,
    error: getError,
    refetch,
  } = useGetChatThreadQueryQuery(
    {
      assistant_id: createdAssistantId,
      chat_id: createdChatId,
      skip: page * limit,
      limit,
      sort_by: "desc",
    },
    {
      skip: !createdAssistantId || !createdChatId,
    }
  );

  const { data: getRes, isLoading: datasourceLoading } =
    useGetDatasourcesListQuery({
      skip: 0,
      limit: 100,
      sort_by: "A-Z",
      ds_type: "sql_generator",
      query: debouncedSearchQuery,
    });

  // Fetch Assistants
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

  const transformData = (inputData) => {
    return inputData
      .map((item) => {
        const userMessage = {
          messageId: "",
          name: "user",
          value: item.user_query,
          data: {},
          feebacks: null,
          created_by: null,
        };

        const myEvents = Object.values(item.response_events).map((event) => ({
          ...event,
          messageId: item._id,
        }));

        const botMessage = {
          messageId: item._id,
          name: "bot",
          value: "",
          data: myEvents,
          feebacks: item.feebacks,
          created_by: item.created_by,
          error_message: item?.error_message,
          response_status: item?.response_status,
        };

        return [botMessage, userMessage];
      })
      .flat();
  };

  useEffect(() => {
    setThreadErrorMessage("");
    setHistory([]);

    const normalizedInitialData = Array.isArray(initialData)
      ? initialData
      : initialData
      ? [initialData]
      : [];

    const assistantInitialData = normalizedInitialData?.filter((item) => {
      if (source_block) {
        return item.id === source_block;
      }

      return [];
    });

    if (
      assistantInitialData.length > 0 &&
      assistantInitialData[0].props?.data?.assistant_id &&
      assistantInitialData[0].props?.data?.chat_id
    ) {
      setCreatedChatId(assistantInitialData[0].props.data.chat_id);
      setCreatedAssistantId(assistantInitialData[0].props?.data?.assistant_id);
      setShowDropdown(false);
    } else {
      setShowDropdown(true);
    }

    if (getChatThread) {
      const output = transformData(getChatThread);
      setHistory((prev) => [...prev, ...output]);

      if (getChatThread.length < limit) {
        setHasMoreHistory(false);
      } else {
        setHasMoreHistory(true);
      }
    }
  }, [source_block, getChatThread]);

  useEffect(() => {
    if (events && events.length > 0) {
      let shouldDisplayNextEvent = true; // Flag to control displaying next_event

      for (let i = 0; i < events.length; i++) {
        const event = events[i];

        if (event.event_type === "assistant_request") {
          setMessageId(event.message_id);
        }

        if (event.event_type === "tool_exec_request") {
          setSkeletonLoader(false);
        }

        if (shouldDisplayNextEvent && event.next_event) {
          setCurrentNextEvent(event.next_event);

          if (event.event_type === "sql_datasource_validation") {
            shouldDisplayNextEvent = false;
          }
        }
      }
    }
  }, [events]);

  const handleDatasourceChange = (datasource) => {
    setCurrentDatasource(datasource);
    setCurrentAssistant({});
    setToggleDatasource(false);
  };

  const AnimatedText = ({ text }) => {
    return (
      <div className="flex items-center text-sm font-medium thinking-text font-roboto text-secondary-text group-hover:text-primary-text">
        {text.split("").map((char, index) => (
          <span
            key={index}
            className="animate-fade-in"
            style={{
              marginRight: char === " " ? "0.3em" : "0.1em",
            }}
          >
            {char}
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!isEventsConnectionOpen && createdChatId) {
      getMessageById({ assistant_id: id, message_id: messageId }).then(
        (response) => {
          if (response.data) {
            setIsStopping(false);
            const responseInfo = response.data;

            const myEvents = Object.values(responseInfo.response_events).map(
              (event) => ({
                ...event,
                messageId: responseInfo._id,
              })
            );

            const queryData = {
              messageId: responseInfo._id || "",
              name: "bot",
              value: "",
              data: myEvents,
              feebacks: responseInfo.feebacks,
              created_by: responseInfo.created_by,
              error_message: responseInfo?.error_message,
              response_status: responseInfo?.response_status,
            };

            setHistory((prev) => [queryData, ...prev]);
            setMessageId(null);
          }
        }
      );

      setIsLoading(false);
    }
  }, [isEventsConnectionOpen]);

  const handleTextAccept = (data) => {
    insertBlock({
      type: "paragraph",
      children: [],
      content: [
        {
          styles: {},
          text: data,
          type: "text",
        },
      ],
    });
  };

  const handleAssistantAccept = (data) => {
    insertBlock({
      type: "chatbot_sql_datasource_run",
      props: {
        data: {
          chat_id: createdChatId,
          message_id: data.message_id,
          assistant_id: id,
          event_id: data.event_id,
          data_visualization_config: data.data_visualization_config,
          sql_cmd: data.sql_cmd,
          datasource_id: data.datasource_id,
        },
      },
    });
  };

  function removeHyphens(text) {
    return text.replace(/[-\/_:]/g, " ");
  }

  const handleRenderComplete = () => {
    if (autoScrollEnabled && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  if (threadErrorMessage) {
    return (
      <>
        <div className="flex items-center justify-between px-2 min-h-12 border-b-2 border-[#282828]">
          <div className="flex items-center space-x-2 text-xs font-medium tracking-wider text-white">
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 stroke-white group-hover:stroke-white"
              >
                <path d="M15.4167 7.5H4.58333C4.1231 7.5 3.75 7.8731 3.75 8.33333V16.6667C3.75 17.1269 4.1231 17.5 4.58333 17.5H15.4167C15.8769 17.5 16.25 17.1269 16.25 16.6667V8.33333C16.25 7.8731 15.8769 7.5 15.4167 7.5Z" />
                <path
                  d="M7.08333 11.6667C7.54357 11.6667 7.91667 11.2936 7.91667 10.8333C7.91667 10.3731 7.54357 10 7.08333 10C6.6231 10 6.25 10.3731 6.25 10.8333C6.25 11.2936 6.6231 11.6667 7.08333 11.6667Z"
                  fill="white"
                />
                <path
                  d="M12.9163 11.6667C13.3766 11.6667 13.7497 11.2936 13.7497 10.8333C13.7497 10.3731 13.3766 10 12.9163 10C12.4561 10 12.083 10.3731 12.083 10.8333C12.083 11.2936 12.4561 11.6667 12.9163 11.6667Z"
                  fill="white"
                />
                <path
                  d="M8.33333 13.332C7.87308 13.332 7.5 13.7051 7.5 14.1654C7.5 14.6256 7.87308 14.9987 8.33333 14.9987V13.332ZM11.6667 14.9987C12.1269 14.9987 12.5 14.6256 12.5 14.1654C12.5 13.7051 12.1269 13.332 11.6667 13.332V14.9987ZM8.33333 14.9987H11.6667V13.332H8.33333V14.9987Z"
                  fill="white"
                />
                <path
                  d="M10 4.16797V7.5013"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M1.66699 10.832V14.1654"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M18.333 10.832V14.1654"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path d="M10.0003 4.16667C10.4606 4.16667 10.8337 3.79357 10.8337 3.33333C10.8337 2.8731 10.4606 2.5 10.0003 2.5C9.54009 2.5 9.16699 2.8731 9.16699 3.33333C9.16699 3.79357 9.54009 4.16667 10.0003 4.16667Z" />
              </svg>
            </span>

            <span>{assistantRes?.name || ""}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-full px-4 space-y-2">
          <span className="flex items-center justify-center">
            <svg
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12"
            >
              <path
                d="M18.667 25.668C19.3281 25.668 19.8823 25.4444 20.3295 24.9971C20.7767 24.5499 21.0003 23.9957 21.0003 23.3346C21.0003 22.6735 20.7767 22.1194 20.3295 21.6721C19.8823 21.2249 19.3281 21.0013 18.667 21.0013C18.0059 21.0013 17.4517 21.2249 17.0045 21.6721C16.5573 22.1194 16.3337 22.6735 16.3337 23.3346C16.3337 23.9957 16.5573 24.5499 17.0045 24.9971C17.4517 25.4444 18.0059 25.668 18.667 25.668ZM28.0003 25.668C28.6614 25.668 29.2156 25.4444 29.6628 24.9971C30.1101 24.5499 30.3337 23.9957 30.3337 23.3346C30.3337 22.6735 30.1101 22.1194 29.6628 21.6721C29.2156 21.2249 28.6614 21.0013 28.0003 21.0013C27.3392 21.0013 26.7851 21.2249 26.3378 21.6721C25.8906 22.1194 25.667 22.6735 25.667 23.3346C25.667 23.9957 25.8906 24.5499 26.3378 24.9971C26.7851 25.4444 27.3392 25.668 28.0003 25.668ZM37.3337 25.668C37.9948 25.668 38.5489 25.4444 38.9962 24.9971C39.4434 24.5499 39.667 23.9957 39.667 23.3346C39.667 22.6735 39.4434 22.1194 38.9962 21.6721C38.5489 21.2249 37.9948 21.0013 37.3337 21.0013C36.6726 21.0013 36.1184 21.2249 35.6712 21.6721C35.2239 22.1194 35.0003 22.6735 35.0003 23.3346C35.0003 23.9957 35.2239 24.5499 35.6712 24.9971C36.1184 25.4444 36.6726 25.668 37.3337 25.668ZM4.66699 51.3346V9.33464C4.66699 8.0513 5.12394 6.95269 6.03783 6.0388C6.95171 5.12491 8.05033 4.66797 9.33366 4.66797H46.667C47.9503 4.66797 49.0489 5.12491 49.9628 6.0388C50.8767 6.95269 51.3337 8.0513 51.3337 9.33464V37.3346C51.3337 38.618 50.8767 39.7166 49.9628 40.6305C49.0489 41.5444 47.9503 42.0013 46.667 42.0013H14.0003L4.66699 51.3346ZM12.017 37.3346H46.667V9.33464H9.33366V39.9596L12.017 37.3346Z"
                fill="#5F6368"
              />
            </svg>
          </span>

          <p className="text-sm font-medium tracking-wider text-center text-white/50">
            {threadErrorMessage}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-2 border-b-2 min-h-12 max-h-12 h-full py-3.5 border-border-color">
        {showDropdown ? (
          <div className="relative flex w-full max-w-xs" ref={datasourceRef}>
            <div
              className={`w-full cursor-pointer border bg-dropdown-bg rounded-md ${
                toggleDatasource ? "border-[#242729]" : "border-transparent"
              }`}
            >
              <div
                className="flex items-center justify-between w-full h-8 px-2 py-2 space-x-2 border rounded-md min-w-80 border-dropdown-border"
                onClick={() => setToggleDatasource(!toggleDatasource)}
              >
                {currentDatasource?.name ? (
                  <p className="text-xs font-medium text-dropdown-text line-clamp-1 whitespace-nowrap">
                    {currentDatasource?.name}
                  </p>
                ) : currentAssistant?.name ? (
                  <p className="text-xs font-medium text-dropdown-text line-clamp-1 whitespace-nowrap">
                    {currentAssistant?.name}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-input-placeholder line-clamp-1 whitespace-nowrap">
                    Choose datasource or assistant
                  </p>
                )}

                {toggleDatasource ? (
                  <span className="flex items-center justify-center">
                    {/* Up Arrow Icon */}
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
                    {/* Down Arrow Icon */}
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
                {/* Analyzer Tabs */}
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
                        {/* DB Icon */}
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={
                            currentAnalyzer === "datasource"
                              ? "w-4 h-4 fill-active-icon"
                              : "w-4 h-4 fill-icon-color"
                          }
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

                {/* Search Input */}
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
                      onChange={(e) => setSearchAssistantQuery(e.target.value)}
                    />
                  )}
                </li>

                {/* Loading and Empty States */}
                {currentAnalyzer === "datasource" && datasourceLoading && (
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
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 
                          0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 
                          100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 
                          73.1895 27.4013 91.5094 50 91.5094C72.5987 
                          91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 
                          27.9921 72.5987 9.67226 50 9.67226C27.4013 
                          9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 
                          38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 
                          28.8227 92.871 24.3692 89.8167 20.348C85.8452 
                          15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 
                          4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 
                          0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 
                          1.69328 37.813 4.19778 38.4501 6.62326C39.0873 
                          9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 
                          9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 
                          10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 
                          17.9648 79.3347 21.5619 82.5849 25.841C84.9175 
                          28.9121 86.7997 32.2913 88.1811 35.8758C89.083 
                          38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  </li>
                )}

                {currentAnalyzer === "datasource" &&
                  !datasourceLoading &&
                  !(getRes?.length > 0) && (
                    <li className="flex items-center justify-center h-40 px-4 text-xs font-medium text-center capitalize text-dropdown-text">
                      Datasource not available
                    </li>
                  )}

                {currentAnalyzer === "assistant" &&
                  !isAssistantsLoading &&
                  !(getAssistantsRes?.length > 0) && (
                    <li className="flex items-center justify-center h-40 px-4 text-xs font-medium text-center capitalize text-dropdown-text">
                      Assistant not available
                    </li>
                  )}

                {/* Datasource List */}
                {!datasourceLoading &&
                  currentAnalyzer === "datasource" &&
                  getRes?.length > 0 &&
                  getRes
                    ?.filter(
                      (item) => item.ds_config.ds_type !== "semi_structured"
                    )
                    .map((datasource) => (
                      <li
                        key={datasource.id}
                        className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-btn-primary text-dropdown-text bg-dropdown-bg"
                        onClick={() => {
                          handleDatasourceChange(datasource);
                          handleChangeSource(
                            "sql_datasource_run",
                            datasource.id
                          );
                        }}
                      >
                        <div className="flex items-center space-x-2 line-clamp-1">
                          <span className="flex items-center justify-center">
                            {/* DB Icon */}
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 fill-icon-color"
                            >
                              <path
                                d="M8 14C6.32222 14 4.90278 13.7417 3.74167 
                              13.225C2.58056 12.7083 2 12.0778 2 11.3333V4.66667C2 
                              3.93333 2.58611 3.30556 3.75833 2.78333C4.93056 2.26111 
                              6.34444 2 8 2C9.65556 2 11.0694 2.26111 12.2417 
                              2.78333C13.4139 3.30556 14 3.93333 14 4.66667V11.3333C14 
                              12.0778 13.4194 12.7083 12.2583 13.225C11.0972 13.7417 
                              9.67778 14 8 14ZM8 6.01667C8.98889 6.01667 9.98333 
                              5.875 10.9833 5.59167C11.9833 5.30833 12.5444 5.00556 
                              12.6667 4.68333C12.5444 4.36111 11.9861 4.05556 
                              10.9917 3.76667C9.99722 3.47778 9 3.33333 8 
                              3.33333C6.98889 3.33333 5.99722 3.475 5.025 
                              3.75833C4.05278 4.04167 3.48889 4.35 3.33333 
                              4.68333C3.48889 5.01667 4.05278 5.32222 5.025 
                              5.6C5.99722 5.87778 6.98889 6.01667 8 
                              6.01667ZM8 9.33333C8.46667 9.33333 8.91667 
                              9.31111 9.35 9.26667C9.78333 9.22222 10.1972 
                              9.15833 10.5917 9.075C10.9861 8.99167 11.3583 
                              8.88889 11.7083 8.76667C12.0583 8.64444 
                              12.3778 8.50556 12.6667 8.35V6.35C12.3778 
                              6.50556 12.0583 6.64444 11.7083 6.76667C11.3583 
                              6.88889 10.9861 6.99167 10.5917 7.075C10.1972 
                              7.15833 9.78333 7.22222 9.35 7.26667C8.91667 7.31111 
                              8.46667 7.33333 8 7.33333C7.53333 7.33333 7.07778 
                              7.31111 6.63333 7.26667C6.18889 7.22222 5.76944 
                              7.15833 5.375 7.075C4.98056 6.99167 4.61111 
                              6.88889 4.26667 6.76667C3.92222 6.64444 3.61111 
                              6.50556 3.33333 6.35V8.35C3.61111 8.50556 3.92222 
                              8.64444 4.26667 8.76667C4.61111 8.88889 4.98056 
                              8.99167 5.375 9.075C5.76944 9.15833 6.18889 
                              9.22222 6.63333 9.26667C7.07778 9.31111 
                              7.53333 9.33333 8 9.33333ZM8 12.6667C8.51111 
                              12.6667 9.03056 12.6278 9.55833 12.55C10.0861 
                              12.4722 10.5722 12.3694 11.0167 12.2417C11.4611 
                              12.1139 11.8333 11.9694 12.1333 11.8083C12.4333 
                              11.6472 12.6111 11.4833 12.6667 11.3167V9.68333C12.3778 
                              9.83889 12.0583 9.97778 11.7083 10.1C11.3583 10.2222 
                              10.9861 10.325 10.5917 10.4083C10.1972 10.4917 
                              9.78333 10.5556 9.35 10.6C8.91667 10.6444 
                              8.46667 10.6667 8 10.6667C7.53333 10.6667 
                              7.07778 10.6444 6.63333 10.6C6.18889 10.5556 
                              5.76944 10.4917 5.375 10.4083C4.98056 10.325 
                              4.61111 10.2222 4.26667 10.1C3.92222 9.97778 
                              3.61111 9.83889 3.33333 9.68333V11.3333C3.38889 
                              11.5 3.56389 11.6611 3.85833 11.8167C4.15278 
                              11.9722 4.52222 12.1139 4.96667 12.2417C5.41111 
                              12.3694 5.9 12.4722 6.43333 12.55C6.96667 
                              12.6278 7.48889 12.6667 8 12.6667Z"
                              />
                            </svg>
                          </span>
                          <p className="line-clamp-1">{datasource.name}</p>

                          {currentDatasource.id === datasource.id && (
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
                                  d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 7.08L3.45 5.37L2.61 6.21L5.16 
                                  8.76ZM6 12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 
                                  11.2125 2.295 10.785 1.755 10.245C1.215 9.705 
                                  0.7875 9.07 0.4725 8.34C0.1575 7.61 0 6.83 0 
                                  6C0 5.17 0.1575 4.39 0.4725 3.66C0.7875 2.93 
                                  1.215 2.295 1.755 1.755C2.295 1.215 2.93 
                                  0.7875 3.66 0.4725C4.39 0.1575 5.17 0 6 
                                  0C6.83 0 7.61 0.1575 8.34 0.4725C9.07 0.7875 
                                  9.705 1.215 10.245 1.755C10.785 2.295 11.2125 
                                  2.93 11.5275 3.66C11.8425 4.39 12 5.17 
                                  12 6C12 6.83 11.8425 7.61 11.5275 8.34C11.2125 
                                  9.07 10.785 9.705 10.245 10.245C9.705 
                                  10.785 9.07 11.2125 8.34 11.5275C7.61 11.8425 
                                  6.83 12 6 12Z"
                                  fill="#295EF4"
                                />
                              </svg>
                            </span>
                          )}
                        </div>

                        {datasource.ds_config.ds_type === "sql_generator" && (
                          <div className="text-xs flex font-medium items-center justify-center space-x-2 text-[#40AD7D] w-fit">
                            <span>Structured</span>
                          </div>
                        )}
                        {datasource.ds_config.ds_type === "semi_structured" && (
                          <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#A840AD] w-fit">
                            <span>Semi-Structured</span>
                          </div>
                        )}
                        {datasource.ds_config.ds_type === "third_party" && (
                          <div className="text-xs font-medium flex items-center justify-center space-x-2 text-[#AD7A40] w-fit">
                            <span>Third Party</span>
                          </div>
                        )}
                      </li>
                    ))}

                {/* Assistant List */}
                {!isAssistantsLoading &&
                  currentAnalyzer === "assistant" &&
                  getAssistantsRes?.length > 0 &&
                  getAssistantsRes.map((assistant) => (
                    <li
                      key={assistant.id}
                      className="flex items-center justify-between h-8 px-2 py-2 text-xs font-medium border-b cursor-pointer border-dropdown-border hover:bg-btn-primary text-dropdown-text bg-dropdown-bg"
                      onClick={() => {
                        setCurrentDatasource({});
                        setCurrentAssistant(assistant);
                        handleChangeSource(
                          "chatbot_sql_datasource_run",
                          assistant.id
                        );
                        // setAssistantId(assistant.id);
                        setToggleDatasource(false);
                      }}
                    >
                      <div className="flex items-center space-x-2 line-clamp-1">
                        <span className="flex items-center justify-center">
                          {/* Assistant Icon */}
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                          >
                            <path
                              d="M12.3333 6H3.66667C3.29848 6 3 6.29848 3 6.66667V13.3333C3 
                              13.7015 3.29848 14 3.66667 14H12.3333C12.7015 14 
                              13 13.7015 13 13.3333V6.66667C13 6.29848 
                              12.7015 6 12.3333 6Z"
                              className="stroke-icon-color"
                            />
                            <path
                              d="M5.66667 9.33333C6.03486 9.33333 
                              6.33333 9.03486 6.33333 8.66667C6.33333 
                              8.29848 6.03486 8 5.66667 8C5.29848 8 
                              5 8.29848 5 8.66667C5 9.03486 5.29848 
                              9.33333 5.66667 9.33333Z"
                              className="fill-icon-color"
                            />
                            <path
                              d="M10.3327 9.33333C10.7009 9.33333 
                              10.9993 9.03486 10.9993 8.66667C10.9993 
                              8.29848 10.7009 8 10.3327 8C9.96449 
                              8 9.66602 8.29848 9.66602 8.66667C9.66602 
                              9.03486 9.96449 9.33333 10.3327 9.33333Z"
                              className="fill-icon-color"
                            />
                            <path
                              d="M6.66667 10.6667C6.29847 10.6667 
                              6 10.9652 6 11.3334C6 11.7016 6.29847 
                              12.0001 6.66667 12.0001V10.6667ZM9.33333 
                              12.0001C9.70153 12.0001 10 11.7016 10 
                              11.3334C10 10.9652 9.70153 10.6667 
                              9.33333 10.6667V12.0001ZM6.66667 12.0001H9.33333V10.6667H6.66667V12.0001Z"
                              className="fill-icon-color"
                            />
                            <path
                              d="M8 3.33325V5.99992"
                              className="stroke-icon-color"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M1.33398 8.66675V11.3334"
                              className="stroke-icon-color"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14.666 8.66675V11.3334"
                              className="stroke-icon-color"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8.00065 3.33333C8.36884 3.33333 8.66732 
                              3.03486 8.66732 2.66667C8.66732 2.29848 
                              8.36884 2 8.00065 2C7.63246 2 7.33398 
                              2.29848 7.33398 2.66667C7.33398 3.03486 
                              7.63246 3.33333 8.00065 3.33333Z"
                              className="stroke-icon-color"
                            />
                          </svg>
                        </span>
                        <p className="line-clamp-1">{assistant.name}</p>

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
                                d="M5.16 8.76L9.39 4.53L8.55 3.69L5.16 
                                7.08L3.45 5.37L2.61 6.21L5.16 8.76ZM6 
                                12C5.17 12 4.39 11.8425 3.66 11.5275C2.93 
                                11.2125 2.295 10.785 1.755 10.245C1.215 
                                9.705 0.7875 9.07 0.4725 8.34C0.1575 
                                7.61 0 6.83 0 6C0 5.17 0.1575 4.39 
                                0.4725 3.66C0.7875 2.93 1.215 
                                2.295 1.755 1.755C2.295 1.215 
                                2.93 0.7875 3.66 0.4725C4.39 0.1575 
                                5.17 0 6 0C6.83 0 7.61 0.1575 
                                8.34 0.4725C9.07 0.7875 9.705 
                                1.215 10.245 1.755C10.785 2.295 
                                11.2125 2.93 11.5275 3.66C11.8425 
                                4.39 12 5.17 12 6C12 6.83 11.8425 
                                7.61 11.5275 8.34C11.2125 9.07 
                                10.785 9.705 10.245 10.245C9.705 
                                10.785 9.07 11.2125 8.34 11.5275C7.61 
                                11.8425 6.83 12 6 12Z"
                                fill="#295EF4"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-medium tracking-wider text-primary-text">
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 stroke-primary-text group-hover:stroke-primary-text"
              >
                <path d="M15.4167 7.5H4.58333C4.1231 7.5 3.75 7.8731 3.75 8.33333V16.6667C3.75 17.1269 4.1231 17.5 4.58333 17.5H15.4167C15.8769 17.5 16.25 17.1269 16.25 16.6667V8.33333C16.25 7.8731 15.8769 7.5 15.4167 7.5Z" />
                <path
                  d="M7.08333 11.6667C7.54357 11.6667 7.91667 11.2936 7.91667 10.8333C7.91667 10.3731 7.54357 10 7.08333 10C6.6231 10 6.25 10.3731 6.25 10.8333C6.25 11.2936 6.6231 11.6667 7.08333 11.6667Z"
                  fill="white"
                />
                <path
                  d="M12.9163 11.6667C13.3766 11.6667 13.7497 11.2936 13.7497 10.8333C13.7497 10.3731 13.3766 10 12.9163 10C12.4561 10 12.083 10.3731 12.083 10.8333C12.083 11.2936 12.4561 11.6667 12.9163 11.6667Z"
                  fill="white"
                />
                <path
                  d="M8.33333 13.332C7.87308 13.332 7.5 13.7051 7.5 14.1654C7.5 14.6256 7.87308 14.9987 8.33333 14.9987V13.332ZM11.6667 14.9987C12.1269 14.9987 12.5 14.6256 12.5 14.1654C12.5 13.7051 12.1269 13.332 11.6667 13.332V14.9987ZM8.33333 14.9987H11.6667V13.332H8.33333V14.9987Z"
                  fill="white"
                />
                <path
                  d="M10 4.16797V7.5013"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M1.66699 10.832V14.1654"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M18.333 10.832V14.1654"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path d="M10.0003 4.16667C10.4606 4.16667 10.8337 3.79357 10.8337 3.33333C10.8337 2.8731 10.4606 2.5 10.0003 2.5C9.54009 2.5 9.16699 2.8731 9.16699 3.33333C9.16699 3.79357 9.54009 4.16667 10.0003 4.16667Z" />
              </svg>
            </span>

            <span>{assistantRes?.name || ""}</span>
          </div>
        )}

        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
            onClick={handleRestSourceProps}
          >
            <path d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z" />
          </svg>
        </span>
      </div>

      <div className="relative flex flex-col w-full h-full space-y-2">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full h-full px-4 space-y-2">
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
              >
                <path
                  d="M18.667 25.668C19.3281 25.668 19.8823 25.4444 20.3295 24.9971C20.7767 24.5499 21.0003 23.9957 21.0003 23.3346C21.0003 22.6735 20.7767 22.1194 20.3295 21.6721C19.8823 21.2249 19.3281 21.0013 18.667 21.0013C18.0059 21.0013 17.4517 21.2249 17.0045 21.6721C16.5573 22.1194 16.3337 22.6735 16.3337 23.3346C16.3337 23.9957 16.5573 24.5499 17.0045 24.9971C17.4517 25.4444 18.0059 25.668 18.667 25.668ZM28.0003 25.668C28.6614 25.668 29.2156 25.4444 29.6628 24.9971C30.1101 24.5499 30.3337 23.9957 30.3337 23.3346C30.3337 22.6735 30.1101 22.1194 29.6628 21.6721C29.2156 21.2249 28.6614 21.0013 28.0003 21.0013C27.3392 21.0013 26.7851 21.2249 26.3378 21.6721C25.8906 22.1194 25.667 22.6735 25.667 23.3346C25.667 23.9957 25.8906 24.5499 26.3378 24.9971C26.7851 25.4444 27.3392 25.668 28.0003 25.668ZM37.3337 25.668C37.9948 25.668 38.5489 25.4444 38.9962 24.9971C39.4434 24.5499 39.667 23.9957 39.667 23.3346C39.667 22.6735 39.4434 22.1194 38.9962 21.6721C38.5489 21.2249 37.9948 21.0013 37.3337 21.0013C36.6726 21.0013 36.1184 21.2249 35.6712 21.6721C35.2239 22.1194 35.0003 22.6735 35.0003 23.3346C35.0003 23.9957 35.2239 24.5499 35.6712 24.9971C36.1184 25.4444 36.6726 25.668 37.3337 25.668ZM4.66699 51.3346V9.33464C4.66699 8.0513 5.12394 6.95269 6.03783 6.0388C6.95171 5.12491 8.05033 4.66797 9.33366 4.66797H46.667C47.9503 4.66797 49.0489 5.12491 49.9628 6.0388C50.8767 6.95269 51.3337 8.0513 51.3337 9.33464V37.3346C51.3337 38.618 50.8767 39.7166 49.9628 40.6305C49.0489 41.5444 47.9503 42.0013 46.667 42.0013H14.0003L4.66699 51.3346ZM12.017 37.3346H46.667V9.33464H9.33366V39.9596L12.017 37.3346Z"
                  fill="#5F6368"
                />
              </svg>
            </span>

            <p className="text-sm font-medium tracking-wider text-center text-primary-text">
              {assistantRes?.name}
            </p>

            <p className="text-xs font-normal tracking-wider text-center text-secondary-text">
              {assistantRes?.about}
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div
            ref={scrollRef}
            className="w-full h-full px-2 pb-10 space-y-2 overflow-y-auto recent__bar scroll-smooth"
          >
            {history?.length === 10 && hasMoreHistory ? (
              <div className="flex items-center justify-center w-full py-2">
                <button
                  className="flex items-center justify-center w-full h-7 px-3 space-x-1.5 text-xs font-semibold tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                  onClick={loadMoreHistory}
                >
                  {chatThreadLoading && (
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

                      <span className="sr-only">Loading...</span>
                    </div>
                  )}

                  <span>Load More</span>
                </button>
              </div>
            ) : (
              <p className="py-4 text-xs font-normal text-center text-secondary-text">
                You have seen it all!
              </p>
            )}

            {history
              .slice()
              .reverse()
              ?.map(
                (
                  {
                    messageId,
                    name,
                    value,
                    data,
                    feebacks,
                    created_by,
                    error_message,
                    response_status,
                  },
                  index
                ) => {
                  if (name === "user") {
                    return (
                      <div key={index}>
                        <div className="mx-auto mt-5">
                          <div className="flex flex-col justify-end px-4 space-y-2 lg:pr-0 lg:pl-0 xsm:space-y-0 xsm:space-x-2 xsm:flex-row">
                            <div className="relative flex items-center max-w-[80%] px-4 min-h-8 text-xs font-normal text-black rounded-md bg-white">
                              <p>{value}</p>
                            </div>

                            <div>
                              <div className="flex items-center justify-center w-8 rounded-full bg-secondary aspect-square">
                                <svg
                                  width="32"
                                  height="32"
                                  viewBox="0 0 32 32"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width="31"
                                    height="31"
                                    rx="15.5"
                                    fill="#F6F6F6"
                                    stroke="#202020"
                                  />
                                  <path
                                    d="M15.9992 14.3998C17.5456 14.3998 18.7992 13.1462 18.7992 11.5998C18.7992 10.0534 17.5456 8.7998 15.9992 8.7998C14.4528 8.7998 13.1992 10.0534 13.1992 11.5998C13.1992 13.1462 14.4528 14.3998 15.9992 14.3998Z"
                                    fill="#09090B"
                                    stroke="#09090B"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    d="M8.79688 22.7201V23.2001H23.1969V22.7201C23.1969 20.9279 23.1969 20.0319 22.8481 19.3473C22.5413 18.7452 22.0518 18.2557 21.4496 17.9489C20.7651 17.6001 19.869 17.6001 18.0769 17.6001H13.9169C12.1247 17.6001 11.2286 17.6001 10.5441 17.9489C9.94199 18.2557 9.45245 18.7452 9.14566 19.3473C8.79688 20.0319 8.79688 20.9279 8.79688 22.7201Z"
                                    fill="#09090B"
                                    stroke="#09090B"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (name === "bot") {
                    return (
                      <div className="w-[97%] bg-page" key={index}>
                        <div className="flex flex-col w-full mx-auto space-y-2">
                          <div className="flex items-start w-full max-w-full space-x-2">
                            <div className="flex items-center justify-center w-8 rounded-full bg-secondary-bg aspect-square">
                              <svg
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 fill-white"
                              >
                                <path
                                  d="M15.4167 7.5H4.58333C4.1231 7.5 3.75 7.8731 3.75 8.33333V16.6667C3.75 17.1269 4.1231 17.5 4.58333 17.5H15.4167C15.8769 17.5 16.25 17.1269 16.25 16.6667V8.33333C16.25 7.8731 15.8769 7.5 15.4167 7.5Z"
                                  fill="#ffffff"
                                  stroke="#ffffff"
                                  stroke-width="2"
                                />
                                <path
                                  d="M7.08333 11.6667C7.54357 11.6667 7.91667 11.2936 7.91667 10.8333C7.91667 10.3731 7.54357 10 7.08333 10C6.6231 10 6.25 10.3731 6.25 10.8333C6.25 11.2936 6.6231 11.6667 7.08333 11.6667Z"
                                  fill="#09090b"
                                />
                                <path
                                  d="M12.9193 11.6667C13.3795 11.6667 13.7526 11.2936 13.7526 10.8333C13.7526 10.3731 13.3795 10 12.9193 10C12.459 10 12.0859 10.3731 12.0859 10.8333C12.0859 11.2936 12.459 11.6667 12.9193 11.6667Z"
                                  fill="#09090b"
                                />
                                <path
                                  d="M8.33333 13.333C7.87308 13.333 7.5 13.7061 7.5 14.1663C7.5 14.6266 7.87308 14.9997 8.33333 14.9997V13.333ZM11.6667 14.9997C12.1269 14.9997 12.5 14.6266 12.5 14.1663C12.5 13.7061 12.1269 13.333 11.6667 13.333V14.9997ZM8.33333 14.9997H11.6667V13.333H8.33333V14.9997Z"
                                  fill="#09090b"
                                />
                                <path
                                  d="M10 4.16699V7.50033"
                                  stroke="#ffffff"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M1.66406 10.833V14.1663"
                                  stroke="#ffffff"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M18.3359 10.833V14.1663"
                                  stroke="#ffffff"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M9.9974 4.16667C10.4576 4.16667 10.8307 3.79357 10.8307 3.33333C10.8307 2.8731 10.4576 2.5 9.9974 2.5C9.53716 2.5 9.16406 2.8731 9.16406 3.33333C9.16406 3.79357 9.53716 4.16667 9.9974 4.16667Z"
                                  stroke="#ffffff"
                                  stroke-width="2"
                                />
                              </svg>
                            </div>

                            <div className="flex flex-col w-full space-y-2">
                              <NotebookChatEvents
                                events={data}
                                showAddDashboard={true}
                                showReaction={true}
                                messageId={messageId}
                                handleTextAccept={handleTextAccept}
                                handleAssistantAccept={handleAssistantAccept}
                                assistantName={assistantRes?.name || ""}
                                onRenderComplete={handleRenderComplete}
                              />

                              {error_message && (
                                <div className="flex flex-col w-full max-w-2xl px-3 py-2 space-y-2 rounded-md bg-input-error-bg">
                                  <div className="flex items-center w-full space-x-2">
                                    <span className="flex items-center justify-center">
                                      <svg
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                      >
                                        <circle
                                          cx="7.9974"
                                          cy="8.00033"
                                          r="5.33333"
                                          fill="#F6F6F6"
                                        />
                                        <path
                                          d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                                          fill="#C61B1B"
                                        />
                                      </svg>
                                    </span>

                                    <span className="text-xs font-medium text-input-error-text">
                                      Failed to generate model response.
                                    </span>
                                  </div>

                                  <div
                                    className={`text-xs font-normal leading-5 text-primary-text ${
                                      theme === "dark"
                                        ? "text-primary-text"
                                        : "text-[#414551]"
                                    }`}
                                  >
                                    {error_message}
                                  </div>
                                </div>
                              )}

                              {response_status === "stopped" && (
                                <div className="flex flex-col w-full max-w-2xl px-3 py-2 space-y-2 rounded-md bg-[#36270C]">
                                  <div className="flex items-center w-full space-x-2">
                                    <span className="flex items-center justify-center">
                                      <svg
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                      >
                                        <circle
                                          cx="7.9974"
                                          cy="8.00033"
                                          r="5.33333"
                                          fill="#F6F6F6"
                                        />
                                        <path
                                          d="M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z"
                                          fill="#C61B1B"
                                        />
                                      </svg>
                                    </span>

                                    <span className="text-xs font-medium text-[#A38448]">
                                      Message stopped by the user.
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex ml-10">
                            <UserFeedback
                              messageId={messageId}
                              feebacks={feebacks}
                              createdby={created_by}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
              )}

            <div className="bg-page">
              {isLoading && (
                <div className="flex items-start w-full max-w-full space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-page-hover aspect-square">
                    <svg
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 fill-white"
                    >
                      <path
                        d="M15.4167 7.5H4.58333C4.1231 7.5 3.75 7.8731 3.75 8.33333V16.6667C3.75 17.1269 4.1231 17.5 4.58333 17.5H15.4167C15.8769 17.5 16.25 17.1269 16.25 16.6667V8.33333C16.25 7.8731 15.8769 7.5 15.4167 7.5Z"
                        fill="#ffffff"
                        stroke="#ffffff"
                        stroke-width="2"
                      />
                      <path
                        d="M7.08333 11.6667C7.54357 11.6667 7.91667 11.2936 7.91667 10.8333C7.91667 10.3731 7.54357 10 7.08333 10C6.6231 10 6.25 10.3731 6.25 10.8333C6.25 11.2936 6.6231 11.6667 7.08333 11.6667Z"
                        fill="#09090b"
                      />
                      <path
                        d="M12.9193 11.6667C13.3795 11.6667 13.7526 11.2936 13.7526 10.8333C13.7526 10.3731 13.3795 10 12.9193 10C12.459 10 12.0859 10.3731 12.0859 10.8333C12.0859 11.2936 12.459 11.6667 12.9193 11.6667Z"
                        fill="#09090b"
                      />
                      <path
                        d="M8.33333 13.333C7.87308 13.333 7.5 13.7061 7.5 14.1663C7.5 14.6266 7.87308 14.9997 8.33333 14.9997V13.333ZM11.6667 14.9997C12.1269 14.9997 12.5 14.6266 12.5 14.1663C12.5 13.7061 12.1269 13.333 11.6667 13.333V14.9997ZM8.33333 14.9997H11.6667V13.333H8.33333V14.9997Z"
                        fill="#09090b"
                      />
                      <path
                        d="M10 4.16699V7.50033"
                        stroke="#ffffff"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1.66406 10.833V14.1663"
                        stroke="#ffffff"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M18.3359 10.833V14.1663"
                        stroke="#ffffff"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M9.9974 4.16667C10.4576 4.16667 10.8307 3.79357 10.8307 3.33333C10.8307 2.8731 10.4576 2.5 9.9974 2.5C9.53716 2.5 9.16406 2.8731 9.16406 3.33333C9.16406 3.79357 9.53716 4.16667 9.9974 4.16667Z"
                        stroke="#ffffff"
                        stroke-width="2"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col w-full space-y-2">
                    {skeletonLoader && (
                      <div className="w-full py-1 mt-1">
                        <AnimatedText text="Thinking..." />
                      </div>
                    )}

                    {!skeletonLoader && events?.length > 0 ? (
                      <div className="flex flex-col">
                        <div
                          className="flex items-center justify-between py-1 mt-1 space-x-2 cursor-pointer group w-fit"
                          onClick={() => setToggleThought(!toggleThought)}
                        >
                          <div className="w-full">
                            {skeletonLoader || (
                              <AnimatedText
                                text={`${
                                  isStopping ? "Stopping..." : currentNextEvent
                                }`}
                              />
                            )}
                          </div>

                          <span className="flex items-center justify-center pt-0.5">
                            {toggleThought || (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 256 256"
                                className="w-4 h-4 fill-icon-color group-hover:fill-icon-color-hover"
                              >
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                              </svg>
                            )}

                            {toggleThought && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 256 256"
                                className="w-4 h-4 fill-icon-color-hover"
                              >
                                <path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"></path>
                              </svg>
                            )}
                          </span>
                        </div>

                        {toggleThought && (
                          <div className="flex flex-col py-2 pl-4 space-y-2 border-l-2 border-border-color">
                            {events?.map((item, index) => {
                              if (
                                item.event_type === "tool_exec_request" &&
                                item.tool_call_data.tool_call_type === "SQL"
                              ) {
                                return (
                                  <div
                                    className="flex flex-col space-y-3"
                                    key={index}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center space-x-1 text-sm font-medium text-primary-text">
                                        <span>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            className="w-4 h-4 fill-icon-color-hover"
                                          >
                                            <path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64Zm-21.61,74.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"></path>
                                          </svg>
                                        </span>

                                        <p>
                                          {removeHyphens(
                                            item.tool_routing.register_as
                                          )}
                                        </p>
                                      </div>

                                      <div className="relative group">
                                        <span className="flex items-center justify-center cursor-pointer">
                                          <svg
                                            viewBox="0 0 14 15"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4 fill-icon-color hover:fill-icon-color-hover"
                                          >
                                            <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
                                          </svg>
                                        </span>

                                        <div className="absolute z-[1000] hidden w-full p-2 text-xs font-medium tracking-wider border rounded-md border-border-color bg-page text-secondary-text group-hover:block top-6 left-2 min-w-96 max-w-96 shadow-md">
                                          {item.tool_routing.description}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col pl-2 space-y-1">
                                      <p className="text-xs font-medium text-primary-text">
                                        {item.tool_call_data.query}
                                      </p>
                                    </div>
                                  </div>
                                );
                              }

                              if (
                                item.event_type === "tool_exec_request" &&
                                item.tool_call_data.tool_call_type ===
                                  "SEMI_STRUCTURED"
                              ) {
                                return (
                                  <div
                                    className="flex flex-col w-full"
                                    key={index}
                                  >
                                    <div className="flex flex-col space-y-3">
                                      <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1 text-sm font-medium tracking-wide">
                                          <span>
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              viewBox="0 0 256 256"
                                              className="w-4 h-4 fill-icon-color-hover"
                                            >
                                              <path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64Zm-21.61,74.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"></path>
                                            </svg>
                                          </span>

                                          <span className="text-sm font-semibold text-primary-text">
                                            {item?.tool_routing?.register_as}
                                          </span>
                                        </div>

                                        <div className="relative group">
                                          <span className="flex items-center justify-center cursor-pointer">
                                            <svg
                                              viewBox="0 0 14 15"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="w-4 h-4 fill-icon-color hover:fill-icon-color-hover"
                                            >
                                              <path d="M6.33398 10.8334H7.66732V6.83337H6.33398V10.8334ZM7.00065 5.50004C7.18954 5.50004 7.34787 5.43615 7.47565 5.30837C7.60343 5.1806 7.66732 5.02226 7.66732 4.83337C7.66732 4.64448 7.60343 4.48615 7.47565 4.35837C7.34787 4.2306 7.18954 4.16671 7.00065 4.16671C6.81176 4.16671 6.65343 4.2306 6.52565 4.35837C6.39787 4.48615 6.33398 4.64448 6.33398 4.83337C6.33398 5.02226 6.39787 5.1806 6.52565 5.30837C6.65343 5.43615 6.81176 5.50004 7.00065 5.50004ZM7.00065 14.1667C6.07843 14.1667 5.21176 13.9917 4.40065 13.6417C3.58954 13.2917 2.88398 12.8167 2.28398 12.2167C1.68398 11.6167 1.20898 10.9112 0.858984 10.1C0.508984 9.28893 0.333984 8.42226 0.333984 7.50004C0.333984 6.57782 0.508984 5.71115 0.858984 4.90004C1.20898 4.08893 1.68398 3.38337 2.28398 2.78337C2.88398 2.18337 3.58954 1.70837 4.40065 1.35837C5.21176 1.00837 6.07843 0.833374 7.00065 0.833374C7.92287 0.833374 8.78954 1.00837 9.60065 1.35837C10.4118 1.70837 11.1173 2.18337 11.7173 2.78337C12.3173 3.38337 12.7923 4.08893 13.1423 4.90004C13.4923 5.71115 13.6673 6.57782 13.6673 7.50004C13.6673 8.42226 13.4923 9.28893 13.1423 10.1C12.7923 10.9112 12.3173 11.6167 11.7173 12.2167C11.1173 12.8167 10.4118 13.2917 9.60065 13.6417C8.78954 13.9917 7.92287 14.1667 7.00065 14.1667ZM7.00065 12.8334C8.48954 12.8334 9.75065 12.3167 10.784 11.2834C11.8173 10.25 12.334 8.98893 12.334 7.50004C12.334 6.01115 11.8173 4.75004 10.784 3.71671C9.75065 2.68337 8.48954 2.16671 7.00065 2.16671C5.51176 2.16671 4.25065 2.68337 3.21732 3.71671C2.18398 4.75004 1.66732 6.01115 1.66732 7.50004C1.66732 8.98893 2.18398 10.25 3.21732 11.2834C4.25065 12.3167 5.51176 12.8334 7.00065 12.8334Z" />
                                            </svg>
                                          </span>

                                          <div className="absolute z-[1000] hidden w-full p-2 text-xs font-medium tracking-wider border rounded-md border-border-color bg-page text-secondary-text group-hover:block top-6 left-2 min-w-96 max-w-96 shadow-md">
                                            {item.tool_routing.description}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col pl-2 space-y-2">
                                        {/* <p className="text-xs font-medium text-secondary-text">
                                        Used following filters:
                                      </p> */}

                                        {item?.tool_call_data.filter_rules && (
                                          <div className="flex items-center space-x-2">
                                            {Object.keys(
                                              item?.tool_call_data.filter_rules
                                            ).map((field_id, index) => {
                                              let filters = [];
                                              for (const filter_type of Object.keys(
                                                item?.tool_call_data
                                                  .filter_rules[field_id]
                                              )) {
                                                const value =
                                                  item?.tool_call_data
                                                    .filter_rules[field_id][
                                                    filter_type
                                                  ];

                                                if (
                                                  item?.tool_call_data
                                                    .column_type_map[
                                                    field_id
                                                  ] == "str"
                                                ) {
                                                  if (Array.isArray(value)) {
                                                    for (let filter_value of value) {
                                                      filters.push(
                                                        <button
                                                          type="button"
                                                          className="flex items-center justify-between px-2 py-1 text-xs font-normal rounded-md cursor-auto text-primary-text bg-primary"
                                                          disabled={true}
                                                          index={`${index}-${filter_type}`}
                                                        >
                                                          {
                                                            item?.tool_call_data
                                                              .column_name_map[
                                                              field_id
                                                            ]
                                                          }

                                                          {filter_type ==
                                                            "contains_list" &&
                                                            " ≈ "}
                                                          {filter_type ==
                                                            "not_contains_list" &&
                                                            " ≉ "}

                                                          {filter_value}
                                                        </button>
                                                      );
                                                    }
                                                  } else if (
                                                    typeof value == "string"
                                                  ) {
                                                    filters.push(
                                                      <button
                                                        type="button"
                                                        className="flex items-center justify-between px-2 py-1 text-xs font-normal rounded-md cursor-auto text-primary-text bg-primary"
                                                        disabled={true}
                                                        index={`${index}-${filter_type}`}
                                                      >
                                                        {
                                                          item?.tool_call_data
                                                            .column_name_map[
                                                            field_id
                                                          ]
                                                        }

                                                        {filter_type ==
                                                          "contains_list" &&
                                                          " ≈ "}
                                                        {filter_type ==
                                                          "not_contains_list" &&
                                                          " ≉ "}
                                                        {filter_type == "eq" &&
                                                          " = "}

                                                        {value}
                                                      </button>
                                                    );
                                                  }
                                                }

                                                if (
                                                  item?.tool_call_data
                                                    .column_type_map[
                                                    field_id
                                                  ] == "number"
                                                ) {
                                                  filters.push(
                                                    <button
                                                      type="button"
                                                      className="flex items-center justify-between px-2 py-1 text-xs font-normal rounded-md cursor-auto text-primary-text bg-primary"
                                                      disabled={true}
                                                      index={`${index}-${filter_type}`}
                                                    >
                                                      {
                                                        item?.tool_call_data
                                                          .column_name_map[
                                                          field_id
                                                        ]
                                                      }

                                                      {filter_type == "gt" &&
                                                        " > "}
                                                      {filter_type == "gte" &&
                                                        " >= "}
                                                      {filter_type == "lt" &&
                                                        " < "}
                                                      {filter_type == "lte" &&
                                                        " <= "}
                                                      {filter_type == "eq" &&
                                                        " = "}

                                                      {value}
                                                    </button>
                                                  );
                                                }
                                              }
                                              return filters;
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              if (
                                item.event_type ===
                                "sql_datasource_sql_generate"
                              ) {
                                return (
                                  <pre className="pl-2 mt-2 text-xs font-medium text-wrap font-roboto text-primary-text">
                                    {item.steps_to_follow}
                                  </pre>
                                );
                              }

                              if (item.event_type === "tool_exec_response") {
                                return <div className="w-full py-2"></div>;
                              }
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full">
                        {skeletonLoader || (
                          <AnimatedText text={`${currentNextEvent}`} />
                        )}
                      </div>
                    )}

                    {skeletonLoader ||
                      (events.length > 0 && (
                        <div className="w-[97%]">
                          <div className="w-full">
                            <NotebookChatEvents
                              events={events}
                              assistantName={assistantRes?.name || ""}
                              isLoadingActive={true}
                              streaming={true}
                              onRenderComplete={handleRenderComplete}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* <div ref={scrollRef}></div> */}
          </div>
        )}

        <div className="sticky bottom-0 left-0 flex items-center justify-center w-full px-6 pb-2 bg-page">
          <div className="relative flex items-center w-full py-3 overflow-y-auto rounded-md recent__bar bg-input-bg">
            <textarea
              ref={textAreaRef}
              className="w-full pl-4 pr-16 m-0 text-sm font-normal outline-none resize-none bg-input-bg text-primary-text placeholder:text-input-placeholder placeholder:font-normal"
              placeholder={
                isLoading
                  ? "Agent is thinking..."
                  : "Ask anything to your assistant here..."
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                setPrompt(inputValue);

                if (inputValue.trim()) {
                  setIsInputDisabled(false);
                } else {
                  setIsInputDisabled(true);
                }
              }}
              onKeyDown={handleKeyDown}
              value={prompt}
              readOnly={isLoading}
              tabIndex={0}
              style={{
                height: "24px",
                maxHeight: "200px",
              }}
            />

            <span></span>

            {isLoading || (
              <span
                className={`absolute flex items-center cursor-pointer justify-center bottom-1.5 right-2`}
                onClick={() => handleSendMessage(prompt)}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="14"
                    fill={
                      !isInputDisabled
                        ? "#295EF4"
                        : theme === "dark"
                        ? "#111E45"
                        : "#C9D7FC"
                    }
                  />
                  <path
                    d="M13.125 21V10.3469L8.225 15.2469L7 14L14 7L21 14L19.775 15.2469L14.875 10.3469V21H13.125Z"
                    fill={
                      !isInputDisabled
                        ? "#F6F6F6"
                        : theme === "dark"
                        ? "#444446"
                        : "#F1F5FF"
                    }
                  />
                </svg>
              </span>
            )}

            {isLoading && (
              <button
                type="button"
                className="absolute flex items-center justify-center -translate-y-1/2 cursor-pointer bottom-1/2 top-1/2 right-2"
                onClick={handleStopChat}
                disabled={isStopping}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="w-6 h-6 fill-text-primary-text"
                >
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM112,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssistantChatBot;

// const UserFeedback = ({ messageId }) => {
//   const [reaction, setReaction] = useState(0);
//   const [showFeedback, setShowFeedBack] = useState(false);

//   const [userFeedback, {}] = useUserFeedbackMutation();

//   const handleReaction = (data) => {
//     setReaction(data);
//     setShowFeedBack(true);
//   };

//   const handleFeedbackSubmit = (feedback) => {
//     const data = {
//       reaction: reaction,
//       feedback: feedback,
//     };

//     try {
//       userFeedback({
//         message_id: messageId,
//         payload: data,
//       }).then((response) => {
//         if (response) {
//           setShowFeedBack(false);
//         }
//       });
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setShowFeedBack(false);
//     }
//   };

//   return (
//     <>
//       <div className="flex items-center justify-end space-x-4">
//         <span className="flex items-center justify-center">
//           <svg
//             viewBox="0 0 15 14"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//             className="w-4 h-4 border-none outline-none cursor-pointer fill-[#5F6368] hover:fill-white"
//             data-tooltip-id="tooltip"
//             data-tooltip-content="Like"
//             onClick={() => handleReaction(1)}
//           >
//             <path d="M10.9999 14.0003H3.66659V5.33366L8.33325 0.666992L9.16659 1.50033C9.24436 1.5781 9.30825 1.68366 9.35825 1.81699C9.40825 1.95033 9.43325 2.0781 9.43325 2.20033V2.43366L8.69992 5.33366H12.9999C13.3555 5.33366 13.6666 5.46699 13.9333 5.73366C14.1999 6.00033 14.3333 6.31144 14.3333 6.66699V8.00033C14.3333 8.0781 14.3221 8.16144 14.2999 8.25033C14.2777 8.33921 14.2555 8.42255 14.2333 8.50033L12.2333 13.2003C12.1333 13.4225 11.9666 13.6114 11.7333 13.767C11.4999 13.9225 11.2555 14.0003 10.9999 14.0003ZM4.99992 12.667H10.9999L12.9999 8.00033V6.66699H6.99992L7.89992 3.00033L4.99992 5.90033V12.667ZM3.66659 5.33366V6.66699H1.66659V12.667H3.66659V14.0003H0.333252V5.33366H3.66659Z" />
//           </svg>
//         </span>

//         <span className="flex items-center justify-center">
//           <svg
//             viewBox="0 0 15 14"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//             className="w-4 h-4 border-none outline-none cursor-pointer fill-[#5F6368] hover:fill-white"
//             data-tooltip-id="tooltip"
//             data-tooltip-content="Dislike"
//             onClick={() => handleReaction(0)}
//           >
//             <path d="M4.00008 0H11.3334V8.66667L6.66675 13.3333L5.83342 12.5C5.75564 12.4222 5.69175 12.3167 5.64175 12.1833C5.59175 12.05 5.56675 11.9222 5.56675 11.8V11.5667L6.30008 8.66667H2.00008C1.64453 8.66667 1.33341 8.53333 1.06675 8.26667C0.800081 8 0.666748 7.68889 0.666748 7.33333V6C0.666748 5.92222 0.677859 5.83889 0.700081 5.75C0.722304 5.66111 0.744526 5.57778 0.766748 5.5L2.76675 0.8C2.86675 0.577778 3.03341 0.388889 3.26675 0.233333C3.50008 0.0777778 3.74453 0 4.00008 0ZM10.0001 1.33333H4.00008L2.00008 6V7.33333H8.00008L7.10008 11L10.0001 8.1V1.33333ZM11.3334 8.66667V7.33333H13.3334V1.33333H11.3334V0H14.6667V8.66667H11.3334Z" />
//           </svg>
//         </span>
//       </div>

//       {showFeedback && (
//         <FeedbackModal
//           showFeedback={showFeedback}
//           setShowFeedBack={setShowFeedBack}
//           handleFeedbackSubmit={handleFeedbackSubmit}
//         />
//       )}
//     </>
//   );
// };

const UserFeedback = ({ messageId, feebacks, createdby }) => {
  const [reaction, setReaction] = useState(0);
  const [showFeedback, setShowFeedBack] = useState(false);
  const [storeReaction, setStoreReaction] = useState(null);
  const [storeFeedback, setStoreFeedback] = useState(null);
  const [activeIcon, setActiveIcon] = useState(null);
  const filterCreated = feebacks[createdby];

  useEffect(() => {
    const reactionValue = storeReaction ?? filterCreated?.reaction ?? null;
    setActiveIcon(reactionValue);
  }, [storeReaction, filterCreated?.reaction]);

  const [userFeedback] = useUserFeedbackMutation();

  const handleReaction = (reactionValue) => {
    setReaction(reactionValue);
    setShowFeedBack(true);
  };

  const handleFeedbackSubmit = async (feedback) => {
    const feedbackData = {
      reaction,
      feedback,
    };

    try {
      const response = await userFeedback({
        message_id: messageId,
        payload: feedbackData,
      });
      if (response) {
        setStoreReaction(feedbackData.reaction);
        setActiveIcon(feedbackData.reaction);
        setStoreFeedback(feedbackData.feedback);
        setShowFeedBack(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setShowFeedBack(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end space-x-4">
        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 15 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 border-none outline-none cursor-pointer ${
              activeIcon === 1
                ? "fill-active-icon hover:fill-icon-color-hover"
                : "fill-icon-color hover:fill-icon-color-hover"
            }`}
            data-tooltip-id="tooltip"
            data-tooltip-content="Like"
            onClick={() => handleReaction(1)}
          >
            <path d="M10.9999 14.0003H3.66659V5.33366L8.33325 0.666992L9.16659 1.50033C9.24436 1.5781 9.30825 1.68366 9.35825 1.81699C9.40825 1.95033 9.43325 2.0781 9.43325 2.20033V2.43366L8.69992 5.33366H12.9999C13.3555 5.33366 13.6666 5.46699 13.9333 5.73366C14.1999 6.00033 14.3333 6.31144 14.3333 6.66699V8.00033C14.3333 8.0781 14.3221 8.16144 14.2999 8.25033C14.2777 8.33921 14.2555 8.42255 14.2333 8.50033L12.2333 13.2003C12.1333 13.4225 11.9666 13.6114 11.7333 13.767C11.4999 13.9225 11.2555 14.0003 10.9999 14.0003ZM4.99992 12.667H10.9999L12.9999 8.00033V6.66699H6.99992L7.89992 3.00033L4.99992 5.90033V12.667ZM3.66659 5.33366V6.66699H1.66659V12.667H3.66659V14.0003H0.333252V5.33366H3.66659Z" />
          </svg>
        </span>

        <span className="flex items-center justify-center mt-1">
          <svg
            viewBox="0 0 15 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 border-none outline-none cursor-pointer ${
              activeIcon === 0
                ? "fill-active-icon hover:fill-icon-color-hover"
                : "fill-icon-color hover:fill-icon-color-hover"
            }`}
            data-tooltip-id="tooltip"
            data-tooltip-content="Dislike"
            onClick={() => handleReaction(0)}
          >
            <path d="M4.00008 0H11.3334V8.66667L6.66675 13.3333L5.83342 12.5C5.75564 12.4222 5.69175 12.3167 5.64175 12.1833C5.59175 12.05 5.56675 11.9222 5.56675 11.8V11.5667L6.30008 8.66667H2.00008C1.64453 8.66667 1.33341 8.53333 1.06675 8.26667C0.800081 8 0.666748 7.68889 0.666748 7.33333V6C0.666748 5.92222 0.677859 5.83889 0.700081 5.75C0.722304 5.66111 0.744526 5.57778 0.766748 5.5L2.76675 0.8C2.86675 0.577778 3.03341 0.388889 3.26675 0.233333C3.50008 0.0777778 3.74453 0 4.00008 0ZM10.0001 1.33333H4.00008L2.00008 6V7.33333H8.00008L7.10008 11L10.0001 8.1V1.33333ZM11.3334 8.66667V7.33333H13.3334V1.33333H11.3334V0H14.6667V8.66667H11.3334Z" />
          </svg>
        </span>
      </div>

      {showFeedback && (
        <FeedbackModal
          showFeedback={showFeedback}
          setShowFeedBack={setShowFeedBack}
          handleFeedbackSubmit={handleFeedbackSubmit}
          data={filterCreated}
          clickedReaction={reaction}
          setStoreFeedback={setStoreFeedback}
          storeFeedback={storeFeedback}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
