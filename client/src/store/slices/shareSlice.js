import { createSlice} from "@reduxjs/toolkit";
import API from '../../axios'
import {normalLoader} from './loaderSlice'

export const shareSlice= createSlice({
  name: "share",
  initialState: {
    fileData:{}
  },
  reducers: {
      updatefileData:(state,action)=>{
        let res=action.payload
        state.fileData=res;
      }
  },
});

export const {
    updateShareData
} = shareSlice.actions;

export const shareAsync =(data)=>(dispatch)=>{
    dispatch(normalLoader())
    API.get('api/share/',{
        params:{
            id:data.id,
            CREATOR:data.CREATOR
        }
    }).then(res=>{
        let link=res.data.URL
        window.open(link,"_blank")
        dispatch(normalLoader())
    }).catch(err=>{
        console.log(err)
        dispatch(normalLoader())
    })
}

export const fileAsync =(data)=>(dispatch)=>{
    
}

export default shareSlice.reducer;
