import axios from 'axios'

export let baseURL ="http://localhost:8000";

let token="Token b8955c3a2e945bb8e22aa000d6a7ef3dc3d66d07"

export default axios.create({
    baseURL,
    headers: {
        Authorization: token,
    }
})