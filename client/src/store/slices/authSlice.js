import { createSlice } from "@reduxjs/toolkit";
import { baseURL } from "../../axios";
import axios from "axios";
import API from "../../axios";
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    username: "",
    firstname: "",
    lastname: "",
    token: null,
    rootStructure: {},
  },
  reducers: {
    login: (state, action) => {
      let res = action.payload;
      console.log(res.username);
      state.username = res.username;
      state.firstname = res.first_name;
      state.lastname = res.last_name;
      state.token = res.token;
      state.rootStructure = res.filesystem;
    },
  },
});

export const { login } = authSlice.actions;

export const signupAsync = (data) => (dispatch) => {};

export const loginAsync = (data, props) => (dispatch) => {
  axios
    .post(`${baseURL}/api/auth/login/`, data)
    .then((res) => {
      console.log(res.data);
      let token = res.data.token;
      dispatch(login(res.data));
      window.localStorage.setItem("session", token);
      window.localStorage.setItem("author", res.data.username);
      API.defaults.headers.common["Authorization"] = `Token ${token}`;
      // console.log("token is set");
      props.history.push("/drive/ROOT");
    })
    .catch((err) => {
      console.log(err);
    });
};

export const selectUser = (state) => state.auth.username;

export default authSlice.reducer;
