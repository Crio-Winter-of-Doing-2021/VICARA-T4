import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { normalLoader } from "./store/slices/loaderSlice";
import { error } from "./store/slices/logSlice";
export let baseURL = "http://localhost:8000";
export let frontURL = "http://localhost:3000";
// export let baseURL = "https://vicara-drf-backend.herokuapp.com";
// export let frontURL = "https://vicara.netlify.app";

// Function that will be called to refresh authorization
const refreshAuthLogic = (failedRequest) => {
  console.log("called failed");
  axios
    .post(`${baseURL}/auth/token/`, {
      refresh_token: localStorage.getItem("refresh_token"),
      grant_type: "refresh_token",
      client_id: "VbrqY1sJQckA72RYyS4pFDV3G03AlSZCvEFHhvXZ",
      client_secret:
        "obzlmNFZgRDa3upMpZV4AkSmeaonHqMVaTK4sI3txQ9rPyakFMtoyq1ouVqD3Fjsc7mTV8EV9Zs9NlYTTk91on8jpJgr5Xk7dcL1y0USzrl7x0mEHzDI8cie8xjaj3q0",
    })
    .then((res) => {
      const { access_token, refresh_token } = res.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      console.log("retyyyyyyyyy", res.data);
      API.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      failedRequest.response.config.headers["Authorization"] =
        "Bearer " + access_token;
      return Promise.resolve();
    });
};

// Instantiate the interceptor (you can chain it as it returns the axios instance)
const API = axios.create({
  baseURL,
});
createAuthRefreshInterceptor(API, refreshAuthLogic);

export const googleLogin = (props, response) => (dispatch) => {
  dispatch(normalLoader());
  axios
    .post(`${baseURL}/auth/convert-token`, {
      token: response.accessToken,
      backend: "google-oauth2",
      grant_type: "convert_token",
      client_id: "VbrqY1sJQckA72RYyS4pFDV3G03AlSZCvEFHhvXZ",
      client_secret:
        "obzlmNFZgRDa3upMpZV4AkSmeaonHqMVaTK4sI3txQ9rPyakFMtoyq1ouVqD3Fjsc7mTV8EV9Zs9NlYTTk91on8jpJgr5Xk7dcL1y0USzrl7x0mEHzDI8cie8xjaj3q0",
    })
    .then((res) => {
      const { access_token, refresh_token, root_id } = res.data;
      console.log("new res", res.data);
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
      console.log(err);
      // dispatch(error(err.response.data.message));
    });
};

export default API;
