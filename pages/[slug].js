import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useTheme } from "@/hooks/useTheme";
import ChatEvents from "@/components/common/ChatEvents";
import { createSSEWithPost } from "@/utils/sse";
import useAutoResizeTextArea from "@/hooks/useAutoResizeTextArea";
import { Buffer } from "buffer";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import Link from "next/link";

async function createChatViaApiRoute(assistantId) {
  try {
    const response = await fetch("/api/createChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistant_id: assistantId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("createChatViaApiRoute error:", error);
    return null;
  }
}

const ChatSlug = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [skeletonLoader, setSkeletonLoader] = useState(false);
  const [history, setHistory] = useState([]);
  const [createdChatId, setCreatedChatId] = useState(null);
  const [messageId, setMessageId] = useState(null);
  const [showLoadingCard, setShowLoadingCard] = useState(false);
  const [currentNextEvent, setCurrentNextEvent] = useState("");
  const [slug, setSlug] = useState(null);
  const router = useRouter();

  const [assistantName, setAssistantName] = useState("");
  const [currentAssistant, setCurrentAssistant] = useState("");
  const [isInputDisabled, setIsInputDisabled] = useState(true);
  const [toggleThought, setToggleThought] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [events, setEvents] = useState([]);

  const scrollRef = useRef();
  const { theme } = useTheme();
  const textAreaRef = useAutoResizeTextArea();
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [prompt, textAreaRef]);

  useEffect(() => {
    const assistant_id = router.query.slug;

    if (assistant_id) {
      setSlug(assistant_id);
    }
  }, [router]);

  useEffect(() => {
    const assistant_id = router.query.slug;

    if (assistant_id) {
      setSlug(assistant_id);
    }
  }, [router]);

  async function fetchMessage(message_id) {
    try {
      const response = await fetch("/api/getMessageById", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: message_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        setIsStopping(false);
        const responseInfo = data;

        if (responseInfo.error_message) {
          const queryData = {
            messageId: responseInfo._id || "",
            name: "error",
            value: "",
            data: responseInfo.error_message,
          };

          setHistory((prev) => [...prev, queryData]);
          setMessageId(null);
        } else {
          const myEvents = Object.values(
            responseInfo?.response_events || {}
          ).map((event) => ({
            ...event,
            messageId: responseInfo._id,
          }));

          const queryData = {
            messageId: responseInfo._id || "",
            name: "bot",
            value: "",
            data: myEvents,
          };

          setHistory((prev) => [...prev, queryData]);
          setMessageId(null);
        }
      }

      setShowLoadingCard(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching message:", error);
      setShowLoadingCard(false);
      setIsLoading(false);
      return null;
    }
  }

  const fetchData = async (userQuery, createdId) => {
    // 1) UI updates: user just asked a question
    scrollToBottom();
    setSkeletonLoader(true);
    setIsLoading(true); // if you want a global "Loading..." state

    // 2) Add user’s message to the chat history
    const userMessage = {
      messageId: "",
      name: "user",
      value: userQuery,
      data: {},
    };
    setHistory((prev) => [...prev, userMessage]);

    try {
      // 3) Build your request body (adjust as needed)
      const payload = {
        assistant_id: slug,
        chat_id: createdId,
        user_query: userQuery,
      };

      // Suppose your Next.js route is /api/run
      const apiUrl = `/api/run`;

      // 4) Initiate SSE
      const sse = await createSSEWithPost(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Clear the prompt input now that it's sent
      setPrompt("");

      let message_id;

      // 5) Listen for SSE "message" events
      sse.addEventListener("message", (e) => {
        // The server may send multiple base64-encoded JSON strings separated by "\n\n"
        const events = e.data.split("\n\n");

        for (let index = 0; index < events.length; index++) {
          const base64Chunk = events[index].trim();
          // Skip empty lines (avoids parsing an empty string)
          if (!base64Chunk) {
            continue;
          }

          try {
            // Decode from base64 -> string -> parse JSON
            const decodedString = Buffer.from(base64Chunk, "base64").toString(
              "utf-8"
            );
            const event = JSON.parse(decodedString);

            setEvents((prev) => [...prev, event]);

            let shouldDisplayNextEvent = true;

            if (event.event_type === "assistant_request") {
              message_id = event.message_id;
              console.log("message_id", message_id);
              setMessageId(event.message_id);
              setShowLoadingCard(true);
            }

            if (event.event_type === "tool_exec_request") {
              setSkeletonLoader(false);
            }

            // Update currentNextEvent with the latest event's next_event if flag is true
            if (shouldDisplayNextEvent && event.next_event) {
              setCurrentNextEvent(event.next_event);

              if (event.event_type === "sql_datasource_validation") {
                // Stop displaying next_event for subsequent events
                shouldDisplayNextEvent = false;
              }
            }
          } catch (parseError) {
            console.error("Error parsing chunk:", base64Chunk, parseError);
            // You can decide to ignore partial data or handle it differently
          }
        }
      });

      // 6) Listen for SSE "close" event => end of the stream
      sse.addEventListener("close", () => {
        // Once the stream is done, fetch the final message data
        if (message_id) {
          fetchMessage(message_id);
        }
        setEvents([]);
        setIsLoading(false);
        setSkeletonLoader(false);
      });
    } catch (err) {
      console.error("Error while streaming:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && prompt.trim()) {
      handleSendMessage(prompt);
      setPrompt("");
    }
  };

  const handleSendMessage = (message) => {
    if (!message.trim()) return;
    setIsLoading(true);

    if (createdChatId) {
      fetchData(message, createdChatId);
    } else {
      createChatViaApiRoute(slug).then((res) => {
        if (res && res.id) {
          setCreatedChatId(res.id);
          fetchData(message, res.id);
        } else {
          setIsLoading(false);
        }
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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

  function removeHyphens(text) {
    return text.replace(/[-\/_:]/g, " ");
  }

  const handleRenderComplete = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-page max-h-screen min-h-screen overflow-hidden font-roboto">
      <nav className="px-4 py-2 min-h-14 border-b flex items-center border-border-color">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <Link href="/" className="text-lg font-medium text-accent">
            Assistant Name
          </Link>

          <ThemeToggleButton />
        </div>
      </nav>

      <div className="block h-screen bg-page px-2 overflow-hidden max-w-4xl w-full mx-auto overflow-y-auto sm:hidden font-roboto recent__bar scroll-smooth">
        {history?.length > 0 && (
          <div className="relative flex flex-col items-center w-full h-full">
            <div
              ref={scrollRef}
              className="w-full h-full px-6 my-2 space-y-3 overflow-y-auto recent__bar scroll-smooth"
            >
              {history?.map(({ messageId, name, value, data }, index) => {
                if (name === "user") {
                  return (
                    <div key={index}>
                      <div className="mx-auto mt-5">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="relative flex items-center max-w-[80%] px-4 min-h-8 text-xs font-normal text-black rounded-md bg-user-prompt-bg">
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
                                  width="32"
                                  height="32"
                                  rx="16"
                                  fill="var(--user-prompt-bg)"
                                />
                                <path
                                  d="M15.9992 14.4008C17.5456 14.4008 18.7992 13.1472 18.7992 11.6008C18.7992 10.0544 17.5456 8.80078 15.9992 8.80078C14.4528 8.80078 13.1992 10.0544 13.1992 11.6008C13.1992 13.1472 14.4528 14.4008 15.9992 14.4008Z"
                                  fill="var(--user-icon)"
                                  stroke="var(--user-icon)"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M8.79688 22.7206V23.2006H23.1969V22.7206C23.1969 20.9284 23.1969 20.0323 22.8481 19.3478C22.5413 18.7457 22.0518 18.2561 21.4496 17.9493C20.7651 17.6006 19.869 17.6006 18.0769 17.6006H13.9169C12.1247 17.6006 11.2286 17.6006 10.5441 17.9493C9.94199 18.2561 9.45245 18.7457 9.14566 19.3478C8.79688 20.0323 8.79688 20.9284 8.79688 22.7206Z"
                                  fill="var(--user-icon)"
                                  stroke="var(--user-icon)"
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
                    <div className="bg-page w-[97%]" key={index}>
                      <div className="flex flex-col w-full mx-auto space-y-2">
                        <div className="flex items-start w-full max-w-full space-x-2">
                          <div className="flex items-center justify-center w-8 rounded-full bg-bot-icon-bg aspect-square p-1 px-1.5">
                            {theme === "dark" ? (
                              <svg
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 fill-primary-text"
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
                            ) : (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  width="19.2"
                                  height="19.2"
                                  transform="translate(0.398438 0.400391)"
                                  fill-opacity="0.917647"
                                />
                                <path
                                  d="M15.2 7.60059H4.8C4.35817 7.60059 4 7.95876 4 8.40059V16.4006C4 16.8424 4.35817 17.2006 4.8 17.2006H15.2C15.6418 17.2006 16 16.8424 16 16.4006V8.40059C16 7.95876 15.6418 7.60059 15.2 7.60059Z"
                                  fill="#414551"
                                  stroke="#414551"
                                  stroke-width="2"
                                />
                                <path
                                  d="M7.19844 11.6C7.64027 11.6 7.99844 11.2418 7.99844 10.8C7.99844 10.3582 7.64027 10 7.19844 10C6.75661 10 6.39844 10.3582 6.39844 10.8C6.39844 11.2418 6.75661 11.6 7.19844 11.6Z"
                                  fill="#ECEEF1"
                                />
                                <path
                                  d="M12.8 11.6C13.2418 11.6 13.6 11.2418 13.6 10.8C13.6 10.3582 13.2418 10 12.8 10C12.3582 10 12 10.3582 12 10.8C12 11.2418 12.3582 11.6 12.8 11.6Z"
                                  fill="#ECEEF1"
                                />
                                <path
                                  d="M8.39766 13.2002C7.95582 13.2002 7.59766 13.5584 7.59766 14.0002C7.59766 14.442 7.95582 14.8002 8.39766 14.8002V13.2002ZM11.5977 14.8002C12.0395 14.8002 12.3977 14.442 12.3977 14.0002C12.3977 13.5584 12.0395 13.2002 11.5977 13.2002V14.8002ZM8.39766 14.8002H11.5977V13.2002H8.39766V14.8002Z"
                                  fill="#ECEEF1"
                                />
                                <path
                                  d="M10 4.40039V7.60039"
                                  stroke="#414551"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M2 10.8008V14.0008"
                                  stroke="#414551"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M18 10.8008V14.0008"
                                  stroke="#414551"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M9.99922 4.40078C10.441 4.40078 10.7992 4.04261 10.7992 3.60078C10.7992 3.15895 10.441 2.80078 9.99922 2.80078C9.55739 2.80078 9.19922 3.15895 9.19922 3.60078C9.19922 4.04261 9.55739 4.40078 9.99922 4.40078Z"
                                  stroke="#414551"
                                  stroke-width="2"
                                />
                              </svg>
                            )}
                          </div>

                          <ChatEvents
                            events={data}
                            showAddDashboard={true}
                            showReaction={true}
                            messageId={messageId}
                            onRenderComplete={handleRenderComplete}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (name === "error") {
                  return (
                    <div className="bg-page" key={index}>
                      <div className="flex items-start w-full max-w-full space-x-2">
                        <div className="flex items-center justify-center w-8 rounded-full bg-primary aspect-square">
                          <svg
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 fill-primary-text"
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

                          {/* <div className="text-xs font-normal text-secondary-text">
                            <Link
                              href="/model-management"
                              className="underline hover:text-primary-text"
                            >
                              Click here
                            </Link>{" "}
                            to change your model settings
                          </div> */}

                          <div
                            className={`text-xs font-normal leading-5 text-primary-text ${
                              theme === "dark"
                                ? "text-primary-text"
                                : "text-[#414551]"
                            }`}
                          >
                            {data}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}

              <div className="bg-page">
                {isLoading && (
                  <div className="flex items-start w-full max-w-full space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bot-icon-bg aspect-square p-1 px-1.5">
                      {theme === "dark" ? (
                        <svg
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 fill-primary-text"
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
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="19.2"
                            height="19.2"
                            transform="translate(0.398438 0.400391)"
                            fill-opacity="0.917647"
                          />
                          <path
                            d="M15.2 7.60059H4.8C4.35817 7.60059 4 7.95876 4 8.40059V16.4006C4 16.8424 4.35817 17.2006 4.8 17.2006H15.2C15.6418 17.2006 16 16.8424 16 16.4006V8.40059C16 7.95876 15.6418 7.60059 15.2 7.60059Z"
                            fill="#414551"
                            stroke="#414551"
                            stroke-width="2"
                          />
                          <path
                            d="M7.19844 11.6C7.64027 11.6 7.99844 11.2418 7.99844 10.8C7.99844 10.3582 7.64027 10 7.19844 10C6.75661 10 6.39844 10.3582 6.39844 10.8C6.39844 11.2418 6.75661 11.6 7.19844 11.6Z"
                            fill="#ECEEF1"
                          />
                          <path
                            d="M12.8 11.6C13.2418 11.6 13.6 11.2418 13.6 10.8C13.6 10.3582 13.2418 10 12.8 10C12.3582 10 12 10.3582 12 10.8C12 11.2418 12.3582 11.6 12.8 11.6Z"
                            fill="#ECEEF1"
                          />
                          <path
                            d="M8.39766 13.2002C7.95582 13.2002 7.59766 13.5584 7.59766 14.0002C7.59766 14.442 7.95582 14.8002 8.39766 14.8002V13.2002ZM11.5977 14.8002C12.0395 14.8002 12.3977 14.442 12.3977 14.0002C12.3977 13.5584 12.0395 13.2002 11.5977 13.2002V14.8002ZM8.39766 14.8002H11.5977V13.2002H8.39766V14.8002Z"
                            fill="#ECEEF1"
                          />
                          <path
                            d="M10 4.40039V7.60039"
                            stroke="#414551"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M2 10.8008V14.0008"
                            stroke="#414551"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M18 10.8008V14.0008"
                            stroke="#414551"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M9.99922 4.40078C10.441 4.40078 10.7992 4.04261 10.7992 3.60078C10.7992 3.15895 10.441 2.80078 9.99922 2.80078C9.55739 2.80078 9.19922 3.15895 9.19922 3.60078C9.19922 4.04261 9.55739 4.40078 9.99922 4.40078Z"
                            stroke="#414551"
                            stroke-width="2"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col w-full space-y-2">
                      {skeletonLoader && (
                        <div className="w-full py-1 mt-1">
                          <AnimatedText text="Thinking..." />
                        </div>
                      )}

                      {!skeletonLoader && events?.length > 0 ? (
                        <div className="flex flex-col w-full">
                          <div
                            className="flex items-center justify-between py-1 mt-1 space-x-2 cursor-pointer group w-fit"
                            onClick={() => setToggleThought(!toggleThought)}
                          >
                            <div className="w-full">
                              {skeletonLoader || (
                                <AnimatedText
                                  text={`${
                                    isStopping
                                      ? "Stopping..."
                                      : currentNextEvent
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
                            <div className="flex flex-col py-2 pl-4 border-l-2 border-border-color">
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

                                          {item?.tool_call_data
                                            .filter_rules && (
                                            <div className="flex items-center space-x-2">
                                              {Object.keys(
                                                item?.tool_call_data
                                                  .filter_rules
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
                                                              item
                                                                ?.tool_call_data
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
                                                          {filter_type ==
                                                            "eq" && " = "}

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
                                    <pre className="pl-2 mt-2 text-xs font-medium text-wrap font-roboto text-secondary-text">
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
                        (showLoadingCard && events.length > 0 && (
                          <div className="w-[97%]">
                            <ChatEvents
                              events={events}
                              assistantName={assistantName}
                              streaming={true}
                              onRenderComplete={handleRenderComplete}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center w-full px-6 pb-2">
              <div className="relative flex items-center w-full py-3 overflow-y-auto border border-border-color rounded-md recent__bar bg-input-bg">
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

                <button
                  type="button"
                  className={`absolute flex items-center cursor-pointer justify-center bottom-1.5 right-2`}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
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
                        isInputDisabled
                          ? theme === "dark"
                            ? "#111E45"
                            : "#C9D7FC"
                          : "#295EF4"
                      }
                    />
                    <path
                      d="M13.125 21V10.3469L8.225 15.2469L7 14L14 7L21 14L19.775 15.2469L14.875 10.3469V21H13.125Z"
                      fill={
                        isInputDisabled
                          ? theme === "dark"
                            ? "#444446"
                            : "#F1F5FF"
                          : "#F6F6F6"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {history?.length > 0 || (
          <div className="flex items-center justify-center w-full h-full">
            <div className="max-w-[800px] mx-auto w-full flex flex-col justify-center items-center space-y-8">
              <div className="flex flex-col w-full space-y-2 text-center">
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 62 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-16 h-16"
                  >
                    <path
                      d="M42.8494 13.0373C43.1852 13.0373 43.4667 12.9237 43.6938 12.6965C43.921 12.4694 44.0346 12.1879 44.0346 11.8521C44.0346 11.5163 43.921 11.2348 43.6938 11.0076C43.4667 10.7805 43.1852 10.6669 42.8494 10.6669C42.5136 10.6669 42.2321 10.7805 42.0049 11.0076C41.7778 11.2348 41.6642 11.5163 41.6642 11.8521C41.6642 12.1879 41.7778 12.4694 42.0049 12.6965C42.2321 12.9237 42.5136 13.0373 42.8494 13.0373ZM47.5901 13.0373C47.9259 13.0373 48.2074 12.9237 48.4346 12.6965C48.6617 12.4694 48.7753 12.1879 48.7753 11.8521C48.7753 11.5163 48.6617 11.2348 48.4346 11.0076C48.2074 10.7805 47.9259 10.6669 47.5901 10.6669C47.2543 10.6669 46.9728 10.7805 46.7457 11.0076C46.5185 11.2348 46.4049 11.5163 46.4049 11.8521C46.4049 12.1879 46.5185 12.4694 46.7457 12.6965C46.9728 12.9237 47.2543 13.0373 47.5901 13.0373ZM52.3309 13.0373C52.6667 13.0373 52.9482 12.9237 53.1753 12.6965C53.4025 12.4694 53.5161 12.1879 53.5161 11.8521C53.5161 11.5163 53.4025 11.2348 53.1753 11.0076C52.9482 10.7805 52.6667 10.6669 52.3309 10.6669C51.9951 10.6669 51.7136 10.7805 51.4864 11.0076C51.2593 11.2348 51.1457 11.5163 51.1457 11.8521C51.1457 12.1879 51.2593 12.4694 51.4864 12.6965C51.7136 12.9237 51.9951 13.0373 52.3309 13.0373ZM35.7383 26.0743V4.74098C35.7383 4.08912 35.9704 3.5311 36.4346 3.0669C36.8988 2.6027 37.4568 2.37061 38.1087 2.37061H57.0716C57.7235 2.37061 58.2815 2.6027 58.7457 3.0669C59.2099 3.5311 59.442 4.08912 59.442 4.74098V18.9632C59.442 19.615 59.2099 20.1731 58.7457 20.6373C58.2815 21.1015 57.7235 21.3336 57.0716 21.3336H40.479L35.7383 26.0743ZM39.4716 18.9632H57.0716V4.74098H38.1087V20.2965L39.4716 18.9632Z"
                      fill="#5F6368"
                    />
                    <path
                      d="M36.7285 34.3745H11.0495C9.95859 34.3745 9.07422 35.2589 9.07422 36.3498V56.1029C9.07422 57.1938 9.95859 58.0782 11.0495 58.0782H36.7285C37.8195 58.0782 38.7038 57.1938 38.7038 56.1029V36.3498C38.7038 35.2589 37.8195 34.3745 36.7285 34.3745Z"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                    />
                    <path
                      d="M16.9753 44.2509C18.0662 44.2509 18.9506 43.3665 18.9506 42.2756C18.9506 41.1847 18.0662 40.3003 16.9753 40.3003C15.8844 40.3003 15 41.1847 15 42.2756C15 43.3665 15.8844 44.2509 16.9753 44.2509Z"
                      fill="#5F6368"
                    />
                    <path
                      d="M30.7995 44.2509C31.8905 44.2509 32.7748 43.3665 32.7748 42.2756C32.7748 41.1847 31.8905 40.3003 30.7995 40.3003C29.7086 40.3003 28.8242 41.1847 28.8242 42.2756C28.8242 43.3665 29.7086 44.2509 30.7995 44.2509Z"
                      fill="#5F6368"
                    />
                    <path
                      d="M19.9362 48.1948C18.8453 48.1948 17.9609 49.0792 17.9609 50.1701C17.9609 51.2611 18.8453 52.1454 19.9362 52.1454V48.1948ZM27.8375 52.1454C28.9284 52.1454 29.8128 51.2611 29.8128 50.1701C29.8128 49.0792 28.9284 48.1948 27.8375 48.1948V52.1454ZM19.9362 52.1454H27.8375V48.1948H19.9362V52.1454Z"
                      fill="#5F6368"
                    />
                    <path
                      d="M23.8867 26.4683V34.3695"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M4.13672 42.269V50.1703"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M43.6406 42.269V50.1703"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M23.8894 26.4697C24.9803 26.4697 25.8647 25.5853 25.8647 24.4944C25.8647 23.4034 24.9803 22.519 23.8894 22.519C22.7984 22.519 21.9141 23.4034 21.9141 24.4944C21.9141 25.5853 22.7984 26.4697 23.8894 26.4697Z"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                    />
                  </svg>
                </span>

                <p className="text-sm font-medium text-primary-text">
                  {currentAssistant?.name}
                </p>

                <p className="text-sm font-normal leading-6 text-secondary-text">
                  {currentAssistant?.about}
                </p>

                {currentAssistant?.stage_config?.default?.sample_questions
                  ?.length > 0 && (
                  <div className="flex flex-col pt-6 space-y-4 text-left">
                    <p className="text-sm font-medium text-primary-text">
                      Suggested Questions to Get Started
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {currentAssistant?.stage_config?.default?.sample_questions
                        ?.slice(0, 4)
                        .map((item) => {
                          return (
                            <div
                              className="w-full px-3 py-2 text-sm font-medium text-left rounded-md cursor-pointer text-primary-text bg-input-bg hover:bg-secondary-hover-bg line-clamp-1"
                              onClick={() => setPrompt(item)}
                            >
                              {item}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex items-center w-full py-3 overflow-y-auto border border-border-color rounded-md recent__bar bg-input-bg">
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

                <button
                  type="button"
                  className={`absolute flex items-center cursor-pointer justify-center bottom-1.5 right-2`}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
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
                        isInputDisabled
                          ? theme === "dark"
                            ? "#111E45"
                            : "#C9D7FC"
                          : "#295EF4"
                      }
                    />
                    <path
                      d="M13.125 21V10.3469L8.225 15.2469L7 14L14 7L21 14L19.775 15.2469L14.875 10.3469V21H13.125Z"
                      fill={
                        isInputDisabled
                          ? theme === "dark"
                            ? "#444446"
                            : "#F1F5FF"
                          : "#F6F6F6"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden w-full bg-page h-screen overflow-hidden max-w-4xl mx-auto sm:flex font-roboto">
        {history?.length > 0 && (
          <div className="relative flex flex-col items-center w-full h-full">
            <div
              ref={scrollRef}
              className="w-full h-full px-6 my-2 space-y-3 overflow-y-auto recent__bar scroll-smooth"
            >
              {history?.map(({ messageId, name, value, data }, index) => {
                if (name === "user") {
                  return (
                    <div key={index}>
                      <div className="mx-auto mt-5">
                        <div className="flex flex-col justify-end px-4 space-y-2 lg:pr-0 lg:pl-0 xsm:space-y-0 xsm:space-x-2 xsm:flex-row">
                          <div className="relative flex items-center max-w-[80%] px-4 min-h-8 text-xs font-normal text-black rounded-md bg-user-prompt-bg">
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
                                  width="32"
                                  height="32"
                                  rx="16"
                                  fill="var(--user-prompt-bg)"
                                />
                                <path
                                  d="M15.9992 14.4008C17.5456 14.4008 18.7992 13.1472 18.7992 11.6008C18.7992 10.0544 17.5456 8.80078 15.9992 8.80078C14.4528 8.80078 13.1992 10.0544 13.1992 11.6008C13.1992 13.1472 14.4528 14.4008 15.9992 14.4008Z"
                                  fill="var(--user-icon)"
                                  stroke="var(--user-icon)"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M8.79688 22.7206V23.2006H23.1969V22.7206C23.1969 20.9284 23.1969 20.0323 22.8481 19.3478C22.5413 18.7457 22.0518 18.2561 21.4496 17.9493C20.7651 17.6006 19.869 17.6006 18.0769 17.6006H13.9169C12.1247 17.6006 11.2286 17.6006 10.5441 17.9493C9.94199 18.2561 9.45245 18.7457 9.14566 19.3478C8.79688 20.0323 8.79688 20.9284 8.79688 22.7206Z"
                                  fill="var(--user-icon)"
                                  stroke="var(--user-icon)"
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
                    <div className="bg-page w-[97%]" key={index}>
                      <div className="flex flex-col w-full mx-auto space-y-2">
                        <div className="flex items-start w-full max-w-full space-x-2">
                          <div className="flex items-center justify-center w-8 rounded-full bg-bot-icon-bg aspect-square p-1 px-1.5">
                            {theme === "dark" ? (
                              <svg
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 fill-primary-text"
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
                            ) : (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  width="19.2"
                                  height="19.2"
                                  transform="translate(0.398438 0.400391)"
                                  fill-opacity="0.917647"
                                />
                                <path
                                  d="M15.2 7.60059H4.8C4.35817 7.60059 4 7.95876 4 8.40059V16.4006C4 16.8424 4.35817 17.2006 4.8 17.2006H15.2C15.6418 17.2006 16 16.8424 16 16.4006V8.40059C16 7.95876 15.6418 7.60059 15.2 7.60059Z"
                                  fill="#414551"
                                  stroke="#414551"
                                  stroke-width="2"
                                />
                                <path
                                  d="M7.19844 11.6C7.64027 11.6 7.99844 11.2418 7.99844 10.8C7.99844 10.3582 7.64027 10 7.19844 10C6.75661 10 6.39844 10.3582 6.39844 10.8C6.39844 11.2418 6.75661 11.6 7.19844 11.6Z"
                                  fill="#ECEEF1"
                                />
                                <path
                                  d="M12.8 11.6C13.2418 11.6 13.6 11.2418 13.6 10.8C13.6 10.3582 13.2418 10 12.8 10C12.3582 10 12 10.3582 12 10.8C12 11.2418 12.3582 11.6 12.8 11.6Z"
                                  fill="#ECEEF1"
                                />
                                <path
                                  d="M8.39766 13.2002C7.95582 13.2002 7.59766 13.5584 7.59766 14.0002C7.59766 14.442 7.95582 14.8002 8.39766 14.8002V13.2002ZM11.5977 14.8002C12.0395 14.8002 12.3977 14.442 12.3977 14.0002C12.3977 13.5584 12.0395 13.2002 11.5977 13.2002V14.8002ZM8.39766 14.8002H11.5977V13.2002H8.39766V14.8002Z"
                                  fill="#ECEEF1"
                                />
                                <path
                                  d="M10 4.40039V7.60039"
                                  stroke="#414551"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M2 10.8008V14.0008"
                                  stroke="#414551"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M18 10.8008V14.0008"
                                  stroke="#414551"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M9.99922 4.40078C10.441 4.40078 10.7992 4.04261 10.7992 3.60078C10.7992 3.15895 10.441 2.80078 9.99922 2.80078C9.55739 2.80078 9.19922 3.15895 9.19922 3.60078C9.19922 4.04261 9.55739 4.40078 9.99922 4.40078Z"
                                  stroke="#414551"
                                  stroke-width="2"
                                />
                              </svg>
                            )}
                          </div>

                          <ChatEvents
                            events={data}
                            showAddDashboard={true}
                            showReaction={true}
                            messageId={messageId}
                            onRenderComplete={handleRenderComplete}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (name === "error") {
                  return (
                    <div className="bg-page" key={index}>
                      <div className="flex items-start w-full max-w-full space-x-2">
                        <div className="flex items-center justify-center w-8 rounded-full bg-primary aspect-square">
                          <svg
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 fill-primary-text"
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
                            {data}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}

              <div className="bg-page">
                {isLoading && (
                  <div className="flex items-start w-full max-w-full space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bot-icon-bg aspect-square p-1 px-1.5">
                      {theme === "dark" ? (
                        <svg
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 fill-primary-text"
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
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="19.2"
                            height="19.2"
                            transform="translate(0.398438 0.400391)"
                            fill-opacity="0.917647"
                          />
                          <path
                            d="M15.2 7.60059H4.8C4.35817 7.60059 4 7.95876 4 8.40059V16.4006C4 16.8424 4.35817 17.2006 4.8 17.2006H15.2C15.6418 17.2006 16 16.8424 16 16.4006V8.40059C16 7.95876 15.6418 7.60059 15.2 7.60059Z"
                            fill="#414551"
                            stroke="#414551"
                            stroke-width="2"
                          />
                          <path
                            d="M7.19844 11.6C7.64027 11.6 7.99844 11.2418 7.99844 10.8C7.99844 10.3582 7.64027 10 7.19844 10C6.75661 10 6.39844 10.3582 6.39844 10.8C6.39844 11.2418 6.75661 11.6 7.19844 11.6Z"
                            fill="#ECEEF1"
                          />
                          <path
                            d="M12.8 11.6C13.2418 11.6 13.6 11.2418 13.6 10.8C13.6 10.3582 13.2418 10 12.8 10C12.3582 10 12 10.3582 12 10.8C12 11.2418 12.3582 11.6 12.8 11.6Z"
                            fill="#ECEEF1"
                          />
                          <path
                            d="M8.39766 13.2002C7.95582 13.2002 7.59766 13.5584 7.59766 14.0002C7.59766 14.442 7.95582 14.8002 8.39766 14.8002V13.2002ZM11.5977 14.8002C12.0395 14.8002 12.3977 14.442 12.3977 14.0002C12.3977 13.5584 12.0395 13.2002 11.5977 13.2002V14.8002ZM8.39766 14.8002H11.5977V13.2002H8.39766V14.8002Z"
                            fill="#ECEEF1"
                          />
                          <path
                            d="M10 4.40039V7.60039"
                            stroke="#414551"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M2 10.8008V14.0008"
                            stroke="#414551"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M18 10.8008V14.0008"
                            stroke="#414551"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M9.99922 4.40078C10.441 4.40078 10.7992 4.04261 10.7992 3.60078C10.7992 3.15895 10.441 2.80078 9.99922 2.80078C9.55739 2.80078 9.19922 3.15895 9.19922 3.60078C9.19922 4.04261 9.55739 4.40078 9.99922 4.40078Z"
                            stroke="#414551"
                            stroke-width="2"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col w-full space-y-2">
                      {skeletonLoader && (
                        <div className="w-full py-1 mt-1">
                          <AnimatedText text="Thinking..." />
                        </div>
                      )}

                      {!skeletonLoader && events?.length > 0 ? (
                        <div className="flex flex-col w-full">
                          <div
                            className="flex items-center justify-between py-1 mt-1 space-x-2 cursor-pointer group w-fit"
                            onClick={() => setToggleThought(!toggleThought)}
                          >
                            <div className="w-full">
                              {skeletonLoader || (
                                <AnimatedText
                                  text={`${
                                    isStopping
                                      ? "Stopping..."
                                      : currentNextEvent
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
                            <div className="flex flex-col py-2 pl-4 border-l-2 border-border-color">
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

                                          {item?.tool_call_data
                                            .filter_rules && (
                                            <div className="flex items-center space-x-2">
                                              {Object.keys(
                                                item?.tool_call_data
                                                  .filter_rules
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
                                                              item
                                                                ?.tool_call_data
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
                                                          {filter_type ==
                                                            "eq" && " = "}

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
                                    <pre className="pl-2 mt-2 text-xs font-medium text-wrap font-roboto text-secondary-text">
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
                        (showLoadingCard && events.length > 0 && (
                          <div className="w-[97%]">
                            <ChatEvents
                              events={events}
                              assistantName={assistantName}
                              streaming={true}
                              onRenderComplete={handleRenderComplete}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* <div ref={scrollRef}></div> */}
            </div>

            <div className="flex items-center justify-center w-full px-6 pb-2">
              <div className="relative flex items-center w-full py-3 overflow-y-auto rounded-md border border-border-color recent__bar bg-input-bg">
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

                <button
                  type="button"
                  className={`absolute flex items-center cursor-pointer justify-center bottom-1.5 right-2`}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
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
                        isInputDisabled
                          ? theme === "dark"
                            ? "#111E45"
                            : "#C9D7FC"
                          : "#295EF4"
                      }
                    />
                    <path
                      d="M13.125 21V10.3469L8.225 15.2469L7 14L14 7L21 14L19.775 15.2469L14.875 10.3469V21H13.125Z"
                      fill={
                        isInputDisabled
                          ? theme === "dark"
                            ? "#444446"
                            : "#F1F5FF"
                          : "#F6F6F6"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {history?.length > 0 || (
          <div className="flex items-center justify-center w-full h-full">
            <div className="max-w-[800px] mx-auto w-full flex flex-col justify-center items-center space-y-8">
              <div className="flex flex-col w-full space-y-2 text-center">
                <span className="flex items-center justify-center">
                  <svg
                    viewBox="0 0 62 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-16 h-16"
                  >
                    <path
                      d="M42.8494 13.0373C43.1852 13.0373 43.4667 12.9237 43.6938 12.6965C43.921 12.4694 44.0346 12.1879 44.0346 11.8521C44.0346 11.5163 43.921 11.2348 43.6938 11.0076C43.4667 10.7805 43.1852 10.6669 42.8494 10.6669C42.5136 10.6669 42.2321 10.7805 42.0049 11.0076C41.7778 11.2348 41.6642 11.5163 41.6642 11.8521C41.6642 12.1879 41.7778 12.4694 42.0049 12.6965C42.2321 12.9237 42.5136 13.0373 42.8494 13.0373ZM47.5901 13.0373C47.9259 13.0373 48.2074 12.9237 48.4346 12.6965C48.6617 12.4694 48.7753 12.1879 48.7753 11.8521C48.7753 11.5163 48.6617 11.2348 48.4346 11.0076C48.2074 10.7805 47.9259 10.6669 47.5901 10.6669C47.2543 10.6669 46.9728 10.7805 46.7457 11.0076C46.5185 11.2348 46.4049 11.5163 46.4049 11.8521C46.4049 12.1879 46.5185 12.4694 46.7457 12.6965C46.9728 12.9237 47.2543 13.0373 47.5901 13.0373ZM52.3309 13.0373C52.6667 13.0373 52.9482 12.9237 53.1753 12.6965C53.4025 12.4694 53.5161 12.1879 53.5161 11.8521C53.5161 11.5163 53.4025 11.2348 53.1753 11.0076C52.9482 10.7805 52.6667 10.6669 52.3309 10.6669C51.9951 10.6669 51.7136 10.7805 51.4864 11.0076C51.2593 11.2348 51.1457 11.5163 51.1457 11.8521C51.1457 12.1879 51.2593 12.4694 51.4864 12.6965C51.7136 12.9237 51.9951 13.0373 52.3309 13.0373ZM35.7383 26.0743V4.74098C35.7383 4.08912 35.9704 3.5311 36.4346 3.0669C36.8988 2.6027 37.4568 2.37061 38.1087 2.37061H57.0716C57.7235 2.37061 58.2815 2.6027 58.7457 3.0669C59.2099 3.5311 59.442 4.08912 59.442 4.74098V18.9632C59.442 19.615 59.2099 20.1731 58.7457 20.6373C58.2815 21.1015 57.7235 21.3336 57.0716 21.3336H40.479L35.7383 26.0743ZM39.4716 18.9632H57.0716V4.74098H38.1087V20.2965L39.4716 18.9632Z"
                      fill="#5F6368"
                    />
                    <path
                      d="M36.7285 34.3745H11.0495C9.95859 34.3745 9.07422 35.2589 9.07422 36.3498V56.1029C9.07422 57.1938 9.95859 58.0782 11.0495 58.0782H36.7285C37.8195 58.0782 38.7038 57.1938 38.7038 56.1029V36.3498C38.7038 35.2589 37.8195 34.3745 36.7285 34.3745Z"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                    />
                    <path
                      d="M16.9753 44.2509C18.0662 44.2509 18.9506 43.3665 18.9506 42.2756C18.9506 41.1847 18.0662 40.3003 16.9753 40.3003C15.8844 40.3003 15 41.1847 15 42.2756C15 43.3665 15.8844 44.2509 16.9753 44.2509Z"
                      fill="#5F6368"
                    />
                    <path
                      d="M30.7995 44.2509C31.8905 44.2509 32.7748 43.3665 32.7748 42.2756C32.7748 41.1847 31.8905 40.3003 30.7995 40.3003C29.7086 40.3003 28.8242 41.1847 28.8242 42.2756C28.8242 43.3665 29.7086 44.2509 30.7995 44.2509Z"
                      fill="#5F6368"
                    />
                    <path
                      d="M19.9362 48.1948C18.8453 48.1948 17.9609 49.0792 17.9609 50.1701C17.9609 51.2611 18.8453 52.1454 19.9362 52.1454V48.1948ZM27.8375 52.1454C28.9284 52.1454 29.8128 51.2611 29.8128 50.1701C29.8128 49.0792 28.9284 48.1948 27.8375 48.1948V52.1454ZM19.9362 52.1454H27.8375V48.1948H19.9362V52.1454Z"
                      fill="#5F6368"
                    />
                    <path
                      d="M23.8867 26.4683V34.3695"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M4.13672 42.269V50.1703"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M43.6406 42.269V50.1703"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M23.8894 26.4697C24.9803 26.4697 25.8647 25.5853 25.8647 24.4944C25.8647 23.4034 24.9803 22.519 23.8894 22.519C22.7984 22.519 21.9141 23.4034 21.9141 24.4944C21.9141 25.5853 22.7984 26.4697 23.8894 26.4697Z"
                      stroke="#5F6368"
                      stroke-width="1.97531"
                    />
                  </svg>
                </span>

                <p className="text-sm font-medium text-primary-text">
                  {currentAssistant?.name}
                </p>

                <p className="text-sm font-normal leading-6 text-secondary-text">
                  {currentAssistant?.about}
                </p>

                {currentAssistant?.stage_config?.default?.sample_questions
                  ?.length > 0 && (
                  <div className="flex flex-col pt-6 space-y-4 text-left">
                    <p className="text-sm font-medium text-primary-text">
                      Suggested Questions to Get Started
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {currentAssistant?.stage_config?.default?.sample_questions
                        ?.slice(0, 4)
                        .map((item) => {
                          return (
                            <div
                              className="w-full px-3 py-2 text-sm font-medium text-left rounded-md cursor-pointer text-primary-text bg-input-bg hover:bg-secondary-hover-bg line-clamp-1"
                              onClick={() => setPrompt(item)}
                            >
                              {item}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex items-center w-full py-3 overflow-y-auto rounded-md border border-border-color recent__bar bg-input-bg">
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

                <button
                  type="button"
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
                        isInputDisabled
                          ? theme === "dark"
                            ? "#111E45"
                            : "#C9D7FC"
                          : "#295EF4"
                      }
                    />
                    <path
                      d="M13.125 21V10.3469L8.225 15.2469L7 14L14 7L21 14L19.775 15.2469L14.875 10.3469V21H13.125Z"
                      fill={
                        isInputDisabled
                          ? theme === "dark"
                            ? "#444446"
                            : "#F1F5FF"
                          : "#F6F6F6"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSlug;
