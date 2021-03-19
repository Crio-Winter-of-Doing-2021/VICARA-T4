import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'
import structureReducer from './slices/structureSlice'
import checkboxReducer from './slices/checkBoxSlice'
import loaderReducer from './slices/loaderSlice'

export default configureStore({
  reducer: {
    auth:authReducer,
    structure: structureReducer,
    checkbox: checkboxReducer,
    loader:loaderReducer
  },
});