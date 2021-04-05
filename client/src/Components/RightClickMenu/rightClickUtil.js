import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
// import Typography from '@material-ui/core/Typography';
import ListItemIcon from "@material-ui/core/ListItemIcon";
// import EditIcon from "@material-ui/icons/Edit";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { ListItemText } from "@material-ui/core";
import { downloadAsync } from "../../store/slices/loaderSlice";
import Share from "../Share/index";
import UpdateNameModal from "../Buttons/update";
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  selectChecked,
  selectCheckedCount,
  updateSelection,
  resetSelection,
} from "../../store/slices/structureSlice";
const initialState = {
  mouseX: null,
  mouseY: null,
};

export default function ContextMenu(props) {
  const [state, setState] = React.useState(initialState);

  const dispatch = useDispatch();
  const { data } = props;
  const { id, type } = data;
  const handleClick = (event) => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
    dispatch(updateSelection({ id, type, selected: true }));
  };

  const handleClose = () => {
    setState(initialState);
    dispatch(resetSelection());
  };
  const checkedCount = useSelector(selectCheckedCount);

  return (
    <div onContextMenu={handleClick}>
      {props.children}

      <Menu
        keepMounted
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null
            ? { top: state.mouseY, left: state.mouseX }
            : undefined
        }
      >
        {checkedCount === 1 ? (
          <>
            <Share data={props.data} menuClose={handleClose} />
            <MenuItem
              onClick={() => {
                handleClose();
                dispatch(downloadAsync(props.data));
              }}
            >
              <ListItemIcon>
                <CloudDownloadIcon color="secondary" />
              </ListItemIcon>
              <ListItemText style={{ paddingRight: "15px" }}>
                Download
              </ListItemText>
            </MenuItem>
            <UpdateNameModal
              handleCloseOfRightClickMenu={handleClose}
              {...data}
            />
          </>
        ) : null}

        <MenuItem
          onClick={() => {
            handleClose();
            // dispatch(downloadAsync(props.data));
          }}
        >
          <ListItemIcon>
            <DeleteSweepIcon color="primary" />
          </ListItemIcon>
          <ListItemText style={{ paddingRight: "15px" }}>
            Move to Trash
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            // dispatch(downloadAsync(props.data));
          }}
        >
          <ListItemIcon>
            <DeleteIcon color="secondary" />
          </ListItemIcon>
          <ListItemText style={{ paddingRight: "15px" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}
