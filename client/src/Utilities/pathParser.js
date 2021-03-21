import API from '../axios'
import axios from 'axios'

export const pathParse=(data)=>{
    let axi_data=[];
    Object.keys(data).map((key, index) => {
        let new_data=API.get(`/api/path/?id=${key}`)
        axi_data.push(new_data)
    });
    
    axios.all(axi_data).then(axios.spread((...res)=>{
        console.log(res)
    })).catch(err=>{
        console.log(err)
    })
        
}