import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import axios from "axios";
import { removeFromChildren, resetSelection } from "./structureSlice";
import { normalLoader } from "./loaderSlice";
import { updateStorageData } from "./authSlice";
import { success, error } from "./logSlice";
export const checkBoxSlice = createSlice({
  name: "checkbox",
  initialState: {
    selectedFolderKeys: [],
    selectedFileKeys: [],
  },
  reducers: {
    updateSelectedKeys: (state, action) => {
      let type = action.payload.type;
      let name = action.payload.name;
      //console.log(type);
      if (type === "folder") {
        let data = action.payload.id;
        //console.log(data);
        function check(key) {
          return data === key.id;
        }
        let currentKeyIndex = state.selectedFolderKeys.findIndex(check);
        if (currentKeyIndex === -1) {
          state.selectedFolderKeys.push({
            id: data,
            index: action.payload.index,
            name,
          });
        } else {
          state.selectedFolderKeys.splice(currentKeyIndex, 1);
        }
      } else {
        let data = action.payload.id;
        //console.log(data);
        function check(key) {
          return data === key.id;
        }
        let currentKeyIndex = state.selectedFileKeys.findIndex(check);
        if (currentKeyIndex === -1) {
          state.selectedFileKeys.push({
            id: data,
            index: action.payload.index,
            name,
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

export const deleteAsync = (checkedData) => (dispatch) => {
  dispatch(normalLoader());
  let combined_axi_data=[]

  let k=0;
  for(k=0;k<checkedData.length;k++){
    let new_data;
    if(checkedData[k].type==='folder'){
      new_data = API.delete(`/api/folder/?id=${checkedData[k].id}`);
    }else{
      new_data = API.delete(`/api/file/?id=${checkedData[k].id}`);
    }

    combined_axi_data.push(new_data)
  }

  axios.all(combined_axi_data).then(axios.spread((...res)=>{
    
    console.log(res);
    let i=0;
    let updated_storage_data={ratio:1};
    for(i=0;i<res.length;i++){
      dispatch(removeFromChildren({id:res[i].data.id,type:res[i].data.type}));
      let current=updated_storage_data.ratio;
      let processing=res[i].data.storage_data.ratio;

      if(current>processing){
        updated_storage_data=res[i].data.storage_data
      }
    }
    console.log("min_data",updated_storage_data)
    dispatch(updateStorageData(updated_storage_data))
    dispatch(normalLoader());
  })).catch(err=>{
    dispatch(normalLoader());
    console.log(err);
    dispatch(error(err.response.data.message));
  })

  // if (folderArr.length !== 0) {
  //   dispatch(normalLoader());
  //   let i;
  //   let axi_data = [];

  //   for (i = 0; i < folderArr.length; i++) {
  //     let new_data = API.delete(`/api/folder/?id=${folderArr[i].id}`);
  //     axi_data.push(new_data);
  //   }

  //   axios
  //     .all(axi_data)
  //     .then(
  //       axios.spread((...res) => {
  //         console.log(res);
  //         let k;
  //         for (k = 0; k < folderArr.length; k++) {
  //           dispatch(
  //             removeFromChildren({ id: res[k].data.id, type: "folder" })
  //           );
  //           dispatch(updateStorageData(res[k].data.storage_data));
  //         }
  //         dispatch(resetSelection());
  //         dispatch(normalLoader());
  //         dispatch(success("Your Action was Successful"));
  //       })
  //     )
  //     .catch((err) => {
  //       dispatch(normalLoader());
  //       console.log(err);
  //       dispatch(error(err.response.data.message));
  //     });
  // }

  // if (fileArr.length !== 0) {
  //   dispatch(normalLoader());
  //   let i;
  //   let axi_data = [];

  //   for (i = 0; i < fileArr.length; i++) {
  //     let new_data = API.delete(`/api/file/?id=${fileArr[i].id}`);
  //     axi_data.push(new_data);
  //   }

  //   axios
  //     .all(axi_data)
  //     .then(
  //       axios.spread((...res) => {
  //         console.log(res);
  //         let k;
  //         for (k = 0; k < fileArr.length; k++) {
  //           dispatch(removeFromChildren({ id: res[k].data.id, type: "file" }));
  //           dispatch(updateStorageData(res[k].data.storage_data));
  //         }
  //         dispatch(resetSelection());
  //         dispatch(normalLoader());
  //         dispatch(success("Your Action was Successful"));
  //       })
  //     )
  //     .catch((err) => {
  //       dispatch(normalLoader());
  //       console.log(err);
  //       dispatch(error(err.response.data.message));
  //     });
  // }
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
            dispatch(
              removeFromChildren({ id: res[k].data.id, type: "folder" })
            );
          }
          dispatch(resetSelection());
          dispatch(normalLoader());
          dispatch(success("Your Action was Successful"));
        })
      )
      .catch((err) => {
        dispatch(normalLoader());
        //console.log(err.response);
        dispatch(error(err.response.data.message));
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
            dispatch(removeFromChildren({ id: res[k].data.id, type: "file" }));
          }
          dispatch(resetSelection());
          dispatch(normalLoader());
          dispatch(success("Your Action was Successful"));
        })
      )
      .catch((err) => {
        dispatch(normalLoader());
        //console.log(err.response);
        dispatch(error(err.response.data.message));
      });
  }
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
            dispatch(
              removeFromChildren({ id: res[k].data.id, type: "folder" })
            );
          }
          dispatch(resetSelection());
          dispatch(normalLoader());
          dispatch(success("Your Action was Successful"));
        })
      )
      .catch((err) => {
        dispatch(normalLoader());
        //console.log(err.response);
        dispatch(error(err.response.data.message));
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
            dispatch(removeFromChildren({ id: res[k].data.id, type: "file" }));
          }
          dispatch(resetSelection());
          dispatch(normalLoader());
          dispatch(success("Your Action was Successful"));
        })
      )
      .catch((err) => {
        dispatch(normalLoader());
        //console.log(err.response);
        dispatch(error(err.response.data.message));
      });
  }
};

export const selectCheckedFolderKeys = (state) =>
  state.checkbox.selectedFolderKeys;
export const selectCheckedFileKeys = (state) => state.checkbox.selectedFileKeys;

export default checkBoxSlice.reducer;
