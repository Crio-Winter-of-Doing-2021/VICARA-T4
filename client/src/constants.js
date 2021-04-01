import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import RestoreRoundedIcon from '@material-ui/icons/RestoreRounded';
import DeleteSweepRoundedIcon from '@material-ui/icons/DeleteSweepRounded';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import StarRoundedIcon from '@material-ui/icons/StarRounded';

export const sideNav=[
    {
        name:"Home",
        icon:<HomeRoundedIcon/>
    },
    {
        name:"Recent",
        icon:<RestoreRoundedIcon/>
    },
    {
        name:"Favourites",
        icon:<StarRoundedIcon/>
    },
    {
        name:"Shared with Me",
        icon:<FolderSharedIcon/>
    },
    {
        name:"Trash",
        icon:<DeleteSweepRoundedIcon/>
    }
]