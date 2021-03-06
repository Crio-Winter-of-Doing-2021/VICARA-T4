import { createSlice } from '@reduxjs/toolkit';

export const navTabSlice= createSlice({
    name:'navTabs',
    initialState:{
        tabs:[]
    },
    reducers:{
        updateTabs:(state,action) =>{
            state.tabs = state.tabs.push(action.payload)
        }
    }
})