import { createSlice} from "@reduxjs/toolkit";
import API from '../../axios'
import {normalLoader} from './loaderSlice'
import {privOpp} from '../../Components/Structure/structure'

export const shareSlice= createSlice({
  name: "share",
  initialState: {
    fileData:{
        CREATOR: "Loading...",
        FAVOURITE: "Loading...",
        NAME: "Loading...",
        PARENT: "Loading...",
        PRIVACY: "Loading...",
        TIMESTAMP: "Loading...",
        TYPE: "Loading...",
        USERS: ["Loading..."],
        id: "Loading...",
    },
    path:"Loading...",
    userList:[],
    patchUsers:[]
  },
  reducers: {
      updatefileData:(state,action)=>{
        let res=action.payload
        state.fileData=res;
      },
      updateSharePrivacy:(state)=>{
          console.log(state.fileData.PRIVACY)
          if(state.PRIVACY!=="Loading..."){
              state.fileData.PRIVACY=privOpp(state.fileData.PRIVACY)
          }
      },
      updateSharePath: (state, action) => {
        let res = action.payload;
        let path = "";
        let pathArr = res.PATH;
  
        let k;
        for (k = 0; k < pathArr.length; k++) {
          path = path + pathArr[k].NAME + " / ";
        }
  
        state.path=path
      },
      setUsers:(state,action)=>{
        state.userList=action.payload
      },
      setFileUsers:(state,action)=>{
        state.fileData.USERS=action.payload
      },
      updatePatchUsers:(state,action)=>{
        let value=action.payload
        function check(user) {
          return value === user;
        }

        let index=state.patchUsers.findIndex(check);
        if(index===-1){
          state.patchUsers.push(value)
        }else{
          state.patchUsers.splice(index,1)
        }
      },
      setPatchUsersDefault:(state,action)=>{
        state.patchUsers=state.fileData.USERS
      }
  },
});

export const {
    updatefileData,
    updateSharePrivacy,
    updateSharePath,
    setUsers,
    setFileUsers,
    updatePatchUsers,
    setPatchUsersDefault
} = shareSlice.actions;

export const shareAsync =(data)=>(dispatch)=>{
    dispatch(normalLoader())
    API.get('/api/share/',{
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

export const userAsync=()=>(dispatch)=>{
  API.get('api/auth/users/').then(res=>{
    dispatch(setUsers(res.data));
  }).catch(err=>{
    console.log(err)
  })
}

export const fileAsync =(data)=>(dispatch)=>{
    dispatch(normalLoader())
    API.get('/api/file/',{
        params:{
            id:data
        }
    }).then(res=>{
        dispatch(updatefileData(res.data))
        let k;
        for(k=0;k<res.data.USERS.length;k++){
          dispatch(updatePatchUsers(res.data.USERS[k]))
        }
        dispatch(setPatchUsersDefault())
        dispatch(normalLoader())
    }).catch(err=>{
        console.log(err)
        dispatch(normalLoader())
    })
}

export const userAsyncPatch =(data)=>(dispatch)=>{
  dispatch(normalLoader());
  API.patch('/api/file/',data).then(res=>{
    dispatch(normalLoader());
    dispatch(setFileUsers(res.data.USERS))
  }).catch(err=>{
    console.log(err)
  })
}

export const pathAsync = (data) => (dispatch) => {
    API.get(`/api/path/?id=${data}`)
      .then((res) => {
        dispatch(updateSharePath(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
  };

export const selectFileData = (state)=> state.share.fileData
export const selectPath = (state) => state.share.path
export const selectUsers=(state)=> state.share.userList
export const selectPatchUsers =(state)=>state.share.patchUsers

export default shareSlice.reducer;
