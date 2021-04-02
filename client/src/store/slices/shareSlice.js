import { createSlice} from "@reduxjs/toolkit";
import API from '../../axios'
import {normalLoader} from './loaderSlice'
import {privOpp} from '../../Components/Structure/structure'

export const shareSlice= createSlice({
  name: "share",
  initialState: {
    patchUsers:[]
  },
  reducers: {
      updateSharePrivacy:(state)=>{
          console.log(state.fileData.PRIVACY)
          if(state.PRIVACY!=="Loading..."){
              state.fileData.PRIVACY=privOpp(state.fileData.PRIVACY)
          }
      },
      updatePatchUsers:(state,action)=>{
        let value=action.payload
        function check(user) {
          return value === user;
        }

        let index=state.patchUsers.findIndex(check);
        console.log("index is",index)
        if(index===-1){
          state.patchUsers.push(value)
        }else{
          state.patchUsers.splice(index,1)
        }
      },
      setPatchUsersDefault:(state)=>{
        state.patchUsers=state.fileData.USERS
      }
  },
});

export const {
    updateSharePrivacy,
    updatePatchUsers,
    setPatchUsersDefault
} = shareSlice.actions;

export default shareSlice.reducer;
