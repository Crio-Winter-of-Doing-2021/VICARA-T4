import { createSlice, configureStore } from "@reduxjs/toolkit";
import API from "../../axios";

export const structureSlice = createSlice({
  name: "structure",
  initialState: {
    currentFolderKey: "ROOT",
    keyFolder: [{ key: "ROOT", name: "Home" }], //last index is current
    fileStructure: {},
    currentDisplay: {},
    painDisplay:{},
    selected:[]
  },
  reducers: {
    setDefault:(state)=>{
      state.currentFolderKey= "ROOT"
      state.keyFolder= [{ key: "ROOT", name: "Home" }] //last index is current
      state.fileStructure= {}
      state.currentDisplay= {}
      state.selected=[]
      state.plainDisplay={}
    },
    updateStructure: (state, action) => {
      state.fileStructure = action.payload;
    },
    currentStructure: (state) => {
      state.currentDisplay =
        state.fileStructure[state.currentFolderKey].CHILDREN;
    },
    directCurrentStructure:(state,action)=>{
      state.plainDisplay=action.payload
    },
    changeKey: (state, action) => {
      if (state.currentFolderKey !== action.payload) {
        state.currentFolderKey = action.payload;
        function check(data) {
          return data.key === state.currentFolderKey;
        }
        let currentKeyIndex = state.keyFolder.findIndex(check);
        if (currentKeyIndex !== -1) {
          state.keyFolder.splice(
            currentKeyIndex,
            state.keyFolder.length - currentKeyIndex
          );
        }

        let newData = {
          key: state.currentFolderKey,
          name: state.currentFolderKey==='ROOT'?'Home':state.fileStructure[state.currentFolderKey].NAME,
        };

        state.keyFolder.push(newData);
      }

      state.currentFolderKey = action.payload;
    },
  },
});

export const {
  updateStructure,
  currentStructure,
  directCurrentStructure,
  changeKey,
  setDefault
} = structureSlice.actions;

export const structureAsync = () => (dispatch) => {
  API.get("/api/filesystem/")
    .then((res) => {
      dispatch(updateStructure(res.data));
      dispatch(currentStructure());
    })
    .catch((err) => {
      console.log(err);
    });
};

export const addFolderAsync = (data) => (dispatch) => {
    API.post("/api/filesystem/",data)
      .then((res) => {
        dispatch(structureAsync())
      })
      .catch((err) => {
        console.log(err)
      });
};

export const addFavouriteAsync =(data)=>(dispatch)=>{
  console.log(data)
  API.post('/api/favourites/',data).then((res)=>{
    dispatch(structureAsync())
    dispatch(structureFavAsync())
  }).catch(err=>{
    console.log(err)
  })
}

export const structureFavAsync = () => (dispatch) => {
  API.get("/api/favourites/")
    .then((res) => {
      console.log(res)
      dispatch(directCurrentStructure(res.data));
    })
    .catch((err) => {
      console.log(err);
    });
};

export const addRecentAsync =(id)=>(dispatch)=>{
  API.post(`/api/recent/?id=${id}`).then(res=>{
    console.log(res)
  }).catch(err=>{
    console.log(err)
  })
}

export const wholefile = (state) => state.structure.fileStructure;
export const selectStructure = (state) => state.structure.currentDisplay;
export const selectPlainStructure =(state)=>state.structure.plainDisplay;
export const navStructure = (state) => state.structure.keyFolder;
export const currentKey = (state) => state.structure.currentFolderKey

export default structureSlice.reducer;
