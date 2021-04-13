import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import structureReducer from "./slices/structureSlice";
import checkboxReducer from "./slices/checkBoxSlice";
import loaderReducer from "./slices/loaderSlice";

import shareReducer from "./slices/shareSlice";

import logReducer from "./slices/logSlice";
import fileViewReducer from "./slices/fileViewSlice";
import moveReducer from "./slices/moveSlice";

export default configureStore({
  reducer: {
    auth: authReducer,
    structure: structureReducer,
    checkbox: checkboxReducer,
    loader: loaderReducer,
    share: shareReducer,

    log: logReducer,
    fileView: fileViewReducer,
    move: moveReducer,
  },
});
