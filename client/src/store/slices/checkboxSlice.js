import { createSlice, configureStore } from "@reduxjs/toolkit";
import API from "../../axios";
import {structureAsync} from './structureSlice'

export const checkBoxSlice= createSlice({
  name: "checkbox",
  initialState: {
    selectedKeys:[]
  },
  reducers: {
   updateSelectedKeys:(state,action)=>{
        let data=action.payload;
        function check(key) {
            return data === key;
          }
        let currentKeyIndex = state.selectedKeys.findIndex(check);
        if(currentKeyIndex===-1){
            state.selectedKeys.push(data);
        }else{
            state.selectedKeys.splice(currentKeyIndex,1);
        }
   },
   emptykeys:state=>{
       state.selectedKeys=[]
   }
  },
});

export const {
  updateSelectedKeys,
  emptykeys
} = checkBoxSlice.actions;

export const deleteAsync = (arr) => (dispatch) => {
  let i;
  for(i=0;i<arr.length;i++){
    API.delete("/api/filesystem/",{
        data:{
            id:arr[i]
        }
    })
    .then((res) => {
        dispatch(structureAsync())
    })
    .catch((err) => {
      console.log(err)
    });
  }
  dispatch(emptykeys())
};

export const updateAsync = (data) => (dispatch) => {
    API.patch("/api/filesystem/",data)
      .then((res) => {
        console.log(res)
        // dispatch(emptykeys())
        dispatch(structureAsync())
      })
      .catch((err) => {
        console.log(err)
      });
  };

export const selectCheckedKeys = (state) => state.checkbox.selectedKeys;

export default checkBoxSlice.reducer;
