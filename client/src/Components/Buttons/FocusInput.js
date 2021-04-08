import React, { useRef, useEffect, useState } from "react";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

function FocusInput({
  nameOfSelected,
  handleClose,
  handleUpdate,
  handleKeyDown,
}) {
  const inputRef = useRef(null);
  const [data, setData] = useState(nameOfSelected);
  useEffect(() => {
    const fullName = inputRef.current.value;
    const filename = fullName.split(".")[0];
    //console.log({ filename });
    inputRef.current.focus();
    inputRef.current.setSelectionRange(0, filename.length);
  }, []);
  const handleDoubleClick = (event) => event.target.select();
  return (
    <div>
      <DialogTitle  id="form-dialog-title">Update Name</DialogTitle>
      <DialogContent>
        <input
          id="updateTextInput"
          style={{ border: 0, outline: "none", width: "100%" }}
          type="text"
          placeholder={nameOfSelected}
          value={data}
          onChange={(e) => {
            setData(e.target.value);
          }}
          onDoubleClick={handleDoubleClick}
          ref={(ele) => (inputRef.current = ele)}
          onKeyDown={(e) => handleKeyDown(e, data)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={() => handleUpdate(data)} color="primary" autoFocus>
          Update
        </Button>
      </DialogActions>
    </div>
  );
}

export default FocusInput;
