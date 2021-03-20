import axios from "axios";

export let baseURL = "http://localhost:8000";

export const token = "Token 8df98e1fa0a87ef81fe9e87afb1bdabf3982597a";

export default axios.create({
  baseURL,
  headers: {
    Authorization: token,
  },
});
