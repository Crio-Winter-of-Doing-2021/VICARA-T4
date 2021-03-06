import { createSlice } from '@reduxjs/toolkit';
import faxios from '../../../axios'

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
    faxios().get('/api/filesystem/').then(res=>{
        dispatch(updateStructure(res.data))
    }).catch(err=>{
        console.log(err)
    })
}

export const selectStructure = state => state.structure;

export default structureSlice.reducer