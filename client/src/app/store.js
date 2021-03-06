import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import structureReducer from '../features/File Structure/Structure/structureSlice'

export default configureStore({
  reducer: {
    counter: counterReducer,
    structure : structureReducer
  },
});
