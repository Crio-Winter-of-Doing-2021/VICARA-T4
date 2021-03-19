import axios from "axios";

export let baseURL = "http://localhost:8000";

let token = "Token 3eaac4c78b7b6b43664b270d416e9e8f874539cb";

export default axios.create({
  baseURL,
  headers: {
    Authorization: token,
  },
});
