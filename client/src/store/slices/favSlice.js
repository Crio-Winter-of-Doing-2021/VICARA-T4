import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
// import {normalLoader} from './loaderSlice'
import axios from "axios";

export const favStructureSlice = createSlice({
  name: "fav",
  initialState: {
    currentDisplayStructure: {},
    currentPath: [
      {
        NAME: "ROOT",
        id: "ROOT",
      },
    ],
  },
  reducers: {
    updateStructure: (state, action) => {
      state.currentDisplayStructure = action.payload;
    },
    updateFavFileName: (state, action) => {
      let res = action.payload;
      if (state.currentDisplayStructure[res.id] !== undefined) {
        state.currentDisplayStructure[res.id].NAME = res.NAME;
      }
    },
    updatePrivacy: (state, action) => {
      let res = action.payload;
      state.currentDisplayStructure[res.id].PRIVACY = res.PRIVACY;
    },
    updateFav: (state, action) => {
      let res = action.payload;
      state.currentDisplayStructure[res.id].FAVOURITE = res.is_favourite;
    },
    popFromCurrentFavStack: (state, action) => {
      let res = action.payload;
      delete state.currentDisplayStructure[res.id];
      console.log(res);
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
  updateFavFileName,
  popFromCurrentFavStack,
  updateFav,
  updatePath,
  updatePrivacy,
} = favStructureSlice.actions;

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

export const favStructureAsync = () => (dispatch) => {
  API.get(`/api/favourites/`)
    .then((res) => {
      dispatch(updateStructure(res.data));
      dispatch(pathParse(res.data));
    })
    .catch((err) => {
      console.log(err);
    });
};

export const addFavouriteAsync = (data) => (dispatch) => {
  API.post("/api/favourites/", data)
    .then((res) => {
      console.log(data);
      dispatch(popFromCurrentFavStack(data));
    })
    .catch((err) => {
      console.log(err);
    });
};

export const privacyAsync = (data) => (dispatch) => {
  API.patch("/api/file/", data)
    .then((res) => {
      dispatch(updatePrivacy(data));
    })
    .catch((err) => {
      console.log(err);
    });
};

export const pathAsync = (data) => (dispatch) => {
  API.get(`/api/path/?id=${data}`)
    .then((res) => {
      dispatch(updatePath(res.data));
    })
    .catch((err) => {
      console.log(err);
    });
};

export const selectFavStructure = (state) => state.fav.currentDisplayStructure;

export default favStructureSlice.reducer;
