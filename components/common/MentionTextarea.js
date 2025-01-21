import React from "react";
import { MentionsInput, Mention } from "react-mentions";

const mentionInputStyle = {
  control: {
    backgroundColor: "var(--bg-primary)",
    fontWeight: "normal",
    width: "100%",
    minHeight: "192px",
    height: "auto",
    padding: "12px 16px",
    border: "1px solid var(--input-border)",
    fontSize: "12px",
    lineHeight: "20px",
    resize: "none",
    color: "#a1a2ab",
    borderRadius: "6px",
  },
  "&multiLine": {
    control: {
      minHeight: "192px",
    },
    highlighter: {
      boxSizing: "border-box",
      overflow: "hidden",
      padding: "9px",
    },
    input: {
      padding: "9px",
      minHeight: "192px",
      outline: 0,
      border: 0,
    },
  },
  "&singleLine": {
    display: "inline-block",
    width: 130,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    border: "1px solid #303232",
    padding: "5px",
    backgroundColor: "#26282d",
  },
  suggestions: {
    list: {
      backgroundColor: "#26282d",
      border: "1px solid #303232",
      fontSize: 14,
      color: "#ffffff",
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid #303238",
      backgroundColor: "#26282d",
      "&focused": {
        backgroundColor: "#303238",
      },
    },
  },
};

function MentionTextarea({
  data,
  value,
  onChange,
  update,
  showBtn,
  error = "",
}) {
  const displayTransform = (id, display) => {
    return `{${display}}`;
  };

  return (
    <div className="flex flex-col space-y-2">
      <MentionsInput
        value={value}
        onChange={(event, newValue, newPlainTextValue, mentions) => {
          onChange(newValue);
        }}
        style={
          showBtn
            ? {
              ...mentionInputStyle,
              control: {
                ...mentionInputStyle.control,
                border: "1px solid var(--input-border)",
                color: "#a1a2ab"
              },
            }
            : {
              ...mentionInputStyle,
              control: {
                ...mentionInputStyle.control,
                border: "none", // Border when showBtn is false
                color: "var(--text-primary)",
              },
            }
        }
        a11ySuggestionsListLabel={"Suggested mentions"}
        placeholder="Mention variables using '{'"
        disabled={update ? !showBtn : false}
      >
        <Mention
          trigger="{"
          data={data}
          // style={defaultMentionStyle}
          markup="{__display__}"
          displayTransform={displayTransform}
          renderSuggestion={(
            suggestion,
            search,
            highlightedDisplay,
            index,
            focused
          ) => (
            <div className={`${focused ? "focused" : ""}`}>
              {highlightedDisplay}
            </div>
          )}
        />
      </MentionsInput>

      {error && (
        <p className="text-xs font-medium tracking-wider text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default MentionTextarea;
