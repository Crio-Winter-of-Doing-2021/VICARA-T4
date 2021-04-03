import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { skeletonLoader } from "./loaderSlice";
import {error} from './logSlice'

export const SharedStructureSlice = createSlice({
  name: "sharedWithme",
  initialState: {
    currentDisplayStructure: [],
  },
  reducers: {
    updateStructure: (state, action) => {
      state.currentDisplayStructure = action.payload;
    },
  },
});

export const { updateStructure, updatePath } = SharedStructureSlice.actions;

export const sharedStructureAsync = () => (dispatch) => {
  dispatch(skeletonLoader());
  API.get(`/api/shared-with-me/`)
    .then((res) => {
      dispatch(updateStructure(res.data));
      dispatch(skeletonLoader());
    })
    .catch((err) => {
      dispatch(skeletonLoader());
        console.log(err.response)
        dispatch(error(err.response.data.message))
    });
};

export const selectSharedStructure = (state) =>
  state.sharedWithme.currentDisplayStructure;

export default SharedStructureSlice.reducer;
