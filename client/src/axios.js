import axios from "axios";

export let baseURL = "http://localhost:8000";
// export let frontURL = "http://localhost:3000";
// export let baseURL = "https://vicara-drf-backend.herokuapp.com";
export let frontURL = "https://vicara.netlify.app";
// export const token = window.localStorage.getItem("session");
// console.log("token ", token);

export default axios.create({
  baseURL,
});
