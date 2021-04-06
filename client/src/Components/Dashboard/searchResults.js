import React, { useState } from 'react'
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import FolderIcon from '@material-ui/icons/Folder';
import {Divider} from '@material-ui/core'
import {typeTest} from '../../Utilities/fileType'

export default function SearchResults({result,...props}) {

    let resultRenderer=result.map(res=>{
        return (
            <ListItem>
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
