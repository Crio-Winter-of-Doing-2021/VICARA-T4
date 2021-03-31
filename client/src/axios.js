import axios from "axios";

export let baseURL = "https://vicara-drf-backend.herokuapp.com";
export let frontURL="http://localhost:3000";
export const token = window.localStorage.getItem("session");
// console.log("token ", token);

export default axios.create({
  baseURL,
});
