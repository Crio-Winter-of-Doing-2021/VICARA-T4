import { createSlice} from "@reduxjs/toolkit";
import API from "../../axios";
import {normalLoader} from './loaderSlice'

export const structureSlice = createSlice({
  name: "structure",
  initialState: {
    currentDisplayStructure:{},
    currentPath:[{
      "NAME": "ROOT",
      "id": "ROOT"
  }]
  },
  reducers: {
    updateStructure:(state,action)=>{
        state.currentDisplayStructure=action.payload.CHILDREN
    },
    pushToCurrentStack:(state,action)=>{
      let res=action.payload;

      state.currentDisplayStructure[res.id]={
        TYPE:res.TYPE,
        NAME:res.NAME,
        FAVOURITE:res.FAVOURITE
      }

      if(res.PRIVACY!==undefined){
        state.currentDisplayStructure[res.id]={
          ...state.currentDisplayStructure[res.id],
          PRIVACY:res.PRIVACY
        }
      }

    },
    updateFileName:(state,action)=>{
      let res=action.payload
      state.currentDisplayStructure[res.id].NAME=res.NAME
    },
    updatePrivacy:(state,action)=>{
      let res=action.payload
      state.currentDisplayStructure[res.id].PRIVACY=res.PRIVACY
    },
    updateFav:(state,action)=>{
      let res=action.payload
      state.currentDisplayStructure[res.id].FAVOURITE=res.is_favourite
    }
    ,
    popFromCurrentStack:(state,action)=>{
      let res=action.payload;
      delete state.currentDisplayStructure[res.id];
    },
    updatePath:(state,action)=>{
      state.currentPath=action.payload
    }
  },
});

export const {
  updateStructure,
  pushToCurrentStack,
  updateFileName,
  popFromCurrentStack,
  updateFav,
  updatePath,
  updatePrivacy
} = structureSlice.actions;

export const structureAsync = (uni_id) => (dispatch) => {
    API.get(`/api/filesystem/`,{
        params:{
            id:uni_id
        }
    })
      .then((res) => {
        dispatch(updateStructure(res.data))
      })
      .catch((err) => {
        console.log(err);
      });
};

export const addFolderAsync = (data) => (dispatch) => {
  dispatch(normalLoader())
  API.post("/api/filesystem/",data.body)
    .then((res) => {
      console.log(res)
      dispatch(pushToCurrentStack(res.data))
      dispatch(normalLoader())
    })
    .catch((err) => {
      console.log(err)
      dispatch(normalLoader())
    });
};

export const addFavouriteAsync =(data)=>(dispatch)=>{
  API.post('/api/favourites/',data).then((res)=>{
    dispatch(updateFav(data))
  }).catch(err=>{
    console.log(err)
  })
}

export const privacyAsync =(data)=>(dispatch)=>{
  API.patch('/api/file/',data).then((res)=>{
    dispatch(updatePrivacy(data))
  }).catch(err=>{
    console.log(err)
  })
}

export const pathAsync =(data)=>(dispatch)=>{
  API.get(`/api/path/?id=${data}`).then((res)=>{
    dispatch(updatePath(res.data.PATH))
  }).catch(err=>{
    console.log(err)
  })
}

export const selectStructure = (state) => state.structure.currentDisplayStructure;
export const navStructure = (state) => state.structure.currentPath;

export default structureSlice.reducer;
