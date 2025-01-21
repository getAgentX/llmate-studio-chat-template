import React, { useState, useEffect, useRef } from "react";
import _ from "lodash";

const JoinsSets = ({
  currentTableName = "",
  columns = [],
  getValues = () => {},
  setValue = () => {},
  name,
  initialData = [],
  update,
  showBtn,
}) => {
  const [joinSets, setJoinSets] = useState([]);
  const [tableNames, setTableNames] = useState([]);

  useEffect(() => {
    if (initialData?.length > 0) {
      setJoinSets(initialData);
    } else {
      setJoinSets([
        {
          name: "set1",
          joins: [
            {
              source_column: "",
              join_type: "",
              target_table: "",
              target_column: "",
            },
          ],
        },
      ]);
    }
  }, []);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const dataTables = getValues(`tables`);

    if (dataTables && dataTables?.length === 1) {
      function convertJoinSets(input) {
        return input.map((item) => ({
          name: item.name,
          joins: [],
        }));
      }

      const result = convertJoinSets(joinSets);
      setValue(name, result, { shouldValidate: true });
    } else {
      setValue(name, joinSets, { shouldValidate: true });
    }
  }, [joinSets]);

  useEffect(() => {
    const data = getValues(`tables`);

    const filterTable = data?.filter((item) => {
      return item.name !== currentTableName;
    });

    setTableNames(filterTable);
  }, []);

  const handleAddColumnToSet = (index) => {
    let firstJoin;

    if (joinSets[index]?.joins?.length > 0) {
      firstJoin = joinSets[index].joins[0];
    }

    const newJoin = {
      source_column: "",
      join_type: firstJoin?.join_type || "",
      target_table: firstJoin?.target_table || "",
      target_column: "",
    };

    setJoinSets((prevJoinSets) => {
      const updatedJoinSets = [...prevJoinSets];
      updatedJoinSets[index].joins = [...updatedJoinSets[index].joins, newJoin];
      return updatedJoinSets;
    });
  };

  const handleRemoveJoin = (setIndex, joinIndex) => {
    setJoinSets((prevJoinSets) => {
      return prevJoinSets.map((joinSet, i) => {
        if (i === setIndex) {
          const updatedJoins = joinSet.joins.filter(
            (_, jIndex) => jIndex !== joinIndex
          );
          return { ...joinSet, joins: updatedJoins };
        }
        return joinSet;
      });
    });
  };

  const handleAddNewSet = () => {
    const newSet = {
      name: `set${joinSets.length + 1}`,
      joins: [
        {
          source_column: "",
          join_type: "",
          target_table: "",
          target_column: "",
        },
      ],
    };

    setJoinSets((prevJoinSets) => [...prevJoinSets, newSet]);
  };

  const handleRemoveSet = (setId) => {
    setJoinSets((prev) => prev.filter((_, index) => index !== setId));
  };

  const handleColumnSelect = (setId, joinIndex, colKey, value) => {
    setJoinSets((prev) =>
      prev.map((set, index) => {
        if (index === setId) {
          const updatedJoins = set.joins.map((join, jIndex) => {
            if (jIndex === joinIndex) {
              return {
                ...join,
                [colKey]: value,
              };
            }
            return join;
          });

          return {
            ...set,
            joins: updatedJoins,
          };
        }
        return set;
      })
    );
  };

  return (
    <div className="rounded-md bg-[#1B1D1F] p-2 flex flex-col space-y-4">
      <p className="text-sm font-normal text-white">
        Possible Column Joins Sets
      </p>

      <div className="flex flex-col">
        {joinSets.map((set, setIndex) => {
          const checkFirstJoinFields = (data) => {
            if (!data.joins || data.joins.length === 0) {
              return false;
            }

            const firstJoin = data.joins[0];

            const allFieldsFilled = _.every(firstJoin, (value) => !!value);

            return allFieldsFilled;
          };

          const checkFirstJoin =
            set?.joins.length === 0 ? true : checkFirstJoinFields(set);

          return (
            <div
              key={setIndex}
              className="flex flex-col border rounded-md border-border bg-[#181A1C] cursor-default mb-2"
            >
              <div className="flex items-center justify-between w-full px-4 py-3 text-sm tracking-wide text-white border-b border-border">
                <p className="font-medium">Set - {setIndex + 1}</p>

                {update || (
                  <span
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => handleRemoveSet(setIndex)}
                  >
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 stroke-[#5F6368] hover:stroke-white"
                    >
                      <g clip-path="url(#clip0_2110_18889)">
                        <path
                          d="M2.25 2.5V11H9.75V2.5H2.25Z"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 5V8.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M7 5V8.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M1 2.5H11"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M4 2.5L4.82225 1H7.19427L8 2.5H4Z"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2110_18889">
                          <rect width="12" height="12" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                )}

                {showBtn && update && (
                  <span
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => handleRemoveSet(setIndex)}
                  >
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 stroke-[#5F6368] hover:stroke-white"
                    >
                      <g clip-path="url(#clip0_2110_18889)">
                        <path
                          d="M2.25 2.5V11H9.75V2.5H2.25Z"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 5V8.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M7 5V8.25"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M1 2.5H11"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M4 2.5L4.82225 1H7.19427L8 2.5H4Z"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2110_18889">
                          <rect width="12" height="12" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                )}
              </div>

              <div className="flex flex-col px-2 py-2 space-y-2">
                {set &&
                  set?.joins.map((item, index) => (
                    <Sets
                      key={index}
                      dataSet={item}
                      colKey={index}
                      setIndex={setIndex}
                      columns={columns}
                      handleRemoveJoin={handleRemoveJoin}
                      handleColumnSelect={handleColumnSelect}
                      tableNames={tableNames}
                      update={update}
                      showBtn={showBtn}
                      currentTableName={currentTableName}
                      getValues={getValues}
                      set={set}
                    />
                  ))}
              </div>

              {update || (
                <div className="flex items-center w-full px-4 py-3 space-x-1 text-sm font-medium tracking-wide border-t group text-secondary hover:text-secondary-foreground border-border">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 fill-secondary group-hover:fill-secondary-foreground"
                    >
                      <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddColumnToSet(setIndex)}
                    className="cursor-pointer"
                    disabled={!checkFirstJoin}
                  >
                    Add Connection
                  </button>
                </div>
              )}

              {showBtn && update && (
                <div className="flex items-center w-full px-4 py-3 space-x-1 text-sm font-medium tracking-wide border-t group text-secondary hover:text-secondary-foreground border-border">
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 fill-secondary group-hover:fill-secondary-foreground"
                    >
                      <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
                    </svg>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddColumnToSet(setIndex)}
                    className="cursor-pointer"
                    disabled={!checkFirstJoin}
                  >
                    Add Connection
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {update || (
          <div className="flex items-center justify-center cursor-default">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 space-x-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground"
              onClick={handleAddNewSet}
            >
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-white"
                >
                  <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
                </svg>
              </span>
              <span>Add Join</span>
            </button>
          </div>
        )}

        {showBtn && update && (
          <div className="flex items-center justify-center cursor-default">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 space-x-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary-foreground"
              onClick={handleAddNewSet}
            >
              <span className="flex items-center justify-center">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-white"
                >
                  <path d="M7.33337 8.66536H3.33337V7.33203H7.33337V3.33203H8.66671V7.33203H12.6667V8.66536H8.66671V12.6654H7.33337V8.66536Z" />
                </svg>
              </span>
              <span>Add Join</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinsSets;

const Sets = ({
  dataSet,
  colKey,
  handleRemoveJoin,
  setIndex,
  columns,
  handleColumnSelect,
  tableNames,
  update,
  showBtn,
  currentTableName,
  getValues,
  set,
}) => {
  const [toggleColumn, setToggleColumn] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [toggleConnect, setToggleConnect] = useState(false);
  const [connectResponse, setConnectResponse] = useState(
    dataSet?.join_type || ""
  );
  const [toggleJoinTable, setToggleJoinTable] = useState(false);
  const [joinTable, setJoinTable] = useState(dataSet?.target_table || "");
  const [toggleJoinCol, setToggleJoinCol] = useState(false);
  const [joinCol, setJoinCol] = useState("");
  const [selectedTableColumns, setSelectedTableColumns] = useState([]);

  const modalRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setToggleColumn(false);
      setToggleConnect(false);
      setToggleJoinTable(false);
      setToggleJoinCol(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const checkFirstJoinFields = (data) => {
    if (!data.joins || data.joins.length === 0 || data.joins.length === 1) {
      return false;
    }

    const firstJoin = data.joins[0];

    const allFieldsFilled = _.every(firstJoin, (value) => !!value);

    return allFieldsFilled;
  };

  const checkFirstJoin = checkFirstJoinFields(set);

  const handleJoinTable = (table) => {
    setJoinTable(table.name);
    setToggleJoinTable(false);

    handleColumnSelect(setIndex, colKey, "target_table", table.name);

    const data = getValues(`tables`);

    const filterTable = data?.filter((item) => {
      return item.name === table.name;
    });

    setSelectedTableColumns(filterTable[0]?.columns);
  };

  useEffect(() => {
    if (joinTable !== "") {
      setJoinTable(joinTable);
      setToggleJoinTable(false);

      handleColumnSelect(setIndex, colKey, "target_table", joinTable);

      const data = getValues(`tables`);

      const filterTable = data?.filter((item) => {
        return item.name === joinTable;
      });

      setSelectedTableColumns(filterTable[0]?.columns);
    }
  }, []);

  const ConnectorList = [
    "inner_join",
    "left_outer_join",
    "right_outer_join",
    "self_join",
    "cross_join",
  ];

  return (
    <div className="flex items-center justify-between p-2 text-white">
      <div className="flex items-center w-full space-x-2">
        <div className="flex flex-col space-y-4 rounded-md bg-[#212325] p-2 w-full">
          <div className="flex flex-col space-y-2">
            <p className="text-xs font-normal tracking-wider text-white">
              Selected Table
            </p>

            <div className="text-xs font-normal text-white tracking-wider w-full bg-[#181A1C] capitalize flex items-center justify-between rounded-md px-2 py-2">
              {currentTableName}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-xs font-normal tracking-wider text-white">
              Select the column from the selected table to join with another
            </p>

            <div
              className={`relative flex w-full  ${
                toggleColumn ? "shadow-lg" : ""
              }`}
            >
              <button
                type="button"
                className="cursor-pointer w-full border bg-[#181A1C] border-[#242424] rounded-md"
                disabled={update ? !showBtn : false}
                onClick={() => setToggleColumn(!toggleColumn)}
              >
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                  <div className="w-full text-xs font-normal capitalize text-start text-white/50 line-clamp-1">
                    {currentResponse || "Choose Column"}
                  </div>

                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`w-4 h-4 fill-white/50 ${
                        toggleColumn ? "transform rotate-180" : ""
                      }`}
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                </div>
              </button>

              {toggleColumn && (
                <ul
                  className="flex flex-col w-full bg-[#26282D] rounded-md z-10 divide-y-2 divide-[#2D3035] absolute top-[110%] left-0"
                  ref={modalRef}
                >
                  {columns &&
                    columns.map((info, key) => (
                      <li
                        className={`py-2.5 px-2 flex items-center justify-between text-xs font-normal cursor-pointer text-white ${
                          currentResponse === info.name
                            ? "bg-[#3c3e42]"
                            : "bg-[#26282D] hover:bg-[#3c3e42]"
                        }`}
                        onClick={() => {
                          setCurrentResponse(info.name);
                          setToggleColumn(false);
                          handleColumnSelect(
                            setIndex,
                            colKey,
                            "source_column",
                            info.name
                          );
                        }}
                        key={key}
                      >
                        <div className="line-clamp-1">{info.name}</div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 17 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 fill-white/50"
          >
            <path d="M16.666 3L11.666 0.113249V5.88675L16.666 3ZM0.666016 3.5H12.166V2.5H0.666016V3.5Z" />
            <path d="M0.666016 11L5.66602 8.11325V13.8868L0.666016 11ZM16.666 11.5H5.16602V10.5H16.666V11.5Z" />
          </svg>
        </span>

        <div className="flex flex-col space-y-4 rounded-md bg-[#212325] px-2 py-6 w-full">
          <div className="flex flex-col space-y-2">
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 18 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
              >
                <path
                  d="M8.16602 8.66927H4.83268C3.6799 8.66927 2.69727 8.26302 1.88477 7.45052C1.07227 6.63802 0.666016 5.65538 0.666016 4.5026C0.666016 3.34983 1.07227 2.36719 1.88477 1.55469C2.69727 0.742187 3.6799 0.335938 4.83268 0.335938H8.16602V2.0026H4.83268C4.13824 2.0026 3.54796 2.24566 3.06185 2.73177C2.57574 3.21788 2.33268 3.80816 2.33268 4.5026C2.33268 5.19705 2.57574 5.78733 3.06185 6.27344C3.54796 6.75955 4.13824 7.0026 4.83268 7.0026H8.16602V8.66927ZM5.66602 5.33594V3.66927H12.3327V5.33594H5.66602ZM9.83268 8.66927V7.0026H13.166C13.8605 7.0026 14.4507 6.75955 14.9368 6.27344C15.423 5.78733 15.666 5.19705 15.666 4.5026C15.666 3.80816 15.423 3.21788 14.9368 2.73177C14.4507 2.24566 13.8605 2.0026 13.166 2.0026H9.83268V0.335938H13.166C14.3188 0.335938 15.3014 0.742187 16.1139 1.55469C16.9264 2.36719 17.3327 3.34983 17.3327 4.5026C17.3327 5.65538 16.9264 6.63802 16.1139 7.45052C15.3014 8.26302 14.3188 8.66927 13.166 8.66927H9.83268Z"
                  fill="white"
                  fill-opacity="0.25"
                />
              </svg>
            </span>

            <p className="text-xs font-normal tracking-wider text-center text-white">
              Connect with
            </p>

            <div
              className={`relative flex w-full  ${
                toggleConnect ? "shadow-lg" : ""
              }`}
            >
              <button
                type="button"
                className="cursor-pointer w-full border bg-[#181A1C] border-[#242424] rounded-md"
                disabled={
                  update ? !showBtn || checkFirstJoin : false || checkFirstJoin
                }
                onClick={() => setToggleConnect(!toggleConnect)}
              >
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                  <div className="w-full text-xs font-normal capitalize text-start text-white/50 line-clamp-1">
                    {connectResponse || "Choose Join type"}
                  </div>

                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`w-4 h-4 fill-white/50 ${
                        toggleConnect ? "transform rotate-180" : ""
                      }`}
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                </div>
              </button>

              {toggleConnect && (
                <ul
                  className="flex flex-col w-full bg-[#26282D] rounded-md z-10 divide-y-2 divide-[#2D3035] absolute top-[110%] left-0"
                  ref={modalRef}
                >
                  {ConnectorList.length > 0 &&
                    ConnectorList.map((name, key) => (
                      <li
                        className={`py-2.5 px-2 flex items-center justify-between text-xs font-normal cursor-pointer text-white ${
                          connectResponse === name
                            ? "bg-[#3c3e42]"
                            : "bg-[#26282D] hover:bg-[#3c3e42]"
                        }`}
                        onClick={() => {
                          setConnectResponse(name);
                          setToggleConnect(false);
                          handleColumnSelect(
                            setIndex,
                            colKey,
                            "join_type",
                            name
                          );
                        }}
                        key={key}
                      >
                        <div className="line-clamp-1">{name}</div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 17 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 fill-white/50"
          >
            <path d="M16.666 3L11.666 0.113249V5.88675L16.666 3ZM0.666016 3.5H12.166V2.5H0.666016V3.5Z" />
            <path d="M0.666016 11L5.66602 8.11325V13.8868L0.666016 11ZM16.666 11.5H5.16602V10.5H16.666V11.5Z" />
          </svg>
        </span>

        <div className="flex flex-col space-y-4 rounded-md bg-[#212325] p-2 w-full">
          <div className="flex flex-col space-y-2">
            <p className="text-xs font-normal tracking-wider text-white">
              Select the table you want to join with
            </p>

            <div
              className={`relative flex w-full  ${
                toggleJoinTable ? "shadow-lg" : ""
              }`}
            >
              <button
                type="button"
                className="cursor-pointer w-full border bg-[#181A1C] border-[#242424] rounded-md"
                disabled={checkFirstJoin}
                onClick={() => setToggleJoinTable(!toggleJoinTable)}
              >
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                  <div className="w-full text-xs font-normal capitalize text-start text-white/50 line-clamp-1">
                    {joinTable || "Choose table"}
                  </div>

                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`w-4 h-4 fill-white/50 ${
                        toggleJoinTable ? "transform rotate-180" : ""
                      }`}
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                </div>
              </button>

              {toggleJoinTable && (
                <ul
                  className="flex flex-col w-full bg-[#26282D] rounded-md z-10 divide-y-2 divide-[#2D3035] absolute top-[110%] left-0"
                  ref={modalRef}
                >
                  {tableNames &&
                    tableNames.map((table, key) => (
                      <li
                        className={`py-2.5 px-2 flex items-center justify-between text-xs font-normal cursor-pointer text-white ${
                          joinTable === table.name
                            ? "bg-[#3c3e42]"
                            : "bg-[#26282D] hover:bg-[#3c3e42]"
                        }`}
                        onClick={() => {
                          handleJoinTable(table);
                        }}
                        key={key}
                      >
                        <div className="line-clamp-1">{table.name}</div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-xs font-normal tracking-wider text-white">
              Select the Column from the selected table you want to join with
            </p>

            <div
              className={`relative flex w-full  ${
                toggleJoinCol ? "shadow-lg" : ""
              }`}
            >
              <button
                type="button"
                className="cursor-pointer w-full border bg-[#181A1C] disabled:bg-[#181A1C]/50 disabled:cursor-default border-[#242424] rounded-md"
                // disabled={update ? !showBtn : false}
                disabled={joinTable === "" ? true : false}
                onClick={() => setToggleJoinCol(!toggleJoinCol)}
              >
                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md">
                  <div className="w-full text-xs font-normal capitalize text-start text-white/50 line-clamp-1">
                    {joinCol || "Choose table"}
                  </div>

                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`w-4 h-4 fill-white/50 ${
                        toggleJoinCol ? "transform rotate-180" : ""
                      }`}
                    >
                      <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                    </svg>
                  </span>
                </div>
              </button>

              {toggleJoinCol && (
                <ul
                  className="flex flex-col w-full bg-[#26282D] rounded-md z-10 divide-y-2 divide-[#2D3035] absolute top-[110%] left-0"
                  ref={modalRef}
                >
                  {selectedTableColumns?.length > 0 &&
                    selectedTableColumns?.map((col, key) => (
                      <li
                        className={`py-2.5 px-2 flex items-center justify-between text-xs font-normal cursor-pointer text-white ${
                          joinCol === col.name
                            ? "bg-[#3c3e42]"
                            : "bg-[#26282D] hover:bg-[#3c3e42]"
                        }`}
                        onClick={() => {
                          setJoinCol(col.name);
                          setToggleJoinCol(false);
                          handleColumnSelect(
                            setIndex,
                            colKey,
                            "target_column",
                            col.name
                          );
                        }}
                        key={key}
                      >
                        <div className="line-clamp-1">{col.name}</div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {update || (
        <span
          className="flex items-center justify-center ml-2 cursor-pointer"
          onClick={() => handleRemoveJoin(setIndex, colKey)}
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 stroke-[#5F6368] hover:stroke-white"
          >
            <g clipPath="url(#clip0_2110_18889)">
              <path d="M2.25 2.5V11H9.75V2.5H2.25Z" stroke-linejoin="round" />
              <path
                d="M5 5V8.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 5V8.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M1 2.5H11"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 2.5L4.82225 1H7.19427L8 2.5H4Z"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_2110_18889">
                <rect width="12" height="12" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </span>
      )}

      {showBtn && update && (
        <span
          className="flex items-center justify-center ml-2 cursor-pointer"
          onClick={() => handleRemoveJoin(setIndex, colKey)}
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 stroke-[#5F6368] hover:stroke-white"
          >
            <g clipPath="url(#clip0_2110_18889)">
              <path d="M2.25 2.5V11H9.75V2.5H2.25Z" stroke-linejoin="round" />
              <path
                d="M5 5V8.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 5V8.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M1 2.5H11"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 2.5L4.82225 1H7.19427L8 2.5H4Z"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_2110_18889">
                <rect width="12" height="12" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </span>
      )}
    </div>
  );
};
