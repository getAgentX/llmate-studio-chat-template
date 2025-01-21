import { createSlice } from "@reduxjs/toolkit";
import { sseReceived, sseConnectionClosed } from "./_actions";

const STREAMING_DELIMITER = "\n\n";

const sseSlice = createSlice({
  name: "sse",
  initialState: {
    events: [],
    isConnectionOpen: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sseReceived, (state, action) => {
        try {
          const new_event = action.payload;
          const new_events_batch = new_event
            .split(STREAMING_DELIMITER)
            .map((event) => {
              if (event === "") return null;
              return JSON.parse(atob(event));
            })
            .filter((event) => event !== null);
          state.events = state.events.concat(new_events_batch);
          state.isConnectionOpen = true;
        } catch (error) {
          console.log(error);
        }
      })
      .addCase(sseConnectionClosed, (state) => {
        state.events = [];
        state.isConnectionOpen = false;
      });
  },
});

export const sseReducerPath = "sse";
export const { reducer: sseReducer } = sseSlice;
export default sseSlice.reducer;
