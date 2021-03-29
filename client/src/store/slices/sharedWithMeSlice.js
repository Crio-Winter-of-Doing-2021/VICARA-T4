import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
// import {normalLoader} from './loaderSlice'
import axios from "axios";

export const SharedStructureSlice = createSlice({
  name: "sharedWithme",
  initialState: {
    currentDisplayStructure: {}
  },
  reducers: {
    updateStructure: (state, action) => {
      state.currentDisplayStructure = action.payload;
    },
    updatePath: (state, action) => {
      let res = action.payload;
      let path = "";
      let pathArr = res.PATH;

      let k;
      for (k = 0; k < pathArr.length; k++) {
        path = path + pathArr[k].NAME + " / ";
      }

      state.currentDisplayStructure[res.KEY] = {
        ...state.currentDisplayStructure[res.KEY],
        PATH: path,
      };
    },
  },
});

export const {
  updateStructure,
  updatePath
} = SharedStructureSlice.actions;

export const pathParse = (data) => (dispatch) => {
  let axi_data = [];
  Object.keys(data).forEach((key, index) => {
    let new_data = API.get(`/api/path/?id=${key}`);
    axi_data.push(new_data);
  });

  axios
    .all(axi_data)
    .then(
      axios.spread((...res) => {
        let k;
        for (k = 0; k < res.length; k++) {
          dispatch(updatePath(res[k].data));
        }
      })
    )
    .catch((err) => {
      console.log(err);
    });
};

export const sharedStructureAsync = () => (dispatch) => {
  API.get(`/api/shared-with-me/`)
    .then((res) => {
      dispatch(updateStructure(res.data));
    //   dispatch(pathParse(res.data));
    })
    .catch((err) => {
      console.log(err);
    });
};

export const selectSharedStructure = (state) => state.sharedWithme.currentDisplayStructure;

export default SharedStructureSlice.reducer;
