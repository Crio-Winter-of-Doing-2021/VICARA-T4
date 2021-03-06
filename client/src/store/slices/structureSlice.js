import { createSlice } from '@reduxjs/toolkit';
import API from '../../axios'

export const structureSlice= createSlice({
    name:'structure',
    initialState:{
        fileStructure:[]
    },
    reducers:{
        updateStructure:(state,action) =>{
            state.fileStructure=action.payload
        }
    }
})

export const {updateStructure} =structureSlice.actions

export const structureAsync = () => dispatch =>{
    API.get('/api/filesystem/').then(res=>{
        dispatch(updateStructure(res.data))
        console.log(res)
    }).catch(err=>{
        console.log(err)
    })
}

export const selectStructure = state => state.structure;

export default structureSlice.reducer