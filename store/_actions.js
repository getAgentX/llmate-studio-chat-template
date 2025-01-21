import { createAction } from "@reduxjs/toolkit";

export const sseReceived = createAction("sse/received");
export const sseConnectionClosed = createAction("sse/connectionClosed");
