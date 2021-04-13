import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { folderPickerLoader, normalLoader } from "./loaderSlice";
import { error } from "./logSlice";
import { resetSelection } from "./structureSlice";

export const moveSlice = createSlice({
  name: "move",
  initialState: {
    currentFolderPickerView: [],
    currentParent: {
      name: "",
      id: "",
    },
    currentNavigation: [
      {
        name: "ROOT",
        id: "ROOT",
      },
    ],
  },
  reducers: {
    setFolderPicker: (state, action) => {
      state.currentFolderPickerView = action.payload.children;
      state.currentParent = {
        name: action.payload.name,
        id: action.payload.id,
      };
    },
    updatePath: (state, action) => {
      state.currentNavigation = action.payload;
    },
  },
});

export const { setFolderPicker, updatePath } = moveSlice.actions;

export const getFolderPickerView = (current_parent) => (dispatch) => {
  dispatch(folderPickerLoader());
  API.get("/api/folder/picker/", {
    params: {
      id: current_parent,
    },
  })
    .then((res) => {
      dispatch(folderPickerLoader());
      dispatch(setFolderPicker(res.data));
    })
    .catch((err) => {
      dispatch(folderPickerLoader());
      console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const moveAsync = (props, data) => (dispatch) => {
  dispatch(normalLoader());
  API.post("/api/move/", data)
    .then((res) => {
      props.history.push(`/drive/${res.data.new_parent.id}`);
      dispatch(resetSelection());
      dispatch(normalLoader());
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
      dispatch(error(err.response.data.message));
      dispatch(normalLoader());
    });
};

export const pathAsync = (data) => (dispatch) => {
  // console.log("asking for path ");
  // console.log("token now = ", window.localStorage.getItem("access_token"));

  if (data.id === "ROOT") return;

  API.get(`/api/path/`, {
    params: {
      id: data.id,
      TYPE: data.type,
    },
  })
    .then((res) => {
      console.log("updating path for id = ", data, " with ", res);
      dispatch(updatePath(res.data));
    })
    .catch((err) => {
      console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const selectFolderView = (state) => state.move.currentFolderPickerView;
export const selectParent = (state) => state.move.currentParent.name;
export const selectParentId = (state) => state.move.currentParent.id;
export const selectPath = (state) => state.move.currentNavigation;

export default moveSlice.reducer;
