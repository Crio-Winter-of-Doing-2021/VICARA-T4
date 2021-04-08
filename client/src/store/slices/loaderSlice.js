import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { error } from "./logSlice";

export const loaderSlice = createSlice({
  name: "loader",
  initialState: {
    fileUploadLoading:false,
    normalLoading:false,
    skeletonLoading:false,
    profileLoading:false,
    searchLoading:false,
    pictureLoading:false,
    navSearchLoading:false,
    folderPickerLoading:false,
    currentPage:"Home"
  },
  reducers: {
   fileUploadLoader:(state)=>{
       state.fileUploadLoading=!state.fileUploadLoading
   },
   normalLoader:(state)=>{
     state.normalLoading=!state.normalLoading
   },
   skeletonLoader:(state)=>{
     state.skeletonLoading=!state.skeletonLoading
   },
   profileLoader:(state)=>{
     state.profileLoading=!state.profileLoading
   },
   searchLoader:(state)=>{
     state.searchLoading=!state.searchLoading
   },
   pictureLoader:(state)=>{
    state.pictureLoading=!state.pictureLoading
   },
   navSearchLoader:(state)=>{
    state.navSearchLoading=!state.navSearchLoading
   },
   folderPickerLoader:(state)=>{
     state.folderPickerLoading=!state.folderPickerLoading
   }
   ,
   setCurrentPage:(state,action)=>{
     state.currentPage=action.payload
   }
  },
});

export const {
  fileUploadLoader,
  normalLoader,
  skeletonLoader,
  profileLoader,
  searchLoader,
  setCurrentPage,
  pictureLoader,
  navSearchLoader,
  folderPickerLoader
} = loaderSlice.actions;

export const downloadAsync = (data) => (dispatch) => {
  dispatch(normalLoader());
  if (data.type === "file") {
    API.get(`/api/file/download/`, {
      params: {
        id: data.id,
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
        //console.log(err.response)
        dispatch(error(err.response.data.message));
      });
  } else {
    API.get(`/api/folder/download/`, {
      params: {
        id: data.id,
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
        //console.log(err.response)
        dispatch(error(err.response.data.message));
      });
  }
};

export const multipleDownloadAsync=(data)=>(dispatch)=>{
 
    dispatch(normalLoader());
    API.post(`/api/folder/partial-download/`, data)
      .then((res) => {
        // console.log("in blobbbbbbbbbbbbbb", res.data["url"]);
        // saveAs(res.data["url"], "image.jpg");
        window.open(res.data.url,"_blank")
        dispatch(normalLoader());
      })
      .catch((err) => {
        // console.log("ommaago its an errro", err);
        dispatch(normalLoader());
        console.log(err.response)
        dispatch(error(err.response.data.message))
      });
}

export const fileLoading = (state) => state.loader.fileUploadLoading;
export const normalLoading = (state) => state.loader.normalLoading;
export const skeletonLoading=(state)=>state.loader.skeletonLoading
export const profileLoading=(state)=>state.loader.profileLoading
export const searchLoading=(state)=>state.loader.searchLoading
export const selectPage  = (state)=>state.loader.currentPage
export const pictureLoading =(state)=>state.loader.pictureLoading
export const navSearchLoading =(state)=>state.loader.navSearchLoading
export const folderPickerLoading =(state)=>state.loader.folderPickerLoading

export default loaderSlice.reducer;
