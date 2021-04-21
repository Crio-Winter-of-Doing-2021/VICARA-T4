import React from 'react'
import {baseURL} from '../../axios'
import {Typography} from "@material-ui/core"

export default function ApiDoc() {
    let handleClickOpen=()=>{
        window.open(`${baseURL}/docs/`,"_blank")
    }
    return (
        <div>
            <Typography onClick={handleClickOpen} style={{marginTop:"5px",cursor:'pointer'}} variant="body2" color="textSecondary" align="center">
                API Documentation
            </Typography>
        </div>
    )
}
