import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { skeletonLoader } from "./loaderSlice";
import axios from "axios";
import { error } from "./logSlice";

export const favStructureSlice = createSlice({
  name: "fav",
  initialState: {
    currentDisplayStructure: [],
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
      let res = action.payload.data;
      let index = action.payload.index;
      if (state.currentDisplayStructure[index] !== undefined) {
        state.currentDisplayStructure[index].name = res.name;
      }
    },
    updatePrivacy: (state, action) => {
      let res = action.payload;
      //console.log(res);
      state.currentDisplayStructure[res.key].privacy = res.payload.privacy;
    },
    updateFav: (state, action) => {
      let res = action.payload;
      state.currentDisplayStructure[res.key].favourite = res.payload.favourite;
    },
    popFromCurrentFavStack: (state, action) => {
      let res = action.payload;
      //console.log(res);
      function check(data) {
        return parseInt(res.data.id) === data.id && res.type === data.type;
      }
      let index = state.currentDisplayStructure.findIndex(check);

      //console.log(index);

      if (index !== -1) {
        state.currentDisplayStructure.splice(index, 1);
      }
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
    favUpdateAfterShare: (state, action) => {
      let index = action.payload.index;
      let users = action.payload.users;

      state.currentDisplayStructure[index].shared_among = users;
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
  favUpdateAfterShare,
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
      //console.log(err);
    });
};

export const favStructureAsync = () => (dispatch) => {
  dispatch(skeletonLoader());
  API.get(`/api/favourites/`)
    .then((res) => {
      dispatch(updateStructure(res.data));
      // dispatch(pathParse(res.data));
      dispatch(skeletonLoader());
    })
    .catch((err) => {
      dispatch(skeletonLoader());
      //console.log(err.response)
      dispatch(error(err.response.data.message));
    });
};

export const addFavouriteAsync = (data) => (dispatch) => {
  if (data.type === "file") {
    API.patch("/api/file/", data.payload)
      .then((res) => {
        let temp = res.data.id;
        res.data.id = temp.toString();
        let newdata = {
          data: res.data,
          type: "file",
        };
        dispatch(popFromCurrentFavStack(newdata));
      })
      .catch((err) => {
        //console.log(err.response)
        dispatch(error(err.response.data.message));
      });
  } else {
    API.patch("/api/folder/", data.payload)
      .then((res) => {
        let temp = res.data.id;
        res.data.id = temp.toString();
        let newdata = {
          data: res.data,
          type: "folder",
        };
        dispatch(popFromCurrentFavStack(newdata));
      })
      .catch((err) => {
        //console.log(err.response)
        dispatch(error(err.response.data.message));
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
        //console.log(err.response)
        dispatch(error(err.response.data.message));
      });
  } else {
    API.patch("/api/folder/", data.payload)
      .then((res) => {
        dispatch(updatePrivacy(data));
        // dispatch(updateSharePrivacy())
      })
      .catch((err) => {
        //console.log(err.response)
        dispatch(error(err.response.data.message));
      });
  }
};

export const selectFavStructure = (state) => state.fav.currentDisplayStructure;

export default favStructureSlice.reducer;
