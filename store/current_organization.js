import { createAction, createReducer } from "@reduxjs/toolkit";

export const setCurrentOrganization = createAction(
  "currentOrganization/setCurrentOrganization"
);

const cookieName = "currentOrganization";

export const getLocalStoreOrganization = () => {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const storedObject = localStorage.getItem(cookieName) || null;
  const localValue = JSON.parse(storedObject);

  return localValue;
};

export const currentOrganizationReducer = createReducer(null, (builder) => {
  // builder.addCase(setCurrentOrganization, (state, action) => {
  //   return action.payload;
  // });

  builder.addCase(setCurrentOrganization, (state, action) => {
    if (action.payload) {
      const jsonString = JSON.stringify(action.payload);
      localStorage.setItem(cookieName, jsonString);
    } else {
      localStorage.removeItem(cookieName);
    }

    return action.payload;
  });
});

export const currentOrganizationReducerPath = "currentOrganization";

export const currentOrganizationSelector = (state) =>
  state[currentOrganizationReducerPath];
