import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
// import {normalLoader} from './loaderSlice'
import axios from "axios";

export const recentStructureSlice = createSlice({
  name: "recent",
  initialState: {
    currentDisplayStructure: {}
  },
  reducers: {
    updateStructure: (state, action) => {
      state.currentDisplayStructure = action.payload;
    },
    updateRecentFileName: (state, action) => {
      let res = action.payload;
      if (state.currentDisplayStructure[res.id] !== undefined) {
        state.currentDisplayStructure[res.id].NAME = res.NAME;
      }
    },
    updatePrivacy: (state, action) => {
      let res = action.payload;
      state.currentDisplayStructure[res.id].PRIVACY = res.PRIVACY;
    },
    popFromCurrentRecentStack: (state, action) => {
        let res = action.payload;
        delete state.currentDisplayStructure[res.id];
        console.log(res);
      },
    updateFav: (state, action) => {
      let res = action.payload;
      state.currentDisplayStructure[res.id].FAVOURITE = res.is_favourite;
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
  updateRecentFileName,
  updateFav,
  updatePath,
  updatePrivacy,
  popFromCurrentRecentStack
} = recentStructureSlice.actions;

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

export const recentStructureAsync = () => (dispatch) => {
  API.get(`/api/recent/`)
    .then((res) => {
      dispatch(updateStructure(res.data));
      dispatch(pathParse(res.data));
    })
    .catch((err) => {
      console.log(err);
    });
};

export const addRecentAsync=(data)=>(dispatch)=>{
  API.post(`/api/recent/`,{id:data}).then(res=>{
    console.log(res)
  }).catch(err=>{
    console.log(err)
  })
}

export const selectRecentStructure = (state) => state.recent.currentDisplayStructure;

export default recentStructureSlice.reducer;
