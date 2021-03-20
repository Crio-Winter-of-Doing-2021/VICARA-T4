import { createSlice} from "@reduxjs/toolkit";

export const loaderSlice= createSlice({
  name: "loader",
  initialState: {
    fileUploadLoading:false,
    normalLoading:false
  },
  reducers: {
   fileUploadLoader:(state)=>{
       state.fileUploadLoading=!state.fileUploadLoading
   },
   normalLoader:(state)=>{
     state.normalLoading=!state.normalLoading
   }
  },
});

export const {
  fileUploadLoader,
  normalLoader
} = loaderSlice.actions;

export const fileLoading = (state) => state.loader.fileUploadLoading;
export const normalLoading = (state) => state.loader.normalLoading;

export default loaderSlice.reducer;
