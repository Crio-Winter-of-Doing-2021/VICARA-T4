import axios from "axios";

export let baseURL = "http://localhost:8000";
export const token = window.localStorage.getItem('session');

export default axios.create({
  baseURL,
  headers: {
    Authorization: token,
  },
});
