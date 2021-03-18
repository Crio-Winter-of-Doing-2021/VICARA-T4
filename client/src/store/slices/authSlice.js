import { createSlice, configureStore } from "@reduxjs/toolkit";
import API from "../../axios";

export const authSlice= createSlice({
  name: "auth",
  initialState: {
    username:'',
    firstname:'',
    lastname:'',
    token:null,
    rootStructure:{}
  },
  reducers: {
   login:(state,action)=>{
       state.username=action.payload.username
       state.firstname=action.payload.first_name
       state.lastname=action.payload.last_name
       state.token=action.payload.token
       state.rootStructure=action.payload.filesystem
   }
  },
});

export const {
  login
} = authSlice.actions;

export default authSlice.reducer;
