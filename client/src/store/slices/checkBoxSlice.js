import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import axios from "axios";
import { updateFileName, popFromCurrentStack } from "./structureSlice";
import { normalLoader } from "./loaderSlice";
import { updateFavFileName, popFromCurrentFavStack } from "./favSlice";
import { updateRecentFileName, popFromCurrentRecentStack } from "./recentSlice";
import { popFromCurrentTrashStack } from "./trashSlice";
import { getProfileAsync } from "./authSlice";

export const checkBoxSlice = createSlice({
  name: "checkbox",
  initialState: {
    selectedFolderKeys: [],
    selectedFileKeys: [],
  },
  reducers: {
    updateSelectedKeys: (state, action) => {
      let type = action.payload.type;
      console.log(type);
      if (type === "folder") {
        let data = action.payload.id;
        console.log(data);
        function check(key) {
          return data === key.id;
        }
        let currentKeyIndex = state.selectedFolderKeys.findIndex(check);
        if (currentKeyIndex === -1) {
          state.selectedFolderKeys.push({
            id: data,
            index: action.payload.index,
          });
        } else {
          state.selectedFolderKeys.splice(currentKeyIndex, 1);
        }
      } else {
        let data = action.payload.id;
        console.log(data);
        function check(key) {
          return data === key.id;
        }
        let currentKeyIndex = state.selectedFileKeys.findIndex(check);
        if (currentKeyIndex === -1) {
          state.selectedFileKeys.push({
            id: data,
            index: action.payload.index,
          });
        } else {
          state.selectedFileKeys.splice(currentKeyIndex, 1);
        }
      }
    },
    emptykeys: (state) => {
      state.selectedFolderKeys = [];
      state.selectedFileKeys = [];
    },
  },
});

export const { updateSelectedKeys, emptykeys } = checkBoxSlice.actions;

export const deleteAsync = (fileArr, folderArr) => (dispatch) => {
  const id = localStorage.getItem("id");
  if (folderArr.length !== 0) {
    dispatch(normalLoader());
    let i;
    let axi_data = [];

    for (i = 0; i < folderArr.length; i++) {
      let new_data = API.delete(`/api/folder/?id=${folderArr[i].id}`);
      axi_data.push(new_data);
    }

    axios
      .all(axi_data)
      .then(
        axios.spread((...res) => {
          let k;
          for (k = 0; k < folderArr.length; k++) {
            let newdata = {
              data: res[k].data,
              type: "folder",
            };
            dispatch(popFromCurrentStack(newdata));
            dispatch(popFromCurrentFavStack(newdata));
            dispatch(popFromCurrentRecentStack(newdata));
            dispatch(popFromCurrentTrashStack(newdata));
          }
          dispatch(getProfileAsync(id));
          dispatch(normalLoader());
        })
      )
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        dispatch(emptykeys());
      });
  }

  if (fileArr.length !== 0) {
    dispatch(normalLoader());
    let i;
    let axi_data = [];

    for (i = 0; i < fileArr.length; i++) {
      let new_data = API.delete(`/api/file/?id=${fileArr[i].id}`);
      axi_data.push(new_data);
    }

    axios
      .all(axi_data)
      .then(
        axios.spread((...res) => {
          let k;
          for (k = 0; k < fileArr.length; k++) {
            let newdata = {
              data: res[k].data,
              type: "file",
            };
            dispatch(popFromCurrentStack(newdata));
            dispatch(popFromCurrentFavStack(newdata));
            dispatch(popFromCurrentRecentStack(newdata));
            dispatch(popFromCurrentTrashStack(newdata));
          }
          dispatch(getProfileAsync(id));
          dispatch(normalLoader());
        })
      )
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        dispatch(emptykeys());
      });
  }

  dispatch(emptykeys());
};

export const updateAsync = (fileData, folderData) => (dispatch) => {
  if (Object.keys(folderData).length !== 0) {
    dispatch(normalLoader());
    API.patch("/api/folder/", folderData.payload)
      .then((res) => {
        console.log(res);
        // dispatch(emptykeys())
        let newData = {
          data: res.data,
          index: folderData.index,
        };
        dispatch(updateFileName(newData));
        dispatch(updateFavFileName(newData));
        dispatch(updateRecentFileName(newData));
        dispatch(normalLoader());
      })
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        dispatch(emptykeys());
      });
  }

  if (Object.keys(fileData).length !== 0) {
    dispatch(normalLoader());
    API.patch("/api/file/", fileData.payload)
      .then((res) => {
        console.log(res);
        // dispatch(emptykeys())
        let newData = {
          data: res.data,
          index: fileData.index,
        };
        dispatch(updateFileName(newData));
        dispatch(updateFavFileName(newData));
        dispatch(updateRecentFileName(newData));
        dispatch(normalLoader());
      })
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        dispatch(emptykeys());
      });
  }
};

