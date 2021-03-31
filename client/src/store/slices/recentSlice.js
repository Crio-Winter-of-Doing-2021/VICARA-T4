import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { skeletonLoader } from "./loaderSlice";
import axios from "axios";

export const recentStructureSlice = createSlice({
  name: "recent",
  initialState: {
    currentDisplayStructure: [],
  },
  reducers: {
    updateStructure: (state, action) => {
      state.currentDisplayStructure = action.payload;
    },
    updateRecentFileName: (state, action) => {
      let res = action.payload.data;
      let index = action.payload.index;
      if (state.currentDisplayStructure[index] !== undefined) {
        state.currentDisplayStructure[index].name = res.name;
      }
    },
    updatePrivacy: (state, action) => {
      let res = action.payload;
      console.log(res);
      state.currentDisplayStructure[res.key].privacy = res.payload.privacy;
    },
    popFromCurrentRecentStack: (state, action) => {
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
    updateFav: (state, action) => {
      let res = action.payload;
      state.currentDisplayStructure[res.key].favourite = res.payload.favourite;
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
  popFromCurrentRecentStack,
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
  dispatch(skeletonLoader());
  API.get(`/api/recent/`)
    .then((res) => {
      dispatch(updateStructure(res.data));
      dispatch(skeletonLoader());
      // dispatch(pathParse(res.data));
    })
    .catch((err) => {
      console.log(err);
      dispatch(skeletonLoader());
    });
};

export const addFavouriteAsync = (data) => (dispatch) => {
  if (data.type === "file") {
    API.patch("/api/file/", data.payload)
      .then((res) => {
        dispatch(updateFav(data));
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    API.patch("/api/folder/", data.payload)
      .then((res) => {
        dispatch(updateFav(data));
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

export const privacyAsync = (data) => (dispatch) => {
  if (data.type === "file") {
    API.patch("/api/file/", data.payload)
      .then((res) => {
        dispatch(updatePrivacy(data));
        // dispatch(updateSharePrivacy())
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    API.patch("/api/folder/", data.payload)
      .then((res) => {
        dispatch(updatePrivacy(data));
        // dispatch(updateSharePrivacy())
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

export const selectRecentStructure = (state) =>
  state.recent.currentDisplayStructure;

export default recentStructureSlice.reducer;
