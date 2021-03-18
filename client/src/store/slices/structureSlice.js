import { createSlice} from "@reduxjs/toolkit";
import API from "../../axios";

export const structureSlice = createSlice({
  name: "structure",
  initialState: {
    currentDisplayStructure:{}
  },
  reducers: {
    updateStructure:(state,action)=>{
        state.displayStructure=action.payload
    }
  },
});

export const {
  updateStructure,
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

export const selectStructure = (state) => state;

export default structureSlice.reducer;
