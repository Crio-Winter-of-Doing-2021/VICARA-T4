import axios from "axios";

export let baseURL = "http://localhost:8000";

let token = "Token 27aba61b494aa6ab4cf98097807baf110fff47f6";

export default axios.create({
  baseURL,
  headers: {
    Authorization: token,
  },
});
