import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { skeletonLoader } from "./loaderSlice";
import {error} from './logSlice'
// import axios from "axios";

export const trashStructureSlice = createSlice({
  name: "trash",
  initialState: {
    currentDisplayStructure: [],
  },
  reducers: {
    updateStructure: (state, action) => {
      state.currentDisplayStructure = action.payload;
    },
    popFromCurrentTrashStack: (state, action) => {
      let res = action.payload;
      console.log(res);
      function check(data) {
        return parseInt(res.data.id) === data.id && res.type === data.type;
      }
      let index = state.currentDisplayStructure.findIndex(check);

      console.log(index);

      if (index !== -1) {
        state.currentDisplayStructure.splice(index, 1);
      }
    },
  },
});

export const {
  updateStructure,
  popFromCurrentTrashStack,
} = trashStructureSlice.actions;

export const trashStructureAsync = () => (dispatch) => {
  dispatch(skeletonLoader());
  API.get(`/api/trash/`)
    .then((res) => {
      dispatch(updateStructure(res.data));
      dispatch(skeletonLoader());
      // dispatch(pathParse(res.data));
    })
    .catch((err) => {
      dispatch(skeletonLoader());
        console.log(err.response)
        dispatch(error(err.response.data.message))
    });
};

export const selectTrashStructure = (state) =>
  state.trash.currentDisplayStructure;

export default trashStructureSlice.reducer;
