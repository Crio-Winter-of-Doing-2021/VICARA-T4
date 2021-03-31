import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { normalLoader ,skeletonLoader} from "./loaderSlice";
import {updateSharePrivacy} from './shareSlice'

export const structureSlice = createSlice({
  name: "structure",
  initialState: {
    currentDisplayStructure: [],
    currentPath: [
      {
        name: "ROOT",
        id: "ROOT",
      },
    ],
  },
  reducers: {
    updateStructure: (state, action) => {
      state.currentDisplayStructure = action.payload.children;
    },
    pushToCurrentStack: (state, action) => {
      let res = action.payload;
      res.resData.type=res.type
      state.currentDisplayStructure.unshift(res.resData)

    },
    updateFileName: (state, action) => {
      let res = action.payload.data;
      let index=action.payload.index;
      if(state.currentDisplayStructure[index]!==undefined){
        state.currentDisplayStructure[index].name=res.name
      }
    },
    updatePrivacy: (state, action) => {
      let res = action.payload;
      console.log(res);
      state.currentDisplayStructure[res.key].privacy = res.payload.privacy;
    },
    updateFav: (state, action) => {
      let res = action.payload;
      state.currentDisplayStructure[res.key].favourite = res.payload.favourite;
    },
    popFromCurrentStack: (state, action) => {
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
    updatePath: (state, action) => {
      state.currentPath = action.payload;
    },
  },
});

export const {
  updateStructure,
  pushToCurrentStack,
  updateFileName,
  popFromCurrentStack,
  updateFav,
  updatePath,
  updatePrivacy,
} = structureSlice.actions;

export const structureAsync = (uni_id) => (dispatch) => {
  console.log("Sending request for /api/folder/");
  dispatch(skeletonLoader())
  API.get(`/api/folder/`, {
    params: {
      id: uni_id,
    },
  })
    .then((res) => {
      dispatch(updateStructure(res.data));
      dispatch(skeletonLoader())
    })
    .catch((err) => {
      console.log(err);
      dispatch(skeletonLoader())
    });
};

export const addFolderAsync = (data) => (dispatch) => {
  dispatch(normalLoader());
  API.post("/api/folder/", data)
    .then((res) => {
      console.log(res);
      let newData = {
        resData: res.data,
        type: "folder",
      };
      dispatch(pushToCurrentStack(newData));
      dispatch(normalLoader());
    })
    .catch((err) => {
      console.log(err);
      dispatch(normalLoader());
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

export const pathAsync = (data) => (dispatch) => {
  console.log("asking for path ");
  console.log("token now = ", window.localStorage.getItem("session"));
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
      console.log(err);
    });
};

export const getFileAsync=(data)=>(dispatch)=>{
  dispatch(normalLoader());
  API.get(`/api/file/stream-file/`,{
    params:{
      id:data
    }
  }).then(res=>{
    console.log(res)
    dispatch(normalLoader());
  }).catch(err=>{
    console.log(err)
    dispatch(normalLoader());
  })
}

export const selectStructure = (state) =>
  state.structure.currentDisplayStructure;
export const navStructure = (state) => state.structure.currentPath;

export default structureSlice.reducer;
