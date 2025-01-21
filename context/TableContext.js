import React, { createContext, useState, useContext } from "react";

const Context = createContext();

export const TableContext = ({ children }) => {
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [tableData, setTableData] = useState({});
  const [tableLoading, setTableLoading] = useState(false);

  return (
    <Context.Provider
      value={{
        isTableOpen,
        setIsTableOpen,
        tableData,
        setTableData,
        tableLoading,
        setTableLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useTableContext = () => useContext(Context);
