import { createSlice} from "@reduxjs/toolkit";
import API from '../../axios'
import {normalLoader,searchLoader} from './loaderSlice'
import {privOpp} from '../../Components/Structure/structure'

export const shareSlice= createSlice({
  name: "share",
  initialState: {
    patchUsers:[],
    searchResult:[]
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
          return value.username === user.username;
        }

        let index=state.patchUsers.findIndex(check);
        console.log("index is",index)
        if(index===-1){
          state.patchUsers.push(value)
        }else{
          state.patchUsers.splice(index,1)
        }
      },
      setPatchUsersDefault:(state,action)=>{
        state.patchUsers=action.payload
      },
      setResultUsers:(state,action)=>{
        state.searchResult=action.payload
      },
      pushForPatch:(state,action)=>{
        state.patchUsers.push(action.payload)
      },
      finalUpdate:(state,action)=>{
        
      }
  },
});

export const {
    updateSharePrivacy,
    updatePatchUsers,
    setPatchUsersDefault,
    setResultUsers,
    pushForPatch
} = shareSlice.actions;

export const searchUserAsync=(value)=>(dispatch)=>{
  dispatch(searchLoader())
  API.get(`api/users/search/`,{
    params:{
      query:value
    }
  }).then(res=>{
    console.log(res)
    dispatch(setResultUsers(res.data))
    dispatch(searchLoader())
  }).catch(err=>{
    console.log(err)
    dispatch(searchLoader())
  })
}

export const sharePatchAsync=(data)=>(dispatch)=>{
  dispatch(normalLoader())
  if(data.type==='file'){
    API.patch(`/api/file/`,data.payload).then(res=>{
      console.log(res)
      dispatch(normalLoader())
    }).catch(err=>{
      console.log(err)
      dispatch(normalLoader())
    })
  }else{
    API.patch(`/api/folder/`,data.payload).then(res=>{
      console.log(res)
      dispatch(normalLoader())
    }).catch(err=>{
      console.log(err)
      dispatch(normalLoader())
    })
  }
}

export const selectPatchUsers = (state)=> state.share.patchUsers
export const selectSearchResults=(state)=> state.share.searchResult

export default shareSlice.reducer;
