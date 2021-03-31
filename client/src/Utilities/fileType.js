import SlideshowIcon from '@material-ui/icons/Slideshow';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import DescriptionIcon from '@material-ui/icons/Description';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import ImageIcon from '@material-ui/icons/Image';
import MovieIcon from '@material-ui/icons/Movie';
import MusicNoteIcon from '@material-ui/icons/MusicNote';

export const typeTest=(name)=>{
    var allowedDocFiles = [".doc", ".docx"];
    var allowedPdfFiles = [".pdf"];
    var allowedImageFiles = [".jpeg", ".jpg",".gif",".bmp",".png",".tiff?",".webp",".svg"];
    var allowedVideoFiles = [".mp4",".mov",".wmv",".avi",".avchd",".flv",".mkv",".webm",".mpeg-2"];
    var allowedExcelFiles = [".xls", ".xlsx"];
    var allowedPptFiles = [".ppt", ".pptx"];
    var allowedMusicFiles = [".mp3", ".wav"];

    var docRegex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedDocFiles.join('|') + ")$");
    var pdfRegex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedPdfFiles.join('|') + ")$");
    var imgRegex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedImageFiles.join('|') + ")$");
    var musicRegex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedMusicFiles.join('|') + ")$");
    var videoRegex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedVideoFiles.join('|') + ")$");
    var excelRegex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedExcelFiles.join('|') + ")$");
    var pptRegex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedPptFiles.join('|') + ")$");


    if(docRegex.test(name)) return <DescriptionIcon/>;
    if(pdfRegex.test(name)) return <PictureAsPdfIcon/>;
    if(imgRegex.test(name)) return <ImageIcon/>;
    if(excelRegex.test(name)) return <LibraryBooksIcon/>;
    if(pptRegex.test(name)) return <SlideshowIcon/>;
    if(videoRegex.test(name)) return <MovieIcon/>
    if(musicRegex.test(name)) return <MusicNoteIcon/>

    return <InsertDriveFileOutlinedIcon/>
}