export const trashAsync = (fileArr, folderArr) => (dispatch) => {
  if (folderArr.length !== 0) {
    dispatch(normalLoader());
    let i;
    let axi_data = [];

    for (i = 0; i < folderArr.length; i++) {
      let new_data = API.patch(`/api/folder/`, {
        id: folderArr[i].id,
        trash: true,
      });
      axi_data.push(new_data);
    }

    axios
      .all(axi_data)
      .then(
        axios.spread((...res) => {
          let k;
          for (k = 0; k < folderArr.length; k++) {
            let newdata = {
              data: res[k].data,
              type: "folder",
            };
            dispatch(popFromCurrentStack(newdata));
            dispatch(popFromCurrentFavStack(newdata));
            dispatch(popFromCurrentRecentStack(newdata));
          }
          dispatch(normalLoader());
        })
      )
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        dispatch(emptykeys());
      });
  }

  if (fileArr.length !== 0) {
    dispatch(normalLoader());
    let i;
    let axi_data = [];

    for (i = 0; i < fileArr.length; i++) {
      let new_data = API.patch(`/api/file/`, {
        id: fileArr[i].id,
        trash: true,
      });
      axi_data.push(new_data);
    }

    axios
      .all(axi_data)
      .then(
        axios.spread((...res) => {
          let k;
          for (k = 0; k < fileArr.length; k++) {
            let newdata = {
              data: res[k].data,
              type: "file",
            };
            dispatch(popFromCurrentStack(newdata));
            dispatch(popFromCurrentFavStack(newdata));
            dispatch(popFromCurrentRecentStack(newdata));
          }
          dispatch(normalLoader());
        })
      )
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        dispatch(emptykeys());
      });
  }

  dispatch(emptykeys());
};

export const restoreAsync = (fileArr, folderArr) => (dispatch) => {
  if (folderArr.length !== 0) {
    dispatch(normalLoader());
    let i;
    let axi_data = [];

    for (i = 0; i < folderArr.length; i++) {
      let new_data = API.get(`/api/recover-folder/?id=${folderArr[i].id}`);
      axi_data.push(new_data);
    }

    axios
      .all(axi_data)
      .then(
        axios.spread((...res) => {
          let k;
          for (k = 0; k < folderArr.length; k++) {
            let newdata = {
              data: res[k].data,
              type: "folder",
            };
            dispatch(popFromCurrentStack(newdata));
            dispatch(popFromCurrentFavStack(newdata));
            dispatch(popFromCurrentRecentStack(newdata));
            dispatch(popFromCurrentTrashStack(newdata));
          }
          dispatch(normalLoader());
        })
      )
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        dispatch(emptykeys());
      });
  }

  if (fileArr.length !== 0) {
    dispatch(normalLoader());
    let i;
    let axi_data = [];

    for (i = 0; i < fileArr.length; i++) {
      let new_data = API.get(`/api/recover-file/?id=${fileArr[i].id}`);
      axi_data.push(new_data);
    }

    axios
      .all(axi_data)
      .then(
        axios.spread((...res) => {
          let k;
          for (k = 0; k < fileArr.length; k++) {
            let newdata = {
              data: res[k].data,
              type: "file",
            };
            dispatch(popFromCurrentStack(newdata));
            dispatch(popFromCurrentFavStack(newdata));
            dispatch(popFromCurrentRecentStack(newdata));
            dispatch(popFromCurrentTrashStack(newdata));
          }
          dispatch(normalLoader());
        })
      )
      .catch((err) => {
        console.log(err);
        dispatch(normalLoader());
        dispatch(emptykeys());
      });
  }

  dispatch(emptykeys());
};

export const selectCheckedFolderKeys = (state) =>
  state.checkbox.selectedFolderKeys;
export const selectCheckedFileKeys = (state) => state.checkbox.selectedFileKeys;

export default checkBoxSlice.reducer;
