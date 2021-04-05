import { createSlice } from "@reduxjs/toolkit";

export const logSlice = createSlice({
  name: "log",
  initialState: {
    logData: {
      show: false,
      type: "",
      feed: "",
    },
  },
  reducers: {
    success: (state, action) => {
      state.logData.show = true;
      state.logData.type = "success";
      state.logData.feed = action.payload;
    },
    error: (state, action) => {
      if(action.payload===undefined) state.logData.show=false
      else state.logData.show=true
      state.logData.feed = action.payload;
      state.logData.type = "error";
      
    },
    defaultLog: (state) => {
      state.logData = {
        ...state.logData,
        show: false,
      };
    },
  },
});

export const { success, error, defaultLog } = logSlice.actions;

export const selectLogs = (state) => state.log.logData;

export default logSlice.reducer;
