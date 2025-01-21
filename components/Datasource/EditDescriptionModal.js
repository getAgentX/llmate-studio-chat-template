import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SelectOption from "../common/SelectOption";
import {
  useAutofillWithAiMutation,
  useGetDatasourceDbConnectionMutation,
} from "@/store/datasource";
import AutoFillModal from "../Modal/AutoFillModal";
import { useRouter } from "next/router";

const EditDescriptionModal = ({
  show,
  setShow,
  data,
  handleUpdateTable,
  updateLoading,
}) => {
  const modalRef = useRef(null);
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);
  const [dbConnection, setDbConnection] = useState(null);

  const [autofillWithAi, { data: aiRes, isLoading, error }] =
    useAutofillWithAiMutation();

  const [
    getDatasourceDbConnection,
    { error: errorDbConnection, isLoading: dbLoading },
  ] = useGetDatasourceDbConnectionMutation();

  const router = useRouter();

  useEffect(() => {
    if (router?.query?.slug) {
      getDatasourceDbConnection({ datasource_id: router?.query?.slug }).then(
        (response) => {
          if (response.data) {
            setDbConnection(response.data);
          }
        }
      );
    }
  }, [router?.query?.slug]);

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
      current_table_name: data.name || "",
      table: data || {
        name: "",
        description: "",
        columns: [],
        formulae: {},
      },
    },
  });

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [show]);

  const handleSaveChanges = () => {
    const formData = getValues();
    handleUpdateTable(formData);
  };

  const handleGenerate = (payload) => {
    const table = getValues(`table`);

    if (!payload || !table) {
      console.error("Invalid payload or table:", payload, table);
      return;
    }

    const dataSchema = {
      ...payload,
      table: table,
      db_connection: dbConnection,
    };

    autofillWithAi({ payload: dataSchema })
      .then((response) => {
        if (response.data) {
          setValue(`table`, response.data, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setShowAutoFillModal(false);
        } else {
          console.error("No data returned from API", response);
        }
      })
      .catch((err) => {
        console.error("API call failed", err);
      });
  };

  const columns = watch("table");

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
        show ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 w-full max-w-5xl overflow-x-hidden overflow-y-auto border-l border-border-color bg-page recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col">
          <div className="sticky top-0 left-0 z-50 flex items-center justify-between w-full px-4 py-2 border-b bg-page border-border-color">
            <div className="flex items-center space-x-4 text-sm font-medium tracking-wide text-primary-text">
              <span
                className="flex items-center justify-center"
                onClick={() => setShow(false)}
              >
                <svg
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-icon-color hover:fill-icon-color-hover"
                >
                  <path
                    fill-rule="evenodd"
                    clipRule="evenodd"
                    d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                  />
                </svg>
              </span>

              <span>Edit Descriptions</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center justify-center w-full h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide rounded-md max-w-fit text-btn-primary-outline-text hover:bg-btn-primary-outline-hover bg-transparent group"
                  onClick={() => setShowAutoFillModal(!showAutoFillModal)}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 12 13"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 fill-btn-primary-outline-icon"
                    >
                      <g clip-path="url(#clip0_4961_18587)">
                        <path d="M4.87599 12.501C4.75747 12.5016 4.6416 12.466 4.54385 12.399C4.4461 12.332 4.37113 12.2367 4.32896 12.126L3.39521 9.69786C3.37629 9.64893 3.34736 9.6045 3.31027 9.5674C3.27318 9.53031 3.22874 9.50138 3.17981 9.48247L0.750986 8.54802C0.640348 8.50555 0.545186 8.43054 0.47806 8.33288C0.410934 8.23521 0.375 8.11949 0.375 8.00099C0.375 7.88248 0.410934 7.76676 0.47806 7.6691C0.545186 7.57143 0.640348 7.49642 0.750986 7.45396L3.17911 6.52021C3.22804 6.50129 3.27248 6.47236 3.30957 6.43527C3.34666 6.39818 3.37559 6.35374 3.3945 6.30481L4.32896 3.87599C4.37142 3.76535 4.44643 3.67019 4.54409 3.60306C4.64176 3.53593 4.75748 3.5 4.87599 3.5C4.99449 3.5 5.11021 3.53593 5.20788 3.60306C5.30554 3.67019 5.38055 3.76535 5.42302 3.87599L6.35677 6.30411C6.37568 6.35304 6.40461 6.39748 6.4417 6.43457C6.47879 6.47166 6.52323 6.50059 6.57216 6.5195L8.98622 7.44833C9.10136 7.49101 9.20056 7.56813 9.2703 7.6692C9.34004 7.77027 9.37695 7.89038 9.37599 8.01317C9.3742 8.12962 9.3375 8.24284 9.27064 8.3382C9.20379 8.43355 9.10985 8.50665 9.00099 8.54802L6.57286 9.48177C6.52393 9.50068 6.4795 9.52961 6.4424 9.5667C6.40531 9.60379 6.37638 9.64823 6.35747 9.69716L5.42302 12.126C5.38084 12.2367 5.30587 12.332 5.20812 12.399C5.11037 12.466 4.9945 12.5016 4.87599 12.501Z" />
                        <path d="M2.06246 4.62494C1.99298 4.62493 1.92513 4.60388 1.86785 4.56455C1.81057 4.52522 1.76656 4.46946 1.7416 4.40462L1.34644 3.37712C1.33788 3.35465 1.32466 3.33424 1.30765 3.31724C1.29065 3.30023 1.27024 3.28702 1.24777 3.27845L0.220268 2.88329C0.155435 2.85833 0.0996864 2.81431 0.0603664 2.75703C0.0210464 2.69975 0 2.63191 0 2.56244C0 2.49296 0.0210464 2.42512 0.0603664 2.36784C0.0996864 2.31056 0.155435 2.26654 0.220268 2.24158L1.24777 1.84642C1.27022 1.83782 1.29061 1.82458 1.30761 1.80758C1.3246 1.79058 1.33784 1.7702 1.34644 1.74775L1.73808 0.729388C1.76017 0.669436 1.79817 0.616635 1.84802 0.576662C1.89786 0.536689 1.95765 0.511054 2.02097 0.502513C2.09699 0.493272 2.17392 0.509673 2.23956 0.549116C2.3052 0.588559 2.35579 0.648787 2.38332 0.720248L2.77847 1.74775C2.78707 1.7702 2.80031 1.79058 2.81731 1.80758C2.83431 1.82458 2.85469 1.83782 2.87714 1.84642L3.90464 2.24158C3.96948 2.26654 4.02523 2.31056 4.06455 2.36784C4.10387 2.42512 4.12491 2.49296 4.12491 2.56244C4.12491 2.63191 4.10387 2.69975 4.06455 2.75703C4.02523 2.81431 3.96948 2.85833 3.90464 2.88329L2.87714 3.27845C2.85467 3.28702 2.83426 3.30023 2.81726 3.31724C2.80025 3.33424 2.78704 3.35465 2.77847 3.37712L2.38332 4.40462C2.35836 4.46946 2.31434 4.52522 2.25706 4.56455C2.19978 4.60388 2.13194 4.62493 2.06246 4.62494Z" />
                        <path d="M9.3747 6.50014C9.2989 6.50012 9.2249 6.47713 9.16243 6.4342C9.09996 6.39127 9.05197 6.33042 9.02478 6.25967L8.48946 4.86819C8.48005 4.84367 8.46558 4.8214 8.44701 4.80283C8.42844 4.78425 8.40617 4.76979 8.38165 4.76037L6.99017 4.22506C6.91947 4.19782 6.85869 4.14981 6.81582 4.08735C6.77295 4.02488 6.75 3.9509 6.75 3.87514C6.75 3.79938 6.77295 3.7254 6.81582 3.66293C6.85869 3.60047 6.91947 3.55246 6.99017 3.52522L8.38165 2.98991C8.40617 2.98049 8.42844 2.96603 8.44701 2.94745C8.46558 2.92888 8.48005 2.90661 8.48946 2.88209L9.02079 1.50045C9.04505 1.43512 9.08656 1.37758 9.14091 1.33395C9.19527 1.29033 9.26043 1.26226 9.32946 1.25272C9.41242 1.24268 9.49635 1.26063 9.56794 1.30373C9.63953 1.34682 9.69467 1.4126 9.72462 1.49061L10.2599 2.88209C10.2693 2.90661 10.2838 2.92888 10.3024 2.94745C10.321 2.96603 10.3432 2.98049 10.3677 2.98991L11.7592 3.52522C11.8299 3.55246 11.8907 3.60047 11.9336 3.66293C11.9765 3.7254 11.9994 3.79938 11.9994 3.87514C11.9994 3.9509 11.9765 4.02488 11.9336 4.08735C11.8907 4.14981 11.8299 4.19782 11.7592 4.22506L10.3677 4.76037C10.3432 4.76979 10.321 4.78425 10.3024 4.80283C10.2838 4.8214 10.2693 4.84367 10.2599 4.86819L9.72462 6.25967C9.69743 6.33042 9.64944 6.39127 9.58697 6.4342C9.5245 6.47713 9.45049 6.50012 9.3747 6.50014Z" />
                      </g>
                      <defs>
                        <clipPath id="clip0_4961_18587">
                          <rect
                            width="12"
                            height="12"
                            fill="white"
                            transform="translate(0 0.5)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>

                  <span>Fill with AI</span>
                </button>

                {showAutoFillModal && (
                  <AutoFillModal
                    setShowAutoFillModal={setShowAutoFillModal}
                    handleGenerate={handleGenerate}
                    isLoading={isLoading}
                  />
                )}
              </div>

              <button
                type="button"
                className="flex items-center justify-center h-8 px-4 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary disabled:bg-btn-primary-disable disabled:text-btn-primary-disable-text"
                onClick={handleSaveChanges}
                disabled={!isDirty || !isValid || updateLoading}
              >
                {updateLoading && (
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-3 h-3 animate-spin text-primary-text fill-btn-primary"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>

                    <span className="sr-only">Loading...</span>
                  </div>
                )}

                <span className="text-nowrap">Save</span>
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center w-full h-full min-h-96 max-h-96">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 animate-spin text-[#383A40] fill-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>

                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}

          {isLoading || (
            <div className="flex flex-col w-full p-4 space-y-3 rounded-md bg-page">
              <div className="flex flex-col space-y-3">
                <p className="text-xs font-medium tracking-wide text-primary-text">
                  Table Description
                </p>

                <textarea
                  type="text"
                  className="w-full px-4 py-3 overflow-y-auto text-xs leading-6 bg-transparent border rounded-md outline-none resize-y 2xl:text-sm text-input-text min-h-28 border-input-border focus:border-input-border-focus placeholder:text-input-placeholder recent__bar"
                  placeholder="Enter column description here"
                  {...register(`table.description`, {
                    required: false,
                  })}
                />
              </div>

              {columns?.columns?.map((column, i) => {
                return (
                  <GenerateCol
                    data={column}
                    index={i}
                    register={register}
                    control={control}
                    setValue={setValue}
                    getValues={getValues}
                    key={column.id || i}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDescriptionModal;

const GenerateCol = ({
  data,
  index,
  register,
  control,
  setValue,
  getValues,
}) => {
  if (!data) {
    return null;
  }

  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (data.examples && data.examples.length > 0) {
      setTags(data.examples);
    } else {
      setTags([]);
    }
  }, [data]);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setTags([...tags, inputValue.trim()]);
      setInputValue("");

      setValue(`table.columns.${index}.examples`, [...tags, inputValue.trim()]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);

    setValue(`table.columns.${index}.examples`, updatedTags);
  };

  const handleSelect = (value) => {};

  const optionsCardinality = [
    { value: "high", label: "High" },
    { value: "low", label: "Low" },
  ];

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <div className="flex w-full space-x-4">
          <div className="flex flex-col w-64 space-y-4">
            {index === 0 && (
              <p className="text-xs font-medium tracking-wide text-secondary-text">
                Column name
              </p>
            )}

            <p className="text-sm font-medium tracking-wide text-primary-text line-clamp-1">
              {data?.name}
            </p>

            {data?.col_type === "date" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-green-200  bg-green-800 rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {data?.col_type === "string" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-[#A3CAFF]  bg-[#313F71] rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {data?.col_type === "number" && (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-[#C4A3FF]  bg-[#4F4062] rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}

            {["number", "string", "date"].includes(data?.col_type) || (
              <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-yellow-100 capitalize bg-yellow-800 rounded-full max-w-fit">
                {data?.col_type}
              </span>
            )}
          </div>

          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs font-medium tracking-wide text-secondary-text">
                Cardinality
              </p>
            )}

            <Controller
              name={`table.columns.${index}.cardinality`}
              control={control}
              rules={{ required: "Model selection is required" }}
              render={({
                field: { onChange, value, ref },
                fieldState: { error },
              }) => (
                <SelectOption
                  options={optionsCardinality}
                  onSelect={(value) => {
                    onChange(value.value);
                    handleSelect(value);
                  }}
                  placeholder="Choose cardinality"
                  value={optionsCardinality.find(
                    (option) => option.value === value
                  )}
                  defaultValue={{
                    value: data.cardinality,
                    label: data.cardinality,
                  }}
                  bgColor="var(--bg-secondary)"
                  borderColor="var(--input-border)"
                />
              )}
            />
          </div>
        </div>
      </div>

      <div className="col-span-8">
        <div className="flex w-full space-x-4">
          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs font-medium tracking-wide text-secondary-text">
                Description
              </p>
            )}

            <textarea
              type="text"
              className="w-full px-4 py-3 overflow-y-auto text-xs leading-6 bg-transparent border rounded-md outline-none resize-y 2xl:text-sm text-input-text min-h-28 border-input-border  focus:border-input-border-focus placeholder:text-input-placeholder recent__bar"
              placeholder="Enter column description here"
              {...register(`table.columns.${index}.description`, {
                required: false,
              })}
            />
          </div>

          <div className="flex flex-col w-full space-y-4">
            {index === 0 && (
              <p className="text-xs font-medium tracking-wide text-secondary-text">
                Sample values
              </p>
            )}
            <div className="flex flex-col px-2 py-1 space-y-1 overflow-y-auto border rounded-md bg-page h-28 border-input-border recent__bar">
              {tags?.map((tag) => {
                return (
                  <button
                    type="button"
                    className="flex items-center justify-between px-2 py-2 text-xs font-medium rounded-full cursor-auto text-primary-text bg-page-hover"
                  >
                    <span>{tag}</span>

                    <span
                      className="flex items-center justify-center cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
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
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </span>
                  </button>
                );
              })}

              <textarea
                type="text"
                className="flex-1 w-full px-1 py-2 text-xs bg-transparent outline-none resize-none 2xl:text-sm text-input-text min-h-20 placeholder:text-input-placeholder recent__bar"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Enter sample values here"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
