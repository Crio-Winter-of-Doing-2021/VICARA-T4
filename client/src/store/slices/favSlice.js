import { createSlice} from "@reduxjs/toolkit";
import API from "../../axios";
import {normalLoader} from './loaderSlice'

export const favStructureSlice = createSlice({
  name: "fav",
  initialState: {
    currentDisplayStructure:{},
    currentPath:[{
      "NAME": "ROOT",
      "id": "ROOT"
  }]
  },
  reducers: {
    updateStructure:(state,action)=>{
        state.currentDisplayStructure=action.payload
    },
    updateFavFileName:(state,action)=>{
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
    popFromCurrentFavStack:(state,action)=>{
      let res=action.payload;
      delete state.currentDisplayStructure[res.id];
        console.log(res)
    },
    updatePath:(state,action)=>{
      state.currentPath=action.payload
    }
  },
});

export const {
  updateStructure,
  updateFavFileName,
  popFromCurrentFavStack,
  updateFav,
  updatePath,
  updatePrivacy
} = favStructureSlice.actions;

export const favStructureAsync = () => (dispatch) => {
    API.get(`/api/favourites/`)
      .then((res) => {
        dispatch(updateStructure(res.data))
      })
      .catch((err)=> {
        console.log(err);
      });
};

export const addFavouriteAsync =(data)=>(dispatch)=>{
  API.post('/api/favourites/',data).then((res)=>{
    console.log(data)
    dispatch(popFromCurrentFavStack(data))
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
    dispatch(updatePath(res.data))
  }).catch(err=>{
    console.log(err)
  })
}

export const selectFavStructure = (state) => state.fav.currentDisplayStructure;

export default favStructureSlice.reducer;
