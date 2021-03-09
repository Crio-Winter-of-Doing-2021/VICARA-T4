import { createSlice, configureStore } from "@reduxjs/toolkit";
import API from "../../axios";
import {structureFavAsync,structureAsync,setDefault} from "./structureSlice"

export const changePageSlice = createSlice({
  name: "changepage",
  initialState: {
    currentPage:"Home",
    currentPageHome:true
  },
  reducers: {
    changePage:(state,action)=>{
        state.currentPage=action.payload
        state.currentPageHome=state.currentPage==="Home"?true:false
    }
  },
});

export const {
  changePage
} = changePageSlice.actions;

export const changeDisplayPage = (data) => (dispatch) => {
    dispatch(setDefault())
    dispatch(changePage(data)); 
    if(data==="Home"){
        dispatch(structureAsync())
    }else if(data==='Favourites'){
        dispatch(structureFavAsync())
    }
};

export const currentpageHome = (state) => state.changepage.currentPageHome;

export default changePageSlice.reducer;
