import userApi from "./user";
import chatApi from "./chat";
import appApi from "./apps";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  currentOrganizationReducer,
  currentOrganizationReducerPath,
} from "./current_organization";
import organizationApi from "./organization";

import { sseReducer, sseReducerPath } from "./_sse_reducer";
import streamApi from "./stream";
import publishedApps from "./publishedApps";

import datasourceApi from "./datasource";
import assistantApi from "./assistant";
import dashboardApi from "./dashboard";
import sqlApi from "./sql";
import messageApi from "./message";
import sql_datasource from "./sql_datasource";
import semi_structured_datasource from "./semi_structured_datasource";
import notebookApi from "./notebook";
import apiUserApi from "./apiuser";
import embedApi from "./embed";
import templatesApi from "./templates";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [appApi.reducerPath]: appApi.reducer,
    [currentOrganizationReducerPath]: currentOrganizationReducer,
    [organizationApi.reducerPath]: organizationApi.reducer,
    [sseReducerPath]: sseReducer,
    [streamApi.reducerPath]: streamApi.reducer,
    [publishedApps.reducerPath]: publishedApps.reducer,
    [datasourceApi.reducerPath]: datasourceApi.reducer,
    [assistantApi.reducerPath]: assistantApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [templatesApi.reducerPath]: templatesApi.reducer,
    [embedApi.reducerPath]: embedApi.reducer,
    [notebookApi.reducerPath]: notebookApi.reducer,
    [sqlApi.reducerPath]: sqlApi.reducer,
    [messageApi.reducerPath]: sqlApi.reducer,
    [sql_datasource.reducerPath]: sqlApi.reducer,
    [apiUserApi.reducerPath]: apiUserApi.reducer,
    [semi_structured_datasource.reducerPath]:
      semi_structured_datasource.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      chatApi.middleware,
      appApi.middleware,
      organizationApi.middleware,
      streamApi.middleware,
      publishedApps.middleware,
      datasourceApi.middleware,
      assistantApi.middleware,
      dashboardApi.middleware,
      templatesApi.middleware,
      embedApi.middleware,
      notebookApi.middleware,
      sqlApi.middleware,
      messageApi.middleware,
      sql_datasource.middleware,
      apiUserApi.middleware,
      semi_structured_datasource.middleware
    ),
});

setupListeners(store.dispatch);

export const AppDispatch = store.dispatch;
export const RootState = store.getState;
