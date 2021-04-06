import React, { useState } from 'react'
import {useDispatch} from 'react-redux'
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import FolderIcon from '@material-ui/icons/Folder';
import {typeTest} from '../../Utilities/fileType'
// import history from '../../Utilities/history';

export default function SearchResults({result,...props}) {

    const dispatch=useDispatch()

    let resultRenderer=result.map(res=>{
        return (
            <ListItem style={{cursor:"pointer"}} onClick={()=>{
              if(res.type==='folder'){
                // history.push(`/drive/${res.id}`)
              }else{
                
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
