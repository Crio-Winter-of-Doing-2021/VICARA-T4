import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../Components/counter/counterSlice';
import checkBoxReducer from './slices/checkboxSlice';
import structureReducer from './slices/structureSlice'
import ChangePageReducer from './slices/changePageSlice'

export default configureStore({
  reducer: {
    counter: counterReducer,
    structure : structureReducer,
    checkbox: checkBoxReducer,
    changepage: ChangePageReducer
  },
});
