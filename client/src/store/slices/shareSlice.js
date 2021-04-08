import { createSlice } from "@reduxjs/toolkit";
import API from "../../axios";
import { searchLoader } from "./loaderSlice";
import { error } from "../slices/logSlice";
export const shareSlice = createSlice({
  name: "share",
  initialState: {
    usersWithAccess: {},
    searchResults: [],
  },
  reducers: {
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setUsersWithAccess: (state, action) => {
      state.usersWithAccess[action.payload.id] = { ...action.payload };
    },
    removeUsersWithAccess: (state, action) => {
      const { [action.payload]: value, ...rest } = state.usersWithAccess;
      state.usersWithAccess = rest;
    },
  },
});

export const {
  setSearchResults,
  setUsersWithAccess,
  removeUsersWithAccess,
} = shareSlice.actions;

export const searchUserAsync = (value) => (dispatch) => {
  dispatch(searchLoader());
  API.get(`api/users/search/`, {
    params: {
      query: value,
    },
  })
    .then((res) => {
      //console.log(res);
      dispatch(setSearchResults(res.data));
      dispatch(searchLoader());
    })
    .catch((err) => {
      dispatch(searchLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const selectUsersWithAccess = (state) => state.share.usersWithAccess;

export const selectSearchResults = (state) => state.share.searchResults;

export default shareSlice.reducer;
