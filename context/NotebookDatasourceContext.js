import React, { createContext, useState, useContext } from "react";

const Context = createContext();

export const NotebookDatasourceContext = ({ children }) => {
  const [blocks, setBlocks] = useState([]);
  const [sqlCmd, setSqlCmd] = useState([]);
  const [showNotebookSqlCmd, setShowNotebookSqlCmd] = useState(false);
  const [blockId, setBlockId] = useState(null);
  const [datasoureId, setdDatasoureId] = useState(null);

  return (
    <Context.Provider
      value={{
        blocks,
        setBlocks,
        sqlCmd,
        setSqlCmd,
        showNotebookSqlCmd,
        setShowNotebookSqlCmd,
        blockId,
        setBlockId,
        datasoureId,
        setdDatasoureId,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useNotebookDatasourceContext = () => useContext(Context);
