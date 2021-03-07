import { createSlice,configureStore } from '@reduxjs/toolkit';
import API from '../../axios'

export const structureSlice= createSlice({
    name:'structure',
    initialState:{
        currentFolderKey:'ROOT',
        keyFolder:[{key:'ROOT',name:'Home'}],//last index is current
        fileStructure:{},
        currentDisplay:{}
        
    },
    reducers:{
        updateStructure:(state,action) =>{
            state.fileStructure=action.payload
        },
        currentStructure:(state)=>{
            state.currentDisplay=state.fileStructure[state.currentFolderKey].CHILDREN
        },
        changeKey:(state,action)=>{
            // if(state.currentFolderKey!==action.payload){
            //     state.currentFolderKey=action.payload
            //     function check(data) {
            //         return data.key === state.currentFolderKey;
            //     }
            //     let currentKeyIndex=state.keyFolder.findIndex(check)
            //     if(currentKeyIndex!==-1){
            //         state.keyFolder.splice(currentKeyIndex,state.keyFolder.length-currentKeyIndex);
            //     }

            //     let newData={
            //         key:state.currentFolderKey,
            //         name:state.fileStructure[state.currentFolderKey].NAME
            //     }

            //     state.keyFolder.push(newData)
            // }

            state.currentFolderKey=action.payload
        }
    }
})

export const {updateStructure,currentStructure,changeKey} =structureSlice.actions

export const structureAsync = () => dispatch =>{
    API.get('/api/filesystem/').then(res=>{
        dispatch(updateStructure(res.data))
        dispatch(currentStructure())
    }).catch(err=>{
        console.log(err)
    })
}

export const selectStructure = state => state.structure.currentDisplay;
export const navStructure = state => state.structure.keyFolder

export default structureSlice.reducer