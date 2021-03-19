import axios from "axios";

export let baseURL = "http://localhost:8000";

export const token = "Token 0a6b23b6836ddf8516f8d8a2674b9056ab3422c6";

export default axios.create({
  baseURL,
  headers: {
    Authorization: token,
  },
});
