import { createSlice} from "@reduxjs/toolkit";
import API from "../../axios";
import axios from 'axios'
import {updateFileName,popFromCurrentStack} from './structureSlice'

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
  let axi_data=[];

  for(i=0;i<arr.length;i++){
    let new_data=API.delete(`/api/filesystem/?id=${arr[i]}`);
    axi_data.push(new_data)
  }

  axios.all(axi_data).then(axios.spread((...res)=>{
    console.log(res)
  })).catch(err=>{
    console.log(err)
  })
  
  dispatch(emptykeys())
};

export const updateAsync = (data) => (dispatch) => {
    API.patch("/api/filesystem/",data)
      .then((res) => {
        console.log(res)
        // dispatch(emptykeys())
        dispatch(updateFileName(res.data))
      })
      .catch((err) => {
        console.log(err)
      });
  };

export const selectCheckedKeys = (state) => state.checkbox.selectedKeys;

export default checkBoxSlice.reducer;
