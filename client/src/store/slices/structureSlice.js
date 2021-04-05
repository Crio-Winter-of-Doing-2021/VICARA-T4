import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { normalLoader, skeletonLoader } from "./loaderSlice";

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
    updateAfterShare: (state, action) => {
      let index = action.payload.index;
      let users = action.payload.users;

      state.currentDisplayStructure[index].shared_among = users;
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
} = structureSlice.actions;

export const structureAsync = (uni_id) => (dispatch) => {
  console.log("Sending request for /api/folder/");
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
      console.log(err);
      dispatch(skeletonLoader());
      dispatch(error(err.response.data.message));
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
      console.log(err.response);
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
      console.log(err.response);
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
      console.log(err.response);
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
      console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const addFolderAsync = (data) => (dispatch) => {
  dispatch(normalLoader());
  API.post("/api/folder/", data)
    .then((res) => {
      console.log(res);
      dispatch(updateChild(res.data));
      dispatch(normalLoader());
      dispatch(success("Your Action was Successful"));
    })
    .catch((err) => {
      console.log("entered");
      dispatch(normalLoader());
      console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const toggleFavouriteAsync = (data) => (dispatch) => {
  console.log({ data });
  const { type, id, favourite } = data;
  if (type === "file") {
    API.patch("/api/file/", { id, favourite })
      .then((res) => {
        dispatch(updateChild(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    API.patch("/api/folder/", { id, favourite })
      .then((res) => {
        dispatch(updateChild(res.data));
      })
      .catch((err) => {
        console.log(err.response);
        dispatch(error(err.response.data.message));
      });
  }
};
export const privacyAsync = 5;
export const togglePrivacyAsync = (data) => (dispatch) => {
  const { type, id, privacy } = data;
  if (type === "file") {
    API.patch("/api/file/", { id, privacy })
      .then((res) => {
        dispatch(updateChild(res.data));
        // dispatch(updateSharePrivacy())
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    API.patch("/api/folder/", { id, privacy })
      .then((res) => {
        dispatch(updateChild(res.data));
        // dispatch(updateSharePrivacy())
      })
      .catch((err) => {
        console.log(err.response);
        dispatch(error(err.response.data.message));
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
      console.log(err.response);
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
      // console.log("in blobbbbbbbbbbbbbb", res.data["url"]);
      window.open(res.data.url);
      // saveAs(res.data["url"], "image.jpg");
      dispatch(normalLoader());
    })
    .catch((err) => {
      // console.log("ommaago its an errro", err);
      dispatch(normalLoader());
      console.log(err.response);
      dispatch(error(err.response.data.message));
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
  const children_map = state.structure.children;
  const childrenArray = Object.keys(children_map).map(function (key, index) {
    return children_map[key];
  });
  const favouriteArray = childrenArray.filter((ele) => ele.favourite);
  return favouriteArray;
};

export const navStructure = (state) => state.structure.currentPath;

export default structureSlice.reducer;
