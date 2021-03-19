import axios from "axios";

export let baseURL = "http://localhost:8000";

let token = "Token f03d4d5ec608e6a86622f16f292c05f0ceebf85b";

export default axios.create({
  baseURL,
  headers: {
    Authorization: token,
  },
});
