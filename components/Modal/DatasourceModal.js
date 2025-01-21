import {
  useCreateSQLDatasourceRoutingMutation,
  useCreateSemiStructuredDatasourceRoutingMutation,
} from "@/store/assistant";
import { useGetDatasourcesMutation } from "@/store/datasource";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

const DatasourceModal = ({
  showDatasource,
  setShowDatasource,
  slug,
  refetchAssistant,
  setCurrentRouting = false,
  currentRouting = {},
  update = false,
}) => {
  const [currentTab, setCurrentTab] = useState("choose_datasource");
  const [selectedDatasource, setSelectedDatasource] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // New state for ds_type
  const errorRef = useRef(null);

  const [getDatasources, { data: fetchedDatasources }] =
    useGetDatasourcesMutation();

  useEffect(() => {
    getDatasources({
      skip: 0,
      limit: 100,
      sort_by: "A-Z",
      query: "",
    }).then((response) => {
      if (response.data) {
      }
    });
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      datasource_id: "",
      routing: {
        register_as: "",
        description: "",
        return_directly: true,
        user_query: "",
        enable_table_routing: false,
        max_row_limit: 0,
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (update) {
      setSelectedDatasource(currentRouting.id);

      const data = {
        datasource_id: currentRouting.id,
        routing: {
          register_as: currentRouting.register_as,
          description: currentRouting.description,
          return_directly: currentRouting.return_directly,
          user_query: currentRouting.user_query,
          enable_table_routing: currentRouting.enable_table_routing,
          max_row_limit: 0,
        },
      };

      if (update && fetchedDatasources?.length > 0) {
        const datasourceData = fetchedDatasources?.find((item) => {
          return item.id === currentRouting.id;
        });

        setSelectedType(datasourceData?.ds_config?.ds_type);
      }

      reset(data);
      setCurrentTab("when_to_use");
    }
  }, [currentRouting, fetchedDatasources]);

  const handleOutsideClick = (e) => {
    if (errorRef.current && !errorRef.current.contains(e.target)) {
      setShowDatasource(false);

      if (setCurrentRouting) {
        setCurrentRouting({});
      }
    }
  };

  useEffect(() => {
    if (showDatasource) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showDatasource]);

  const [createSQLDatasourceRouting, {}] =
    useCreateSQLDatasourceRoutingMutation();
  const [createSemiStructuredDatasourceRouting, {}] =
    useCreateSemiStructuredDatasourceRoutingMutation();

  const onSubmit = (data) => {
    if (!selectedDatasource) {
      console.error("No datasource selected");
      return;
    }

    let payload = {
      datasource_id: selectedDatasource,
      routing: {
        register_as: data.routing.register_as,
        description: data.routing.description,
        return_directly: data.routing.return_directly,
      },
    };

    if (selectedType === "sql_generator") {
      payload.routing = {
        ...payload.routing,
        user_query: data.routing.user_query,
        enable_table_routing: data.routing.enable_table_routing,
      };

      createSQLDatasourceRouting({ assistant_id: slug, payload }).then(
        (response) => {
          if (response.data) {
            setShowDatasource(false);
            refetchAssistant();
          } else {
            setShowDatasource(false);
          }
        }
      );
    }

    if (selectedType === "semi_structured") {
      payload.routing = {
        ...payload.routing,
        max_row_limit: parseInt(data.routing.max_row_limit, 10) || 0,
      };

      createSemiStructuredDatasourceRouting({
        assistant_id: slug,
        payload,
      }).then((response) => {
        if (response.data) {
          setShowDatasource(false);
          refetchAssistant();
        } else {
          setShowDatasource(false);
        }
      });
    }
  };

  const handleUpdate = () => {
    const data = getValues();

    let payload = {
      datasource_id: data.datasource_id,
      routing: {
        register_as: data.routing.register_as,
        description: data.routing.description,
        return_directly: data.routing.return_directly,
      },
    };

    if (selectedType === "sql_generator") {
      payload.routing = {
        ...payload.routing,
        user_query: data.routing.user_query,
        enable_table_routing: data.routing.enable_table_routing,
      };

      createSQLDatasourceRouting({ assistant_id: slug, payload }).then(
        (response) => {
          if (response.data) {
            setShowDatasource(false);
            refetchAssistant();
          } else {
            setShowDatasource(false);
          }
        }
      );
    }

    if (selectedType === "semi_structured") {
      payload.routing = {
        ...payload.routing,
        max_row_limit: parseInt(data.routing.max_row_limit, 10) || 0,
      };

      createSemiStructuredDatasourceRouting({
        assistant_id: slug,
        payload,
      }).then((response) => {
        if (response.data) {
          setShowDatasource(false);
          refetchAssistant();
        } else {
          setShowDatasource(false);
        }
      });
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        showDatasource || "hidden"
      }`}
    >
      <form
        className="relative flex flex-col w-full max-w-lg p-2 space-y-4 rounded-lg bg-[#26282D]"
        ref={errorRef}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative flex items-center px-2 py-3 text-sm font-medium text-white border-b border-border">
          ADD DATASOURCE TO ASSISTANT
          <span
            className="absolute flex items-center justify-center w-6 h-6 -translate-y-1/2 rounded-full cursor-pointer top-1/2 right-2 bg-background"
            onClick={() => setShowDatasource(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-white/60 hover:text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </span>
        </div>

        <div className="flex flex-col px-2 space-y-4">
          <div className="border-b border-border">
            <div className="flex-wrap items-center w-full space-x-4 sm:flex max-w-fit">
              {update || (
                <button
                  type="button"
                  className={`text-sm pb-3 border-b-2 font-medium tracking-wider capitalize transition-colors duration-300 ${
                    currentTab === "choose_datasource"
                      ? "text-accent border-secondary"
                      : "text-white/40 border-transparent"
                  }`}
                  onClick={() => setCurrentTab("choose_datasource")}
                >
                  1. Choose Datasource
                </button>
              )}

              <button
                type="button"
                className={`text-sm pb-3 border-b-2 font-medium tracking-wider capitalize transition-colors duration-300 ${
                  currentTab === "when_to_use"
                    ? "text-accent border-secondary"
                    : "text-white/40 border-transparent"
                }`}
                onClick={() => setCurrentTab("when_to_use")}
                disabled={selectedDatasource === null}
              >
                2. When to Use
              </button>

              <button
                type="button"
                className={`text-sm pb-3 border-b-2 font-medium tracking-wider capitalize transition-colors duration-300 ${
                  currentTab === "how_to_use"
                    ? "text-accent border-secondary"
                    : "text-white/40 border-transparent"
                }`}
                onClick={() => setCurrentTab("how_to_use")}
                disabled={selectedDatasource === null}
              >
                3. How to use
              </button>
            </div>
          </div>

          {currentTab === "choose_datasource" && (
            <div className="flex flex-col space-y-4">
              <div className="relative w-full">
                <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 left-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-primary-text"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </span>

                <input
                  type="text"
                  className="py-2 pr-4 pl-8 border border-[#3D3F44] bg-foreground outline-none w-full rounded-lg placeholder:text-white/40 text-white text-sm font-normal"
                  placeholder="Search datasources..."
                />
              </div>

              <span className="font-sans text-xs text-white/40">
                Datasource Lists
              </span>

              <ul className="flex flex-col w-full pr-2 space-y-2 overflow-y-auto max-h-64 recent__bar">
                {fetchedDatasources?.map((datasource, index) => {
                  return (
                    <ListDropdown
                      data={datasource}
                      selectedDatasource={selectedDatasource}
                      setDatasource={setSelectedDatasource}
                      setSelectedType={setSelectedType}
                      setValue={setValue}
                      key={index}
                    />
                  );
                })}
              </ul>

              <div className="flex items-center justify-center w-full pt-2 border-t border-border">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium tracking-wide text-white transition-all duration-300 rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
                  onClick={() => setCurrentTab("when_to_use")}
                  disabled={selectedDatasource === null}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentTab === "when_to_use" && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex flex-col space-y-4 overflow-y-auto max-h-72 recent__bar">
                <div className="flex flex-col space-y-4">
                  <p className="text-sm font-medium text-white">
                    When to use the datasource?
                  </p>

                  <div className="flex flex-col p-2 space-y-4 overflow-y-auto border rounded-md sm:space-y-6 border-border sm:p-4 recent__bar">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-normal text-white/80">
                        Register the datasource with the name
                      </p>

                      <input
                        type="text"
                        className="w-full px-4 py-3 text-sm text-white/40 border rounded-md outline-none border-border bg-[#1E2022] placeholder:text-white/40"
                        placeholder="Enter here the datasource name you wants to register with"
                        {...register("routing.register_as", { required: true })}
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-normal text-white/80">
                          Tell the assistant when to use this datasource
                        </p>

                        <textarea
                          type="text"
                          className="w-full px-4 py-3 overflow-y-auto text-sm text-white/40 border rounded-md bg-[#1E2022] outline-none resize-none h-32 border-border placeholder:text-white/40 recent__bar"
                          placeholder="Tell here briefly when to use this datasource"
                          {...register("routing.description", {
                            required: true,
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center w-full pt-2 space-x-2 border-t border-border">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-1 space-x-2 text-sm font-medium tracking-wide text-white transition-all duration-300 border-2 rounded-md border-secondary"
                  onClick={() => setCurrentTab("choose_datasource")}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                      />
                    </svg>
                  </span>
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  className="px-6 py-1.5 text-sm font-medium tracking-wide text-white transition-all duration-300 rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
                  onClick={() => setCurrentTab("how_to_use")}
                  disabled={!isValid || !isDirty}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentTab === "how_to_use" && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex flex-col space-y-4 overflow-y-auto max-h-72 recent__bar">
                <div className="flex flex-col space-y-4">
                  <p className="text-sm font-medium text-white">
                    How to use the datasource?
                  </p>

                  <div className="flex flex-col p-2 space-y-4 overflow-y-auto border rounded-md sm:space-y-6 border-border sm:p-4 recent__bar">
                    {selectedType === "semi_structured" && (
                      <div className="flex flex-col space-y-4">
                        <p className="text-sm font-normal text-white/80">
                          Maximum number of data to fetch at any point of time
                        </p>

                        <input
                          type="number"
                          className="w-full px-4 py-3 text-sm text-white/40 border rounded-md outline-none border-border bg-[#1E2022] placeholder:text-white/40"
                          placeholder="Enter your value in number here..."
                          {...register("routing.max_row_limit", {
                            required: true,
                          })}
                          step="1"
                          min="0"
                          onInput={(e) => {
                            // Remove any non-numeric input or fractional parts forcibly
                            e.target.value = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                          }}
                        />

                        <label
                          htmlFor="Option1"
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer border-border accent-secondary bg-foreground"
                            {...register("routing.return_directly", {})}
                          />

                          <div>
                            <p className="text-xs font-normal tracking-wide text-white">
                              Return directly to the user?{" "}
                              <span className="text-white/40">
                                (Click checkbox if yes)
                              </span>
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {selectedType === "sql_generator" && (
                      <div className="flex flex-col space-y-4">
                        <p className="text-sm font-normal text-white/80">
                          Query
                        </p>

                        <input
                          type="text"
                          className="w-full px-4 py-3 text-sm text-white/40 border rounded-md outline-none border-border bg-[#1E2022] placeholder:text-white/40"
                          placeholder="Tell the assistant how to modify the user’s question before sending it to the datasource"
                          {...register("routing.user_query", {
                            required: true,
                          })}
                        />

                        <label
                          htmlFor="Option1"
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer border-border accent-secondary bg-foreground"
                            {...register("routing.return_directly", {})}
                          />

                          <div>
                            <p className="text-xs font-normal tracking-wide text-white">
                              Return directly to the user?{" "}
                              <span className="text-white/40">
                                (Click checkbox if yes)
                              </span>
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="Option1"
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer border-border accent-secondary bg-foreground"
                            {...register("routing.enable_table_routing")}
                          />

                          <div>
                            <p className="text-xs font-normal tracking-wide text-white">
                              Preselect tables using assistant{" "}
                              <span className="text-white/40">
                                (Click checkbox if yes)
                              </span>
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center w-full pt-2 space-x-2 border-t border-border">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-1 space-x-2 text-sm font-medium tracking-wide text-white transition-all duration-300 border-2 rounded-md border-secondary"
                  onClick={() => setCurrentTab("when_to_use")}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                      />
                    </svg>
                  </span>
                  <span>Back</span>
                </button>

                {update || (
                  <button
                    type="submit"
                    className="px-6 py-1.5 text-sm font-medium tracking-wide text-white transition-all duration-300 rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
                    disabled={!isValid || !isDirty}
                  >
                    Add
                  </button>
                )}

                {update && (
                  <button
                    type="button"
                    className="px-6 py-1.5 text-sm font-medium tracking-wide text-white transition-all duration-300 rounded-md bg-secondary hover:bg-secondary-foreground disabled:bg-[#193892]/25 disabled:text-white/25"
                    onClick={handleUpdate}
                  >
                    Update
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default DatasourceModal;

const ListDropdown = ({
  data,
  selectedDatasource,
  setDatasource,
  setValue,
  setSelectedType,
}) => {
  const [dropdownSelected, setDropdownSelected] = useState(false);

  useEffect(() => {
    const isSelected = selectedDatasource === data.id;
    setDropdownSelected(isSelected);
  }, [selectedDatasource, data]);

  const handleSelect = (datasource_id) => {
    if (dropdownSelected) {
      setDatasource(null);
      setSelectedType(null);
      setValue("datasource_id", "", { shouldValidate: true });
    } else {
      setDatasource(datasource_id);
      setSelectedType(data.ds_config?.ds_type);
      setValue("datasource_id", datasource_id, { shouldValidate: true });
    }
  };

  return (
    <li
      className={`flex items-center justify-between hover:bg-[#1E2022] px-2 py-1.5 text-xs font-medium border cursor-pointer rounded-md ${
        dropdownSelected
          ? "bg-[#1E2022] text-white border-secondary"
          : "text-white border-transparent"
      }`}
      onClick={() => handleSelect(data.id)}
    >
      <div className="flex items-center space-x-2">
        <span className="flex items-center justify-center">
          <svg
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 fill-white"
          >
            <path d="M10 17.5C7.90278 17.5 6.12847 17.1771 4.67708 16.5312C3.22569 15.8854 2.5 15.0972 2.5 14.1667V5.83333C2.5 4.91667 3.23264 4.13194 4.69792 3.47917C6.16319 2.82639 7.93056 2.5 10 2.5C12.0694 2.5 13.8368 2.82639 15.3021 3.47917C16.7674 4.13194 17.5 4.91667 17.5 5.83333V14.1667C17.5 15.0972 16.7743 15.8854 15.3229 16.5312C13.8715 17.1771 12.0972 17.5 10 17.5ZM10 7.52083C11.2361 7.52083 12.4792 7.34375 13.7292 6.98958C14.9792 6.63542 15.6806 6.25694 15.8333 5.85417C15.6806 5.45139 14.9826 5.06944 13.7396 4.70833C12.4965 4.34722 11.25 4.16667 10 4.16667C8.73611 4.16667 7.49653 4.34375 6.28125 4.69792C5.06597 5.05208 4.36111 5.4375 4.16667 5.85417C4.36111 6.27083 5.06597 6.65278 6.28125 7C7.49653 7.34722 8.73611 7.52083 10 7.52083ZM10 11.6667C10.5833 11.6667 11.1458 11.6389 11.6875 11.5833C12.2292 11.5278 12.7465 11.4479 13.2396 11.3438C13.7326 11.2396 14.1979 11.1111 14.6354 10.9583C15.0729 10.8056 15.4722 10.6319 15.8333 10.4375V7.9375C15.4722 8.13194 15.0729 8.30556 14.6354 8.45833C14.1979 8.61111 13.7326 8.73958 13.2396 8.84375C12.7465 8.94792 12.2292 9.02778 11.6875 9.08333C11.1458 9.13889 10.5833 9.16667 10 9.16667C9.41667 9.16667 8.84722 9.13889 8.29167 9.08333C7.73611 9.02778 7.21181 8.94792 6.71875 8.84375C6.22569 8.73958 5.76389 8.61111 5.33333 8.45833C4.90278 8.30556 4.51389 8.13194 4.16667 7.9375V10.4375C4.51389 10.6319 4.90278 10.8056 5.33333 10.9583C5.76389 11.1111 6.22569 11.2396 6.71875 11.3438C7.21181 11.4479 7.73611 11.5278 8.29167 11.5833C8.84722 11.6389 9.41667 11.6667 10 11.6667ZM10 15.8333C10.6389 15.8333 11.2882 15.7847 11.9479 15.6875C12.6076 15.5903 13.2153 15.4618 13.7708 15.3021C14.3264 15.1424 14.7917 14.9618 15.1667 14.7604C15.5417 14.559 15.7639 14.3542 15.8333 14.1458V12.1042C15.4722 12.2986 15.0729 12.4722 14.6354 12.625C14.1979 12.7778 13.7326 12.9062 13.2396 13.0104C12.7465 13.1146 12.2292 13.1944 11.6875 13.25C11.1458 13.3056 10.5833 13.3333 10 13.3333C9.41667 13.3333 8.84722 13.3056 8.29167 13.25C7.73611 13.1944 7.21181 13.1146 6.71875 13.0104C6.22569 12.9062 5.76389 12.7778 5.33333 12.625C4.90278 12.4722 4.51389 12.2986 4.16667 12.1042V14.1667C4.23611 14.375 4.45486 14.5764 4.82292 14.7708C5.19097 14.9653 5.65278 15.1424 6.20833 15.3021C6.76389 15.4618 7.375 15.5903 8.04167 15.6875C8.70833 15.7847 9.36111 15.8333 10 15.8333Z" />
          </svg>
        </span>
        <span className="text-sm font-normal tracking-wide text-white">
          {data.name}
        </span>

        <div className="flex items-center justify-center px-4 py-1.5 text-xs font-medium tracking-wide rounded-full text-[#5EAC92] bg-[#283237]">
          {data.ds_config?.ds_type === "semi_structured"
            ? "Semi-Structured"
            : data.ds_config?.ds_type === "sql_generator"
            ? "Structured"
            : "Structured"}
        </div>
      </div>

      {dropdownSelected && (
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3 h-3 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </span>
      )}
    </li>
  );
};
