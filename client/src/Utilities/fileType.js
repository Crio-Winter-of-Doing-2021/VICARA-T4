import SlideshowIcon from "@material-ui/icons/Slideshow";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import DescriptionIcon from "@material-ui/icons/Description";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import ImageIcon from "@material-ui/icons/Image";
import MovieIcon from "@material-ui/icons/Movie";
import MusicNoteIcon from "@material-ui/icons/MusicNote";

var allowedDocFiles = [".doc", ".docx"];
var allowedPdfFiles = [".pdf"];
var allowedImageFiles = [".jpeg", ".jpg",".gif",".bmp",".png",".tiff?",".webp",".svg"];
var allowedVideoFiles = [".mp4",".mov",".wmv",".avi",".avchd",".flv",".mkv",".webm",".mpeg-2"];
var allowedExcelFiles = [".xls", ".xlsx"];
var allowedPptFiles = [".ppt", ".pptx"];
var allowedMusicFiles = [".mp3", ".wav"];

var docRegex = new RegExp(
"([a-zA-Z0-9s_\\.-:])+(" + allowedDocFiles.join("|") + ")$"
);
var pdfRegex = new RegExp(
"([a-zA-Z0-9s_\\.-:])+(" + allowedPdfFiles.join("|") + ")$"
);
var imgRegex = new RegExp(
"([a-zA-Z0-9s_\\.-:])+(" + allowedImageFiles.join("|") + ")$"
);
var musicRegex = new RegExp(
"([a-zA-Z0-9s_\\.-:])+(" + allowedMusicFiles.join("|") + ")$"
);
var videoRegex = new RegExp(
"([a-zA-Z0-9s_\\.-:])+(" + allowedVideoFiles.join("|") + ")$"
);
var excelRegex = new RegExp(
"([a-zA-Z0-9s_\\.-:])+(" + allowedExcelFiles.join("|") + ")$"
);
var pptRegex = new RegExp(
"([a-zA-Z0-9s_\\.-:])+(" + allowedPptFiles.join("|") + ")$"
);

export const typeTest=(name)=>{
  if (docRegex.test(name)) return <DescriptionIcon style={{color:"#3086F6"}} />;
  if (pdfRegex.test(name)) return <PictureAsPdfIcon style={{color:"#ED3F23"}} />;
  if (imgRegex.test(name)) return <ImageIcon style={{color:"#D263D2"}} />;
  if (excelRegex.test(name)) return <LibraryBooksIcon style={{color:"#41A15E"}} />;
  if (pptRegex.test(name)) return <SlideshowIcon style={{color:"#F8BF29"}} />;
  if (videoRegex.test(name)) return <MovieIcon style={{color:"#F64225"}} />;
  if (musicRegex.test(name)) return <MusicNoteIcon style={{color:"#7E387D"}} />;

  return <InsertDriveFileOutlinedIcon />;
};

export const giveExtensionType=(name)=>{
if (docRegex.test(name)) return "docs";
if (pdfRegex.test(name)) return "pdf";
if (imgRegex.test(name)) return "image";
if (excelRegex.test(name)) return "excel";
if (pptRegex.test(name)) return "ppt";
if (videoRegex.test(name)) return "video";
if (musicRegex.test(name)) return "audio";

return null;
};