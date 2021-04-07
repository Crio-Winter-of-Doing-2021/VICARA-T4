import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { error } from "./logSlice";
import { normalLoader } from "./loaderSlice";
import { giveExtensionType } from "../../Utilities//fileType";

export const fileViewSlice = createSlice({
  name: "fileView",
  initialState: {
    url: null,
    loading: false,
    open: false,
    fileType: "",
    name: "",
  },
  reducers: {
    toggleModal: (state) => {
      state.open = !state.open;
    },
    setFileInfo: (state, action) => {
      const { name, fileType, url } = action.payload;
      state.name = name;
      state.fileType = fileType;
      state.url = url;
    },
  },
});

export const { toggleModal, setFileInfo } = fileViewSlice.actions;

// export const downloadAsync=(data)=>(dispatch)=>{
// //   dispatch(normalLoader());
//   if(data.type==='file'){
//     API.get(`/api/file/download/`, {
//       params: {
//         id: data.id,
//       },
//     })
//       .then((res) => {
//         // //console.log("in blobbbbbbbbbbbbbb", res.data["url"]);
//         window.open(res.data.url);
//         // saveAs(res.data["url"], "image.jpg");
//         // dispatch(normalLoader());
//       })
//       .catch((err) => {
//         // //console.log("ommaago its an errro", err);
//         // dispatch(normalLoader());
//         //console.log(err.response)
//         dispatch(error(err.response.data.message))
//       });
//   }else{
//     API.get(`/api/folder/download/`, {
//       params: {
//         id: data.id,
//       },
//     })
//       .then((res) => {
//         // //console.log("in blobbbbbbbbbbbbbb", res.data["url"]);
//         window.open(res.data.url);
//         // saveAs(res.data["url"], "image.jpg");
//         // dispatch(normalLoader());
//       })
//       .catch((err) => {
//         // //console.log("ommaago its an errro", err);
//         // dispatch(normalLoader());
//         //console.log(err.response)
//         dispatch(error(err.response.data.message))
//       });
//   }
// }

export const downloadOrViewFile = (fileData) => (dispatch) => {
  //console.log("inside",fileData)
  dispatch(normalLoader());
  let type = giveExtensionType(fileData.name);
  API.get(`/api/file/download/`, {
    params: {
      id: fileData.id,
    },
  })
    .then((res) => {
      // //console.log("in blobbbbbbbbbbbbbb", res.data["url"]);
      let info = res.data;
      //console.log("info",info)
      dispatch(setFileInfo({ name: info.name, fileType: type, url: info.url }));
      dispatch(normalLoader());
      return info.url;
      // saveAs(res.data["url"], "image.jpg");
      // dispatch(normalLoader());
    })
    .then((res) => {
      if (type === "pdf" || type === "image" || type === "video") {
        dispatch(toggleModal());
      } else {
        window.open(res, "_blank");
      }
    })
    .catch((err) => {
      // //console.log("ommaago its an errro", err);
      dispatch(normalLoader());
      //console.log(err.response)
      dispatch(error(err.response.data.message));
    });
};

export const ViewModalState = (state) => state.fileView.open;
export const fileData = (state) => {
  let { url, name, fileType } = state.fileView;
  return { url, name, fileType };
};

export default fileViewSlice.reducer;
