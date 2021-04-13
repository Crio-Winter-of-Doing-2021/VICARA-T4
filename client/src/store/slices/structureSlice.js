import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { normalLoader, skeletonLoader, navSearchLoader } from "./loaderSlice";
import { updateStorageData } from "./authSlice";
// import {updateSharePrivacy} from './shareSlice'
import { success, error } from "./logSlice";

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
    children: {},
    navSearchResults: [],
    orderBy: "last_modified",
    replaceModal: {
      show: false,
      type: "",
      data: [],
      requestData: {},
    },
  },
  reducers: {
    updateStructure: (state, action) => {
      state.currentDisplayStructure = action.payload.children;
    },
    pushToCurrentStack: (state, action) => {
      let res = action.payload;
      res.resData.type = res.type;
      state.currentDisplayStructure.unshift(res.resData);
    },
    updateFileName: (state, action) => {
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
    popFromCurrentStack: (state, action) => {
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
      state.currentPath = action.payload;
    },
    updateAfterShare: (state, action) => {
      let index = action.payload.index;
      let users = action.payload.users;

      state.currentDisplayStructure[index].shared_among = users;
    },
    updateNavSearchResults: (state, action) => {
      state.navSearchResults = action.payload;
    },
    updateChild: (state, action) => {
      const child = action.payload;
      const id = `${child.type}_${child.id}`;
      state.children[id] = {
        ...child,
        selected: false,
      };
    },
    resetChildren: (state, action) => {
      state.children = {};
    },
    updateSelection: (state, action) => {
      const { id, type, selected } = action.payload;
      const stateId = `${type}_${id}`;
      state.children[stateId] = {
        ...state.children[stateId],
        selected,
      };
    },
    resetSelection: (state, action) => {
      const childrenMap = state.children;

      Object.keys(childrenMap).forEach(function (key, index) {
        state.children[key] = {
          ...state.children[key],
          selected: false,
        };
      });
    },
    selectAll: (state, action) => {
      const childrenMap = state.children;
      Object.keys(childrenMap).forEach(function (key, index) {
        state.children[key] = {
          ...state.children[key],
          selected: true,
        };
      });
    },
    removeFromChildren: (state, action) => {
      const { id, type } = action.payload;

      console.log("payload", action.payload);

      const stateId = `${type}_${id}`;
      console.log("removing", stateId);
      delete state.children[stateId];
    },
    setOrderBy: (state, action) => {
      state.orderBy = action.payload;
    },
    toggleReplaceModal: (state, action) => {
      state.replaceModal.show = !state.replaceModal.show;
      if (action.payload !== undefined) {
        state.replaceModal.type = action.payload.type;
        state.replaceModal.data = action.payload.data;
        state.replaceModal.requestData = action.payload.requestData;
      }
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
  updateAfterShare,
  updateChild,
  resetChildren,
  updateSelection,
  resetSelection,
  selectAll,
  updateNavSearchResults,
  removeFromChildren,
  setOrderBy,
  toggleReplaceModal,
} = structureSlice.actions;

export const structureAsync = (uni_id) => (dispatch) => {
  //console.log("Sending request for /api/folder/");
  dispatch(skeletonLoader());
  API.get(`/api/folder/`, {
    params: {
      id: uni_id,
    },
  })
    .then((res) => {
      res.data.children.forEach((child) => dispatch(updateChild(child)));
      dispatch(skeletonLoader());
    })
    .catch((err) => {
      //console.log(err);
      dispatch(skeletonLoader());
      // dispatch(error(err.response.data.message));
    });
};
export const recentStructureAsync = () => (dispatch) => {
  dispatch(skeletonLoader());
  API.get(`/api/recent/`)
    .then((res) => {
      res.data.forEach((child) => dispatch(updateChild(child)));
      dispatch(skeletonLoader());
    })
    .catch((err) => {
      dispatch(skeletonLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const favStructureAsync = () => (dispatch) => {
  dispatch(skeletonLoader());
  API.get(`/api/favourites/`)
    .then((res) => {
      res.data.forEach((child) => dispatch(updateChild(child)));
      dispatch(skeletonLoader());
    })
    .catch((err) => {
      dispatch(skeletonLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const sharedStructureAsync = () => (dispatch) => {
  dispatch(skeletonLoader());
  API.get(`/api/shared-with-me/`)
    .then((res) => {
      res.data.forEach((child) => dispatch(updateChild(child)));
      dispatch(skeletonLoader());
    })
    .catch((err) => {
      dispatch(skeletonLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const trashStructureAsync = () => (dispatch) => {
  dispatch(skeletonLoader());
  API.get(`/api/trash/`)
    .then((res) => {
      res.data.forEach((child) => dispatch(updateChild(child)));
      dispatch(skeletonLoader());
      // dispatch(pathParse(res.data));
    })
    .catch((err) => {
      dispatch(skeletonLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const addFolderAsync = (data) => (dispatch) => {
  dispatch(normalLoader());
  API.post("/api/folder/", data)
    .then((res) => {
      console.log("succ in add folder");
      console.log({ res });
      dispatch(updateChild(res.data));
      const { readable, ratio } = res.data;
      dispatch(updateStorageData({ readable, ratio }));
      dispatch(normalLoader());
      dispatch(success("Your Action was Successful"));
    })
    .catch((err) => {
      dispatch(normalLoader());
      const statusCode = err.response.request.status;

      if (
        statusCode === 400 &&
        err.response.data.error_code === "DUPLICATE_FOLDER"
      ) {
        dispatch(
          toggleReplaceModal({
            type: "folder",
            data: err.response.data.data,
            requestData: {
              url: "/api/folder/",
              formData: { ...data, REPLACE: "true" },
            },
          })
        );
      } else {
        dispatch(error(err.response.data.message));
      }
    });
};

export const updateChildAsync = (data) => (dispatch) => {
  const { type, ...rest } = data;
  dispatch(normalLoader());
  if (type === "file") {
    API.patch("/api/file/", rest)
      .then((res) => {
        dispatch(updateChild(res.data));
        dispatch(normalLoader());
        dispatch(resetSelection());
      })
      .catch((err) => {
        //console.log(err);
        dispatch(normalLoader());
        dispatch(resetSelection());
      });
  } else {
    API.patch("/api/folder/", rest)
      .then((res) => {
        dispatch(updateChild(res.data));
        dispatch(normalLoader());
        dispatch(resetSelection());
      })
      .catch((err) => {
        //console.log(err.response);
        dispatch(error(err.response.data.message));
        dispatch(normalLoader());
        dispatch(resetSelection());
      });
  }
};
export const privacyAsync = 5;
export const pathAsync = (data) => (dispatch) => {
  //console.log("asking for path ");
  //console.log("token now = ", window.localStorage.getItem("access_token"));
  if (data.id === "ROOT") return;
  API.get(`/api/path/`, {
    params: {
      id: data.id,
      TYPE: data.type,
    },
  })
    .then((res) => {
      //console.log("updating path for id = ", data, " with ", res);
      dispatch(updatePath(res.data));
    })
    .catch((err) => {
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const getFileAsync = (data) => (dispatch) => {
  dispatch(normalLoader());

  API.get(`/api/file/download/`, {
    params: {
      id: data,
    },
  })
    .then((res) => {
      // //console.log("in blobbbbbbbbbbbbbb", res.data["url"]);
      window.open(res.data.url);
      // saveAs(res.data["url"], "image.jpg");
      dispatch(normalLoader());
    })
    .catch((err) => {
      // //console.log("ommaago its an errro", err);
      dispatch(normalLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const searchFileFolderAsync = (value) => (dispatch) => {
  dispatch(navSearchLoader());
  API.get("/api/search-file-folder/", {
    params: {
      query: value,
    },
  })
    .then((res) => {
      dispatch(updateNavSearchResults(res.data));
      dispatch(navSearchLoader());
    })
    .catch((err) => {
      //console.log(err);
      dispatch(error(err.response.data.message));
      dispatch(navSearchLoader());
    });
};

export const selectStructure = (state) =>
  state.structure.currentDisplayStructure;

export const selectChildren = (state) => {
  const childrenMap = state.structure.children;
  const childrenArray = Object.keys(childrenMap).map(function (key, index) {
    return childrenMap[key];
  });
  return childrenArray;
};
export const selectFavourite = (state) => {
  const childrenMap = state.structure.children;
  const childrenArray = Object.keys(childrenMap).map(function (key, index) {
    return childrenMap[key];
  });
  const favouriteArray = childrenArray.filter((ele) => ele.favourite);
  return favouriteArray;
};
export const selectChecked = (state) => {
  const childrenMap = state.structure.children;
  const childrenArray = Object.keys(childrenMap).map(function (key, index) {
    return childrenMap[key];
  });
  const checkedArray = childrenArray.filter((ele) => ele.selected);
  return checkedArray;
};

export const selectCheckedCount = (state) => {
  let checkedCount = 0;
  const childrenMap = state.structure.children;
  Object.keys(childrenMap).forEach(function (key, index) {
    if (childrenMap[key].selected) {
      checkedCount++;
    }
  });
  return checkedCount;
};
export const navStructure = (state) => state.structure.currentPath;
export const selectOrderBy = (state) => state.structure.orderBy;
export const selectNavSearchResults = (state) =>
  state.structure.navSearchResults;

export const selectReplaceModal = (state) => state.structure.replaceModal;
export default structureSlice.reducer;
