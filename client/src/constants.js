import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import RestoreRoundedIcon from '@material-ui/icons/RestoreRounded';
import DeleteSweepRoundedIcon from '@material-ui/icons/DeleteSweepRounded';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import StarRoundedIcon from '@material-ui/icons/StarRounded';

import AvatarGIF from './assets/gifs/avatar_show.gif'
import RowFunctionGIF from './assets/gifs/check_star_privacy_show.gif'
import NewButtonGIF from './assets/gifs/new_button_show.gif'
import RightClickGIF from './assets/gifs/right_click_show.gif'
import SearchGIF from './assets/gifs/search_show.gif'

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

export const steps = [
  {
    selector:'rowClass',
    content:()=>(
      <div>
        <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
          Welcome to Vicara T4, go ahead and check all the functionalities we have to offer!
        </div>
      </div>
    ),
    style:{
      maxWidth:"500px"
    }
  },
    {
      selector: '.createFolderClass',
      content:()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center"}}>
            Create an empty directory to store your files in!
          </div>
        </div>
      )
    },
    {
      selector: '.uploadClass',
      content: ()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
            Upload any number of files from your local machine!
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:"25px"}}>
            <img style={{width:"70%",border:"2px solid black",borderRadius:'3px',padding:"10px",boxShadow:"revert"}} alt="uploadbutton" src={NewButtonGIF} />
          </div>
        </div>
      ),
      style:{
        maxWidth:"700px"
      }
    },
    {
      selector:'rowClass',
      content:()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
            Mark your favourite files, change their accessibility and mark them to perform many more activities!
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:"25px"}}>
            <img style={{width:"100%",border:"2px solid black",borderRadius:'3px',padding:"10px",boxShadow:"revert"}} alt="uploadbutton" src={RowFunctionGIF} />
          </div>
        </div>
      ),
      style:{
        maxWidth:"800px",
      }
    },
    {
      selector:'rowClass',
      content:()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
           Right Click on a row to open a lot more functionalites for that particular file and folder.
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:"25px"}}>
            <img style={{width:"80%",border:"2px solid black",borderRadius:'3px',padding:"10px",boxShadow:"revert"}} alt="uploadbutton" src={RightClickGIF} />
          </div>
        </div>
      ),
      style:{
        maxWidth:"700px",
        top:"5vh !important"
      }
    },
    {
      selector: '.searchClass',
      content: ()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
           Search your files and folders on your drive here!
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:"25px"}}>
            <img style={{width:"80%",border:"2px solid black",borderRadius:'3px',padding:"10px",boxShadow:"revert"}} alt="uploadbutton" src={SearchGIF} />
          </div>
        </div>
      ),
      style:{
        maxWidth:"700px"
      }
    },
    {
      selector: '.sharedWithMeClass',
      content: ()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
           Files/Folders shared with you will be displayed here. Below you can see how you can share!
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:"25px"}}>
            <img style={{width:"80%",border:"2px solid black",borderRadius:'3px',padding:"10px",boxShadow:"revert"}} alt="uploadbutton" src={SearchGIF} />
          </div>
        </div>
      ),
      style:{
        maxWidth:"700px"
      }
    },
    {
      selector: '.profilePictureClass',
      content: ()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
            Change your profile pic any time you want with a simple click!
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:"25px"}}>
            <img style={{width:"80%",border:"2px solid black",borderRadius:'3px',padding:"10px",boxShadow:"revert"}} alt="uploadbutton" src={AvatarGIF} />
          </div>
        </div>
      ),
      style:{
        maxWidth:"400px"
      }
    },
    {
      selector:'.profileDataClass',
      content:()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
            Check your profile details here along with the amount of storage used!
          </div>
        </div>
      )
    },
    {
      selector:'rowClass',
      content:()=>(
        <div>
          <div style={{marginTop:"15px",textAlign:"center",fontSize:"15px"}}>
            Thanks for taking the tour!
          </div>
        </div>
      )
    }
    // ...
  ];