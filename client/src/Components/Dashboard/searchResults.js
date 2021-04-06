import React, { useState } from 'react'
import {useDispatch} from 'react-redux'
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import FolderIcon from '@material-ui/icons/Folder';
import {typeTest} from '../../Utilities/fileType'
import {withRouter} from 'react-router-dom'

function SearchResults({result,...props}) {
    let resultRenderer=result.map(res=>{
        return (
            <ListItem style={{cursor:"pointer"}} onClick={()=>{
              if(res.type==='folder'){
                props.history.push(`/drive/${res.id}`)
                props.viewPopper(false)
              }else{
                props.history.push(`/drive/${res.parent}`)
                props.viewPopper(false)
              }
            }} >
                  <ListItemAvatar>
                    <Avatar>
                      {res.type==='folder'?<FolderIcon />:typeTest(res.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={res.name}
                    secondary={res.owner.username}
                  />
            </ListItem>
        )
    })

    return (
        <>
            {resultRenderer}  
        </>
    )
}

export default withRouter(SearchResults)