import { createSlice} from "@reduxjs/toolkit";
import API from "../../axios";

export const structureSlice = createSlice({
  name: "structure",
  initialState: {
    currentDisplayStructure:{}
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

    }
  },
});

export const {
  updateStructure,
  pushToCurrentStack
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
  API.post("/api/filesystem/",data.body)
    .then((res) => {
      console.log(res)
      dispatch(pushToCurrentStack(res.data))
    })
    .catch((err) => {
      console.log(err)
    });
};


export const selectStructure = (state) => state.structure.currentDisplayStructure;

export default structureSlice.reducer;
