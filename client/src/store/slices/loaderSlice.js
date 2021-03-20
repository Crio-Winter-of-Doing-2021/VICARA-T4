import { createSlice} from "@reduxjs/toolkit";

export const loaderSlice= createSlice({
  name: "loader",
  initialState: {
    fileUploadLoading:false
  },
  reducers: {
   fileUploadLoader:(state)=>{
       state.fileUploadLoading=!state.fileUploadLoading
   }
  },
});

export const {
  fileUploadLoader
} = loaderSlice.actions;

export const fileLoading = (state) => state.loader.fileUploadLoading;

export default loaderSlice.reducer;
