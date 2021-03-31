import { createSlice} from "@reduxjs/toolkit";

export const loaderSlice= createSlice({
  name: "loader",
  initialState: {
    fileUploadLoading:false,
    normalLoading:false,
    skeletonLoading:false,
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
   }
  },
});

export const {
  fileUploadLoader,
  normalLoader,
  skeletonLoader
} = loaderSlice.actions;

export const fileLoading = (state) => state.loader.fileUploadLoading;
export const normalLoading = (state) => state.loader.normalLoading;
export const skeletonLoading=(state)=>state.loader.skeletonLoading

export default loaderSlice.reducer;
