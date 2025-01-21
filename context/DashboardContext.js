import React, { createContext, useState, useContext } from "react";

const Context = createContext();

export const DashboardContext = ({ children }) => {
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [currentOutput, setCurrentOutput] = useState(false);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState({
    id: null,
    name: "",
    config: null,
  });

  const [dataframeColumns, setDataframeColumns] = useState([]);
  const [confirmDeleteWidget, setConfirmDeleteWidget] = useState(false);
  const [updateWidget, setUpdateWidget] = useState(false);
  const [visualizationConfig, setVisualizationConfig] = useState(null);

  const [showSqlCmd, setShowSqlCmd] = useState(false);
  const [sqlCmd, setSqlCmd] = useState("");

  const resetSelectedWidget = () => {
    setSelectedWidget({
      id: null,
      name: "",
      config: null,
    });
  };

  const resetDashboardContext = () => {
    setShowAddWidget(false);
    setCurrentOutput(false);
    setSelectedWidget({
      id: null,
      name: "",
      config: null,
    });
    setDataframeColumns({});
    setConfirmDeleteWidget(false);
    setUpdateWidget(false);
    setVisualizationConfig(null);
    setShowWidgetMenu(false);
  };

  return (
    <Context.Provider
      value={{
        showAddWidget,
        setShowAddWidget,
        currentOutput,
        setCurrentOutput,
        showWidgetMenu,
        setShowWidgetMenu,
        selectedWidget,
        setSelectedWidget,
        dataframeColumns,
        setDataframeColumns,
        confirmDeleteWidget,
        setConfirmDeleteWidget,
        updateWidget,
        setUpdateWidget,
        visualizationConfig,
        setVisualizationConfig,
        resetSelectedWidget,
        resetDashboardContext,
        showSqlCmd,
        setShowSqlCmd,
        sqlCmd,
        setSqlCmd,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useDashboardContext = () => useContext(Context);
