import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'
import structureReducer from './slices/structureSlice'
import checkboxReducer from './slices/checkBoxSlice'
import loaderReducer from './slices/loaderSlice'
import favReducer from './slices/favSlice'
import shareReducer from './slices/shareSlice'
import recentReducer from './slices/recentSlice'
import sharedWithMeReducer from './slices/sharedWithMeSlice'

export default configureStore({
  reducer: {
    auth:authReducer,
    structure: structureReducer,
    checkbox: checkboxReducer,
    loader:loaderReducer,
    fav:favReducer,
    share:shareReducer,
    recent:recentReducer,
    sharedWithme:sharedWithMeReducer
  },
});