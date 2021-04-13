import React from "react";

import Dialog from "@material-ui/core/Dialog";
import EditIcon from "@material-ui/icons/Edit";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { ListItemText } from "@material-ui/core";

import { useDispatch } from "react-redux";
// import DisabledTabs from '../File Structure/NavigationTabs/disabledTabs'
import { updateChildAsync } from "../../store/slices/structureSlice";
import FocusInput from "./FocusInput";

export default function UpdateNameModal({
  handleCloseOfRightClickMenu,
  ...data
}) {
  const [open, setOpen] = React.useState(false);

  const dispatch = useDispatch();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleUpdate = (newName) => {
    dispatch(updateChildAsync({ id, type, name: newName }));
    setOpen(false);
  };
  const handleKeyDown = (event, newName) => {
    //console.log("down to earth");
    if (event.key === "Enter") {
      dispatch(updateChildAsync({ id, type, name: newName }));
      setOpen(false);
    }
  };

  const { id, name, type } = data;
  // //console.log({ data });
  // //console.log({ id, name, type });
  const handleClick = () => {
    handleCloseOfRightClickMenu();
    handleClickOpen();
  };
  return (
    <div>
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          <EditIcon color="primary" />
        </ListItemIcon>
        <ListItemText style={{ paddingRight: "15px" }}>Rename</ListItemText>
      </MenuItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <FocusInput
          nameOfSelected={name}
          handleClose={handleClose}
          handleUpdate={handleUpdate}
          handleKeyDown={handleKeyDown}
        />
      </Dialog>
    </div>
  );
}
