import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import TextareaAutosize from "react-textarea-autosize";
import { useUpdateSampleQuestionsMutation } from "@/store/assistant";

const AddQuestion = ({
  createQuestion,
  setCreateQuestion,
  refetch = () => {},
  update = false,
  data = [],
  currentQuestion = "",
  index = null,
}) => {
  const [question, setQuestion] = useState("");
  const router = useRouter();

  useEffect(() => {
    setQuestion(currentQuestion);
  }, [currentQuestion]);

  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setQuestion("");
      setCreateQuestion(false);
    }
  };

  useEffect(() => {
    if (createQuestion) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [createQuestion]);

  const handleCloseCreation = () => {
    setQuestion("");
    setCreateQuestion(false);
  };

  const [updateSampleQuestions, { isLoading: updateLoading }] =
    useUpdateSampleQuestionsMutation();

  const handleUpdate = () => {
    if (!question) return;

    let newQuestions = [...data];

    if (update) {
      if (index !== null && index >= 0 && index < newQuestions.length) {
        newQuestions[index] = question;
      }
    } else {
      newQuestions.push(question);
    }

    updateSampleQuestions({
      assistant_id: router.query.slug,
      payload: {
        assistant_stage: "default",
        questions: newQuestions,
      },
    }).then((response) => {
      if (response.data === null) {
        refetch();
        setQuestion("");
        setCreateQuestion(false);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && question !== "") {
      e.preventDefault();
      handleUpdate();
    }
  };

  const handleTextArea = (value) => {
    setQuestion(value);
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        createQuestion || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-md border rounded-lg bg-dropdown-bg border-border-color"
        ref={modalRef}
      >
        <div className="flex flex-col h-full space-y-2">
          <div className="relative flex items-center justify-between px-4 py-2 text-sm font-medium border-b text-muted border-dropdown-border">
            {update ? <span>Edit Question</span> : <span>Add Question</span>}

            <span
              className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer bg-background"
              onClick={handleCloseCreation}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 fill-btn-primary-outline-icon hover:text-primary-text"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>

          <div className="flex flex-col px-4 space-y-2">
            <div className="text-sm font-medium tracking-wide text-muted">
              Your question
            </div>
          </div>

          <div className="w-full px-4 pb-2">
            <TextareaAutosize
              className="w-full px-3 py-2 text-xs font-normal border rounded-md outline-none resize-y text-input-text border-border-color min-h-28 max-h-48 bg-page placeholder:text-input-placeholder recent__bar focus:border-input-border-focus"
              value={question}
              onChange={(e) => handleTextArea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
            />
          </div>

          <div className="flex items-center justify-end w-full px-4 py-2 space-x-4 border-t border-dropdown-border">
            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide border rounded-md w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
              onClick={() => setCreateQuestion(false)}
            >
              Cancel
            </button>

            <button
              className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
              onClick={handleUpdate}
              disabled={question === "" ? true : false || updateLoading}
            >
              {update ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;
