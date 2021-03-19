import API from "../../axios";
import { fileUploadLoader } from "../slices/loaderSlice";

const upload = (file, parent) => (dispatch) => {
  dispatch(fileUploadLoader());
  let formData = new FormData();

  formData.append("file", file);
  formData.append("PARENT", parent);

  return API.post("/api/file/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default upload;
