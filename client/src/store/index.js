import { configureStore } from '@reduxjs/toolkit';
import AuthReducer from '../store/slices/authSlice'
import StructureReducer from '../store/slices/structureSlice'

export default configureStore({
  reducer: {
    Auth:AuthReducer,
    Structure: StructureReducer
  },
});