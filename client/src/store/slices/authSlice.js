import { createSlice } from "@reduxjs/toolkit";
import { baseURL } from "../../axios";
import axios from "axios";
import API from "../../axios";
import {normalLoader,profileLoader} from './loaderSlice'

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    userData:{},
    username:""
  },
  reducers: {
    login: (state, action) => {
      state.userData=action.payload
    },
    setUser:(state,action)=>{
      state.username=action.payload
    }
  },
});

export const { login,setUser } = authSlice.actions;

export const signupAsync = (data) => (dispatch) => {};

export const loginAsync = (data, props) => (dispatch) => {
  dispatch(normalLoader())
  axios
    .post(`${baseURL}/api/auth/login/`, data)
    .then((res) => {
      console.log(res.data);
      let token = res.data.token;
      API.defaults.headers.common["Authorization"] = `Token ${token}`;
      props.history.push(`/drive/${res.data.root_id}`);
      dispatch(setUser(res.data.username))
      window.localStorage.setItem("session", token);
      window.localStorage.setItem("id", res.data.root_id)
      dispatch(normalLoader())
    })
    .catch((err) => {
      console.log(err);
      dispatch(normalLoader())
    });
};

export const getProfileAsync = (id)=>(dispatch)=>{
  dispatch(profileLoader())
  API.get(`/api/profile/?id=${id}`).then(res=>{
    dispatch(login(res.data))
    dispatch(profileLoader())
  }).catch(err=>{
    console.log(err)
    dispatch(profileLoader())
  })
}

export const selectUser = (state) => state.auth.username;
export const selectUserData=(state)=> state.auth.userData
export default authSlice.reducer;
