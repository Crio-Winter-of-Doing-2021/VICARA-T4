import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
// import Typography from '@material-ui/core/Typography';
import ListItemIcon from "@material-ui/core/ListItemIcon";
// import EditIcon from "@material-ui/icons/Edit";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { ListItemText } from "@material-ui/core";
import {
  downloadAsync,
  multipleDownloadAsync,
} from "../../store/slices/loaderSlice";
import Share from "../Share/index";
import UpdateNameModal from "../Buttons/update";
import Delete from "../Buttons/delete";
import Trash from "../Buttons/moveToTrash";
import Restore from "../Buttons/restore";
import Move from "../Buttons/Move/index";
import { withRouter } from "react-router-dom";
import { rightClickOptions } from "./rightClickOptions";
import {
  selectChecked,
  selectCheckedCount,
  updateSelection,
} from "../../store/slices/structureSlice";
const initialState = {
  mouseX: null,
  mouseY: null,
};

function ContextMenu(props) {
  const [state, setState] = React.useState(initialState);
  const dispatch = useDispatch();
  const { data } = props;
  const { id, type } = data;

  const { path } = props.match;
  //console.log({ path });
  //console.log({ rightClickOptions });
  const {
    showShare,
    showTrash,
    showDownload,
    showDelete,
    showRestore,
    showUpdate,
    showMove,
  } = rightClickOptions[path];

  const checkedFileFolder = useSelector(selectChecked);

  const fetchIdAndType = checkedFileFolder.map((ele) => {
    let res = {
      type: ele.type,
      id: ele.id,
    };
    return res;
  });

  const dataForMultipleDownload = {
    CHILDREN: fetchIdAndType,
  };

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
    // dispatch(resetSelection());
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
        {showDownload ? (
          <MenuItem
            onClick={() => {
              handleClose();
              if (checkedCount > 1) {
                dispatch(multipleDownloadAsync(dataForMultipleDownload));
              } else {
                dispatch(downloadAsync(props.data));
              }
            }}
          >
            <ListItemIcon>
              <CloudDownloadIcon color="secondary" />
            </ListItemIcon>
            <ListItemText style={{ paddingRight: "15px" }}>
              Download
            </ListItemText>
          </MenuItem>
        ) : null}

        {checkedCount === 1 ? (
          <>
            {showShare ? (
              <Share data={props.data} menuClose={handleClose} />
            ) : null}

            {showUpdate ? (
              <UpdateNameModal
                handleCloseOfRightClickMenu={handleClose}
                {...data}
              />
            ) : null}
          </>
        ) : null}

        {showMove ? (
          <Move handleCloseOfRightClickMenu={handleClose} props={props} />
        ) : null}

        {showTrash ? (
          <Trash handleCloseOfRightClickMenu={handleClose} {...data} />
        ) : null}
        {showRestore ? (
          <Restore handleCloseOfRightClickMenu={handleClose} {...data} />
        ) : null}
        {showDelete ? (
          <Delete handleCloseOfRightClickMenu={handleClose} {...data} />
        ) : null}
      </Menu>
    </div>
  );
}
export default withRouter(ContextMenu);
