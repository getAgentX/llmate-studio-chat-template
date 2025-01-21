import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  useGetChatByIdQuery,
  useGetChatsInfoQuery,
  useUpdateChatLabelMutation,
} from "@/store/assistant";
import Split from "react-split";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";

const AssistantChatLayout = ({ children, handleNewChat = false }) => {
  const [isCollapse, setIsCollapse] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingItemId, setRenamingItemId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();

  const {
    data: chatList,
    isLoading: chatsLoading,
    error: chatsError,
    refetch: refetchChatList,
  } = useGetChatsInfoQuery(
    {
      assistant_id: router.query.slug,
      skip: page * 20,
      limit: 20,
    },
    {
      skip: !router?.query?.slug,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: chatData } = useGetChatByIdQuery(
    {
      assistant_id: router.query.slug,
      chat_id: router.query.chats,
    },
    {
      skip: !router?.query?.slug || !router.query.chats,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (chatList) {
      if (page === 0) {
        setLogs(chatList);
      } else {
        setLogs((prevLogs) => {
          const combinedData = [...prevLogs, ...chatList];

          const uniqueData = Array.from(
            new Map(combinedData.map((item) => [item._id, item])).values()
          );
          return uniqueData;
        });
      }

      setHasMore(chatList.length === 20);
    }
  }, [chatList, page]);

  const fetchMoreLogs = () => {
    if (!chatsLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const matchedHistoryId = router.query.chats;

  // Simply copy logs to sortedLogs without rearranging
  let sortedLogs = logs ? [...logs] : [];

  // Remove the sorting code
  // const index = sortedLogs.findIndex((item) => item._id === matchedHistoryId);

  // if (index > -1) {
  //   const [item] = sortedLogs.splice(index, 1);
  //   sortedLogs.unshift(item);
  // }

  const isMatch =
    chatData && sortedLogs.some((log) => log?._id === chatData?._id);

  return (
    <div className="hidden w-full h-screen overflow-hidden sm:flex font-roboto">
      <Split
        className="split_row"
        direction="horizontal"
        minSize={100}
        gutterSize={2}
        cursor="e-resize"
        // sizes={[20, 80]}
        sizes={[isCollapse ? "48px" : 20, isCollapse ? 96.5 : 80]}
      >
        <div className="w-full h-full max-h-full">
          <div className="w-full h-full max-h-full pb-5 border-r border-border-color">
            <div className="flex flex-col w-full h-full space-y-3 border-r border-border-color bg-page">
              <div className="flex items-center justify-between h-12 p-4 text-sm font-semibold border-b border-border-color text-primary-text">
                {isCollapse || <p>Chat history</p>}

                <button
                  type="button"
                  className="flex items-center justify-center cursor-pointer"
                  onClick={() => setIsCollapse((prev) => !prev)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-5 h-5 fill-icon-color hover:fill-icon-color-hover ${
                      isCollapse ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <path d="M16.9984 18L18.3984 16.6L13.7984 12L18.3984 7.4L16.9984 6L10.9984 12L16.9984 18ZM7.99844 18V6H5.99844V18H7.99844Z" />
                  </svg>
                </button>
              </div>

              {isCollapse ||
                (handleNewChat && (
                  <div className="px-3">
                    <button
                      onClick={handleNewChat}
                      className="flex items-center justify-center w-full h-8 max-w-full px-4 text-xs font-medium tracking-wide rounded-md whitespace-nowrap bg-btn-primary text-btn-primary-text hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                    >
                      <img
                        src="/assets/plus.svg"
                        alt="unpublish"
                        className="w-4 h-4 mr-2"
                      />
                      <span>New Chat</span>
                    </button>
                  </div>
                ))}

              {isCollapse || handleNewChat || (
                <div className="px-3">
                  <Link
                    href={`/assistant/chat/${router?.query.slug}`}
                    className="flex items-center justify-center w-full h-8 max-w-full px-4 text-xs font-medium tracking-wide rounded-md whitespace-nowrap bg-btn-primary text-btn-primary-text hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                  >
                    <img
                      src="/assets/plus.svg"
                      alt="unpublish"
                      className="w-4 h-4 mr-2"
                    />
                    <span>New Chat</span>
                  </Link>
                </div>
              )}

              {isCollapse || (
                <div
                  className="flex flex-col items-stretch w-full h-full overflow-y-auto bg-page recent__bar"
                  id="scrollableDiv"
                >
                  <InfiniteScroll
                    dataLength={sortedLogs.length}
                    next={fetchMoreLogs}
                    hasMore={hasMore}
                    loader={
                      <div className="flex items-center justify-center w-full h-16">
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-5 h-5 animate-spin text-foreground fill-accent-foreground"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.0830 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>

                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    }
                    endMessage={
                      <p className="py-4 text-xs font-normal text-center text-input-placeholder">
                        <b>No more chats to display</b>
                      </p>
                    }
                    scrollableTarget="scrollableDiv"
                  >
                    {chatData && !isMatch && (
                      <LogsList
                        item={chatData}
                        router={router}
                        setLogs={setLogs}
                        isRenaming={isRenaming}
                        setIsRenaming={setIsRenaming}
                        renamingItemId={renamingItemId}
                        setRenamingItemId={setRenamingItemId}
                      />
                    )}

                    {sortedLogs?.map((item) => {
                      return (
                        <LogsList
                          key={item._id}
                          item={item}
                          router={router}
                          setLogs={setLogs}
                          isRenaming={isRenaming}
                          setIsRenaming={setIsRenaming}
                          renamingItemId={renamingItemId}
                          setRenamingItemId={setRenamingItemId}
                        />
                      );
                    })}
                  </InfiniteScroll>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-full max-h-full">{children}</div>
      </Split>
    </div>
  );
};

export default AssistantChatLayout;

const LogsList = ({
  item,
  router,
  setLogs,
  isRenaming,
  setIsRenaming,
  renamingItemId,
  setRenamingItemId,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const modalRef = useRef(null);

  const [updateChatLabel] = useUpdateChatLabelMutation();

  const handleRename = (id) => {
    setRenameValue(item.label);
    setIsRenaming(true);
    setRenamingItemId(id);
    setShowModal(false);
  };

  const handleSaveRename = () => {
    updateChatLabel({
      assistant_id: router.query.slug,
      chat_id: renamingItemId,
      payload: { label: renameValue },
    }).then((response) => {
      if (response.error) {
        // Handle error if needed
      } else {
        setLogs((prevLogs) =>
          prevLogs.map((log) =>
            log._id === renamingItemId ? { ...log, label: renameValue } : log
          )
        );
        setIsRenaming(false);
        setRenameValue("");
        setRenamingItemId(null);
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <div
      key={item._id}
      className={`relative text-secondary-text flex py-2 h-7 text-xs border-l-2 justify-between items-center w-full px-3 ${
        router?.query.chats === item._id
          ? "bg-active-bg border-border-active-color text-active-text"
          : "bg-transparent border-transparent hover:bg-active-bg-hover"
      }`}
    >
      <Link
        href={
          isRenaming && renamingItemId === item._id
            ? "#"
            : `/assistant/chat/${router.query.slug}/history/${item._id}`
        }
        className="w-full mr-3 truncate"
        onClick={(e) => {
          if (isRenaming && renamingItemId === item._id) {
            e.preventDefault();
          }
        }}
      >
        {isRenaming && renamingItemId === item._id ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => {
              if (!renameValue.trim()) {
                setIsRenaming(false);
                setRenameValue("");
                setRenamingItemId(null);
              }
            }}
            className="w-full text-primary-text bg-page focus:outline-none focus:border-none"
          />
        ) : (
          <div
            className={`line-clamp-1 ${
              router?.query.chats === item._id
                ? "text-active-text"
                : "text-primary-text"
            }`}
          >
            {item.label}
          </div>
        )}
      </Link>

      {isRenaming && renamingItemId === item._id ? (
        <div className="flex space-x-1">
          <button
            onClick={() => {
              setIsRenaming(false);
              setRenamingItemId(null);
              setRenameValue("");
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.26536 12.6666L3.33203 11.7333L7.06536 7.99992L3.33203 4.26659L4.26536 3.33325L7.9987 7.06659L11.732 3.33325L12.6654 4.26659L8.93203 7.99992L12.6654 11.7333L11.732 12.6666L7.9987 8.93325L4.26536 12.6666Z"
                fill="#C61B1B"
              />
            </svg>
          </button>
          <button onClick={handleSaveRename}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.36641 12.0001L2.56641 8.20007L3.51641 7.25007L6.36641 10.1001L12.4831 3.9834L13.4331 4.9334L6.36641 12.0001Z"
                fill="#1BC655"
              />
            </svg>
          </button>
        </div>
      ) : (
        <span
          className="flex items-center justify-center cursor-pointer"
          onClick={() => setShowModal(!showModal)}
        >
          <svg
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-icon-color hover:text-icon-color-hover"
          >
            <path d="M13.3346 7.99998C13.3346 8.36665 13.2041 8.68054 12.943 8.94165C12.6819 9.20276 12.368 9.33331 12.0013 9.33331C11.6346 9.33331 11.3207 9.20276 11.0596 8.94165C10.7985 8.68054 10.668 8.36665 10.668 7.99998C10.668 7.63331 10.7985 7.31942 11.0596 7.05831C11.3207 6.7972 11.6346 6.66665 12.0013 6.66665C12.368 6.66665 12.6819 6.7972 12.943 7.05831C13.2041 7.31942 13.3346 7.63331 13.3346 7.99998ZM9.33463 7.99998C9.33463 8.36665 9.20408 8.68054 8.94297 8.94165C8.68186 9.20276 8.36797 9.33331 8.0013 9.33331C7.63463 9.33331 7.32075 9.20276 7.05964 8.94165C6.79852 8.68054 6.66797 8.36665 6.66797 7.99998C6.66797 7.63331 6.79852 7.31942 7.05964 7.05831C7.32075 6.7972 7.63463 6.66665 8.0013 6.66665C8.36797 6.66665 8.68186 6.7972 8.94297 7.05831C9.20408 7.31942 9.33463 7.63331 9.33463 7.99998ZM5.33464 7.99998C5.33464 8.36665 5.20408 8.68054 4.94297 8.94165C4.68186 9.20276 4.36797 9.33331 4.0013 9.33331C3.63464 9.33331 3.32075 9.20276 3.05964 8.94165C2.79852 8.68054 2.66797 8.36665 2.66797 7.99998C2.66797 7.63331 2.79852 7.31942 3.05964 7.05831C3.32075 6.7972 3.63464 6.66665 4.0013 6.66665C4.36797 6.66665 4.68186 6.7972 4.94297 7.05831C5.20408 7.31942 5.33464 7.63331 5.33464 7.99998Z" />
          </svg>
        </span>
      )}

      {showModal && (
        <div
          ref={modalRef}
          className="absolute text-primary-text shadow-lg rounded-md top-7 right-0 min-w-32 max-w-32 bg-primary border border-dropdown-color z-[100]"
        >
          <button
            className="flex w-full px-3 py-2 text-left rounded-md hover:bg-secondary-hover-bg gap-x-2"
            onClick={() => handleRename(item._id)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 fill-icon-color"
            >
              <path d="M3.33333 12.6667H4.28333L10.8 6.15L9.85 5.2L3.33333 11.7167V12.6667ZM2 14V11.1667L10.8 2.38333C10.9333 2.26111 11.0806 2.16667 11.2417 2.1C11.4028 2.03333 11.5722 2 11.75 2C11.9278 2 12.1 2.03333 12.2667 2.1C12.4333 2.16667 12.5778 2.26667 12.7 2.4L13.6167 3.33333C13.75 3.45556 13.8472 3.6 13.9083 3.76667C13.9694 3.93333 14 4.1 14 4.26667C14 4.44444 13.9694 4.61389 13.9083 4.775C13.8472 4.93611 13.75 5.08333 13.6167 5.21667L4.83333 14H2ZM10.3167 5.68333L9.85 5.2L10.8 6.15L10.3167 5.68333Z" />
            </svg>
            Rename
          </button>
        </div>
      )}
    </div>
  );
};
