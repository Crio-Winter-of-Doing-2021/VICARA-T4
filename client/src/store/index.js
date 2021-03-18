import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'
import structureReducer from './slices/structureSlice'

export default configureStore({
  reducer: {
    auth:authReducer,
    structure: structureReducer
  },
});