export const rightClickOptions = {
  "/recent": {
    showUpdate: true,
    showShare: true,
    showDownload: true,
    showTrash: true,
    showDelete: true,
    showRestore: false,
  },
  "/favourites": {
    showUpdate: true,
    showShare: true,
    showDownload: true,
    showTrash: true,
    showDelete: true,
    showRestore: false,
  },
  "/drive/:id": {
    showUpdate: true,
    showShare: true,
    showDownload: true,
    showTrash: true,
    showDelete: true,
    showRestore: false,
  },
  "/trash": {
    showUpdate: false,
    showShare: false,
    showDownload: false,
    showTrash: false,
    showDelete: true,
    showRestore: true,
  },
  "/shared-with-me": {
    showUpdate: false,
    showShare: false,
    showDownload: true,
    showTrash: false,
    showDelete: false,
    showRestore: false,
  },
};