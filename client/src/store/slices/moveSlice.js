import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import {folderPickerLoader} from './loaderSlice'
import {error} from './logSlice'

export const moveSlice = createSlice({
  name: "move",
  initialState: {
    currentFolderPickerView:[],
    currentParentName:null,
    currentNavigation:[
        {
          name: "ROOT",
          id: "ROOT",
        },
      ]
  },
  reducers: {
    setFolderPicker:(state,action)=>{
        state.currentFolderPickerView=action.payload.children
        state.currentParentName=action.payload.name
    },
    updatePath: (state, action) => {
        state.currentNavigation = action.payload;
    }
  },
});

export const {setFolderPicker,updatePath} = moveSlice.actions;

export const getFolderPickerView=(current_parent)=>(dispatch)=>{
    dispatch(folderPickerLoader())
    API.get('/api/folder/picker/',{
        params:{
            id:current_parent
        }
    }).then(res=>{
        dispatch(folderPickerLoader())
        dispatch(setFolderPicker(res.data))
    }).catch(err=>{
        dispatch(folderPickerLoader())
        console.log(err.response);
        dispatch(error(err.response.data.message));
    })
}

export const pathAsync = (data) => (dispatch) => {
    // console.log("asking for path ");
    // console.log("token now = ", window.localStorage.getItem("access_token"));

    if(data.id==="ROOT") return;

    API.get(`/api/path/`, {
      params: {
        id: data.id,
        TYPE: data.type,
      },
    })
      .then((res) => {
        console.log("updating path for id = ", data, " with ", res);
        dispatch(updatePath(res.data));
      })
      .catch((err) => {
        console.log(err.response);
        dispatch(error(err.response.data.message));
      });
  };

export const selectFolderView=(state)=> state.move.currentFolderPickerView
export const selectParent=(state)=> state.move.currentParentName
export const selectPath = (state)=>state.move.currentNavigation

export default moveSlice.reducer;
