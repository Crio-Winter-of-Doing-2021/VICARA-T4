import axios from "axios";
import { normalLoader } from "./store/slices/loaderSlice";
export let baseURL = "http://localhost:8000";
export let frontURL = "http://localhost:3000";
// export let baseURL = "https://vicara-drf-backend.herokuapp.com";
// export let frontURL = "https://vicara.netlify.app";

// Function that will be called to refresh authorization
const client_id = process.env.REACT_APP_CLIENT_ID;
const client_secret = process.env.REACT_APP_CLIENT_SECRET;

// Instantiate the interceptor (you can chain it as it returns the axios instance)
const API = axios.create({
  baseURL,
});

export const googleLogin = (props, response) => (dispatch) => {
  dispatch(normalLoader());
  //console.log({ client_id, client_secret });
  axios
    .post(`${baseURL}/auth/convert-token`, {
      token: response.accessToken,
      backend: "google-oauth2",
      grant_type: "convert_token",
      client_id,
      client_secret,
    })
    .then((res) => {
      const { access_token, refresh_token, root_id } = res.data;
      //console.log("new res", res.data);
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("id", root_id);
      API.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      props.history.push(`/drive/${root_id}`);
    })
    .then((res) => {
      dispatch(normalLoader());
    })
    .catch((err) => {
      dispatch(normalLoader());
      //console.log(err);
      // dispatch(error(err.response.data.message));
    });
};

// Response interceptor for API calls
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    console.log("retryyyyyy upper");
    if (error.response.status === 401 && !originalRequest._retry) {
      console.log("retryyyyyy");
      originalRequest._retry = true;
      return await axios
        .post(`${baseURL}/auth/token/`, {
          refresh_token: localStorage.getItem("refresh_token"),
          grant_type: "refresh_token",
          client_id,
          client_secret,
        })
        .then((res) => {
          console.log("retryyyyyy success");
          const { access_token, refresh_token } = res.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          API.defaults.headers.common["Authorization"] =
            "Bearer " + access_token;
          console.log({ originalRequest });
          originalRequest.headers["Authorization"] = "Bearer " + access_token;
          return API(originalRequest);
        });
    }
    return Promise.reject(error);
  }
);
export default API;
