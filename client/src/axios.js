import axios from "axios";
import store from './store/index'

export let baseURL = "http://localhost:8000";

let token = "Token 659576ae7a2bda57dea2289ce3c112746b13c8b2";

export default axios.create({
  baseURL,
  headers: {
    Authorization: token,
  },
});
