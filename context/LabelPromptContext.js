import React, { createContext, useState, useContext } from "react";

const Context = createContext();

export const LabelPromptContext = ({ children }) => {
    const [promptLabel, setPromptLabel] = useState('');

    return (
        <Context.Provider
            value={{
                promptLabel,
                setPromptLabel,
            }}
        >
            {children}
        </Context.Provider>
    );
};

export const useLabelPromptContext = () => useContext(Context);