import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import structureReducer from './slices/structureSlice'

export default configureStore({
  reducer: {
    counter: counterReducer,
    structure : structureReducer
  },
});
