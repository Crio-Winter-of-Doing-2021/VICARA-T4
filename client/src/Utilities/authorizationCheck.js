import React,{useState,useEffect} from 'react'
import API from '../axios'

export default function AuthorizationCheck(props) {

    let author=props.match.params.user;
    let key=props.match.params.key;

    let [success,setSuccess]=useState(false)

    useEffect(()=>{
        API.get('/api/share/',{
            params:{
                id:key,
                CREATOR:author
            }
        }).then(res=>{
            setSuccess(true)
            let link=res.data.URL
            window.open(link)
        }).catch(err=>{
            console.log(err)
        })
    },[])

    if(success) return null;    

    return (
        <div>
            UnAuthorizedAccess
        </div>
    )
}
