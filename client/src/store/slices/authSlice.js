import { createSlice } from "@reduxjs/toolkit";
import { baseURL } from "../../axios";
import axios from "axios";
import API from "../../axios";
import { normalLoader, profileLoader } from "./loaderSlice";
import { error } from "./logSlice";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    userData: {},
    username: "",
  },
  reducers: {
    login: (state, action) => {
      state.userData = action.payload;
    },
    setUser: (state, action) => {
      state.username = action.payload;
    },
    updateStorageData: (state, action) => {
      //console.log("update data", action.payload);
      state.userData.storage_data.readable = action.payload.readable;
      state.userData.storage_data.ratio = action.payload.ratio;
    },
    setProfilePicture: (state, action) => {
      state.userData.profile_picture_url = action.payload;
    },
  },
});

export const {
  login,
  setUser,
  updateStorageData,
  setProfilePicture,
} = authSlice.actions;

export const signupAsync = (data) => (dispatch) => {};

export const loginAsync = (data, props) => (dispatch) => {
  dispatch(normalLoader());
  axios
    .post(`${baseURL}/api/auth/login/`, data)
    .then((res) => {
      //console.log(res.data);
      let token = res.data.token;
      API.defaults.headers.common["Authorization"] = `Token ${token}`;
      props.history.push(`/drive/${res.data.root_id}`);
      dispatch(setUser(res.data.username));
      window.localStorage.setItem("access_token", token);
      window.localStorage.setItem("id", res.data.root_id);
      dispatch(normalLoader());
    })
    .catch((err) => {
      dispatch(normalLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const getProfileAsync = (id) => (dispatch) => {
  dispatch(profileLoader());
  API.get(`/api/profile/?id=${id}`)
    .then((res) => {
      dispatch(login(res.data));
      dispatch(profileLoader());
    })
    .catch((err) => {
      dispatch(profileLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const googleLogin = (data, props) => (dispatch) => {
  dispatch(normalLoader());
  axios
    .post(`${baseURL}/api/auth/google-login/`, data)
    .then((res) => {
      //console.log(res.data);
      let token = res.data.token;
      API.defaults.headers.common["Authorization"] = `Token ${token}`;
      // dispatch(setUser(res.data.username));
      window.localStorage.setItem("access_token", token);
      window.localStorage.setItem("id", res.data.root_id);
      props.history.push(`/drive/${res.data.root_id}`);
    })
    .then((res) => {
      dispatch(normalLoader());
    })
    .catch((err) => {
      dispatch(normalLoader());
      //console.log(err.response);
      dispatch(error(err.response.data.message));
    });
};

export const selectUser = (state) => state.auth.username;
export const selectUserData = (state) => state.auth.userData;

export default authSlice.reducer;
