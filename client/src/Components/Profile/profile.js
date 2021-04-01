import React,{Fragment} from 'react'
import {useSelector} from 'react-redux'
import UserImage from '../Avatar/index'
import {Typography} from '@material-ui/core'
import {selectUserData} from "../../store/slices/authSlice"
import {profileLoading} from '../../store/slices/loaderSlice'
import Skeleton from '@material-ui/lab/Skeleton'

export default function Profile() {

    let userData=useSelector(selectUserData)
    let loading=useSelector(profileLoading)

    return (
        <div style={{margin:"15px 0"}}>
            {loading===false?<Fragment>
                <UserImage/>
                <div style={{display:"flex",justifyContent:"center"}}>
                <Typography style={{color:"grey",fontStyle:"italic"}}>@{userData.username}</Typography>
                </div>
                <div style={{display:"flex",justifyContent:"center"}}>
                <Typography>Pratik Chaudhary</Typography>
                </div>
            </Fragment>:
            <Fragment>
                <div style={{display:"flex",justifyContent:"center"}}>
                    <Skeleton variant="circle" width={100} height={100} /> 
                </div>
                <div style={{display:"flex",justifyContent:"center"}}>
                    <Skeleton width={80} variant="text"/> 
                </div>
                <div style={{display:"flex",justifyContent:"center"}}>
                    <Skeleton width={120} variant="text"/> 
                </div>
            </Fragment>}
        </div>
    )
}
