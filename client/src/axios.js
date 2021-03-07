import axios from "axios";

export let baseURL = "http://localhost:8000";

let token = "Token c83d55050c2f12b003278a00a73b1ef309fffca1";

export default axios.create({
  baseURL,
  headers: {
    Authorization: token,
  },
});
