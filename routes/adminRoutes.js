const express = require('express');
const router = express.Router();
const adminController = require("../controller/adminController");

const {
    login,
    fetchAllcategories,
    insertCategory,
    updateCategory,
    deleteCategory,
    singleCategoryDetails, 
    fetchAllmood, 
    fetchAllplaylist,
    singleMoodDetails,
    insertMood,
    updateMood,
    deleteMood,
    insertPlaylist,
    deletePlaylist,
    fetchAllUserKaraoke,
    deleteKaraoke,
    fetchAllartist,
    insertArtist,
    updateArtist,
    deleteArtist,
    singleArtistDetails,
    exportUser,
    getPlaylistById,
    updatePlaylist,
    exportPlaylist,
    importPlaylist,
    fetchAllactor,
    insertActor,
    updateActor,
    deleteActor,
    singleActorDetails,
    singlePromotionalBanner,
    singleBanner,
    updateMainBanner,
    fetchAllCMS,
    singleCMSDetails,
    updateCMS,
    import_song,
    getAllDeleteRequest,
    updateAccountRequest,
    fetchAllfilm,
    insertFilm,
    updateFilm,
    deleteFilm,
    singleFilmDetails, 
    fetchAllpodcastMain,
    insertPodcastMain,
    updatePodcastMain,
    deletePodcastMain,
    singlePodcastDetails, 
    contentOrder,
    setOrder
  } = require('../controller/adminController');

const {
  fetchAllSong,
  insertSong,updateSong,
  deleteSong,
  fetchAllKaraoke, 
  deleteKaraokeList, 
  insertKaraoke, 
  updateKaraoke, 
  singleKaraokeDetails,
  getSongById,
  fetchAllPodcast,
  insertPodcast,updatePodcast,
  deletePodcast,getPodcastById,updatePromotionalBanner,fetchAllPlaylistSong
} = require('../controller/songController');

const {
  fetchAllCoupon,
  insertCoupon,
  deleteCoupon,
  getCouponById,
  updateCoupon
} = require('../controller/couponController');

const joiSchemaValidation = require('../middleware/joiSchemaValidation');
const userSchema = require('../apiSchema/userSchema');
const songSchema = require('../apiSchema/songSchema');
const tokenValidation = require('../middleware/tokenValidation');
const multer = require("multer");

const uploadCategories = multer({ dest: "./uploads/categories" });
const uploadArtist = multer({ dest: "./uploads/artists" });
const uploadActor = multer({ dest: "./uploads/actor" });
const uploadMood = multer({ dest: "./uploads/mood" });
const uploadHomeSection = multer({ dest: "./uploads/homesection" });
const uploadSong = multer({ dest: "./uploads/songs" });
const uploadFilm = multer({ dest: "./uploads/film" });
const uploadPodcast = multer({ dest: "./uploads/film" });

const uploadPlaylist = multer({ dest: "./uploads/playlist" });
var mutiUpload = uploadSong.fields([{name:"thumb_image"},{name:"media_file"}]);

const uploadBanner = multer({ dest: "./uploads/banner" });
var mutiUploadTopBanner = uploadBanner.fields([{name:"img_light"},{name:"img_dark"}]);

var mutiUploadCategory = uploadSong.fields([{name:"file"},{name:"banner_image"}]);
var mutiUploadPlaylist = uploadSong.fields([{name:"file"},{name:"banner_image"}]);
var mutiUploadFilm = uploadFilm.fields([{name:"file"},{name:"banner_image"}]);
var mutiUploadPodcast = uploadPodcast.fields([{name:"file"},{name:"banner_image"}]);

var mutiUploadArtist = uploadArtist.fields([{name:"file"},{name:"banner_image"}]);
var mutiUploadActor = uploadActor.fields([{name:"file"},{name:"banner_image"}]);

router.post('/login',
  joiSchemaValidation.validateBody(userSchema.login),
  login
)

/////////   Category ////////////////
router.get(
  "/categories",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllcategories
);
router.post(
  "/categories",
  mutiUploadCategory,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertCategory
);
router.patch(
  "/categories/:id",
  mutiUploadCategory,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateCategory
);
router.delete(
  "/categories/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteCategory
);
router.get(
  "/categories/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleCategoryDetails
); // secured


/////////   Artist ////////////////
router.get(
  "/artists",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllartist
);
router.post(
  "/artists",
  mutiUploadArtist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertArtist
);
router.patch(
  "/artists/:id",
  mutiUploadArtist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateArtist
);
router.delete(
  "/artists/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteArtist
);
router.get(
  "/artists/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleArtistDetails
); // secured

/////////   Actor ////////////////
router.get(
  "/actors",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllactor
);
router.post(
  "/actors",
  mutiUploadActor,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertActor
);
router.patch(
  "/actors/:id",
  mutiUploadActor,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateActor
);
router.delete(
  "/actors/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteActor
);
router.get(
  "/actors/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleActorDetails
); 
/////////Bannr  /////////////

router.get(
  "/promotionalBanner/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singlePromotionalBanner
); 
router.patch(
  "/promotionalBanner/:id",
  mutiUploadTopBanner,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updatePromotionalBanner
);

router.get(
  "/mainBanner/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleBanner
); 
router.patch(
  "/mainBanner/:id",
  uploadBanner.single("file"),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateMainBanner
);
/////////   Songs  //////////
router.get(
  "/songs",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllSong
);
router.post(
  "/song",
  mutiUpload,
  joiSchemaValidation.validateBody(songSchema.insertSongSchema),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertSong
);
router.delete(
  "/song/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteSong
);
router.get(
  "/song/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  getSongById
); // secured
router.patch(
  "/song/:id",
  mutiUpload,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateSong
);
router.post("/import-song", 
  uploadSong.single("file"),  
  tokenValidation.validateToken, 
  tokenValidation._userAccess(["admin"]), 
  import_song
)
router.get(
  "/songs/playlist/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllPlaylistSong
);
///////// Mood  Start /////////////////
router.get(
  "/mood",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllmood
);
router.get(
  "/mood/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleMoodDetails
);
router.post(
  "/mood",
  uploadMood.single("file"),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertMood
);
router.patch(
  "/mood/:id",
  uploadMood.single("file"),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateMood
);
router.delete(
  "/mood/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteMood
);
////////  Playlist //////////
router.get(
  "/playlist",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllplaylist
);
router.post(
  "/playlist",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertPlaylist
);
router.delete(
  "/playlist/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deletePlaylist
);
router.get(
  "/playlist/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  getPlaylistById
); // secured
router.patch(
  "/playlist/:id",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updatePlaylist
);
router.get(
  "/playlist/download/list",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  exportPlaylist
);
router.post("/import-playlist", 
  uploadSong.single("file"),  
  tokenValidation.validateToken, 
  tokenValidation._userAccess(["admin"]), 
  importPlaylist
)

/////////   Karaoke  //////////
router.get(
  "/karaoke/user",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllUserKaraoke
);
router.delete(
  "/karaoke/user/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteKaraoke
);







router.get(
  "/karaoke",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllKaraoke
);
router.post(
  "/karaoke",
  mutiUpload,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertKaraoke
);
router.patch(
  "/karaoke/:id",
  mutiUpload,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateKaraoke
);
router.delete(
  "/karaoke/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteKaraokeList
);
router.get(
  "/karaoke/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleKaraokeDetails
); // secured


////////  Report //////////
router.get(
  "/user/export",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  exportUser
)
///////// CMS  /////////////////
router.get(
  "/cms",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllCMS
);
router.get(
  "/cms/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleCMSDetails
);
router.patch(
  "/cms/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateCMS
);
/////////   Podcast  //////////
router.get(
  "/podcast",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllPodcast
);
router.post(
  "/podcast",
  mutiUpload,
  //joiSchemaValidation.validateBody(songSchema.insertSongSchema),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertPodcast
);
router.delete(
  "/podcast/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deletePodcast
);
router.get(
  "/podcast/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  getPodcastById
); // secured
router.patch(
  "/podcast/:id",
  mutiUpload,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updatePodcast
);

/////////   Coupon ////////////////
router.get(
  "/coupon",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllCoupon
);
router.post(
  "/coupon",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertCoupon
);
router.delete(
  "/coupon/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteCoupon
);
router.get(
  "/coupon/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  getCouponById
);
router.patch(
  "/coupon/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateCoupon
);


/////////   Account Suspend Request ////////////////
router.get('/delete-account-request',
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  getAllDeleteRequest
);
router.patch(
  "/update-request/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateAccountRequest
);

/////////   Film ////////////////
router.get(
  "/film",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllfilm
);
router.post(
  "/film",
  mutiUploadFilm,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertFilm
);
router.patch(
  "/film/:id",
  mutiUploadFilm,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateFilm
);
router.delete(
  "/film/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteFilm
);
router.get(
  "/film/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleFilmDetails
); // secured


/////////   Podcast ////////////////
router.get(
  "/podcast_main",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllpodcastMain
);
router.post(
  "/podcast_main",
  mutiUploadPodcast,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertPodcastMain
);
router.patch(
  "/podcast_main/:id",
  mutiUploadPodcast,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updatePodcastMain
);
router.delete(
  "/podcast_main/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deletePodcastMain
);
router.get(
  "/podcast_main/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singlePodcastDetails
); // secured

router.get(
  "/content_order/getOrder",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  contentOrder
);
router.post(
  "/setOrder",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  setOrder
);


////////  Notification //////////
router.get(
  "/notification",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  adminController.fetchAllNotification
);
router.post(
  "/notification",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.insertNotification
);
router.delete(
  "/notification/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.deleteNotification
);
router.get(
  "/notification/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.getNotificationById
); // secured
router.patch(
  "/notification/:id",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.updateNotification
);


///  Home Section

router.get(
  "/home/section",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  adminController.fetchAllHomeSection
);
router.get(
  "/home/section/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.singleHomeSectionDetails
);
router.post(
  "/home/section",
  mutiUploadCategory,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.insertHomeSection
);
router.patch(
  "/home/section/:id",
  mutiUploadCategory,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.updateHomeSection
);
router.delete(
  "/home/section/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.deleteHomeSection
);

router.get(
  "/home/library",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  adminController.fetchAllHomeLibrary
);
router.post(
  "/home/library",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.insertHomeLibrary
);
router.delete(
  "/home/library/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.deleteHomeLibrary
);
router.get(
  "/home/library/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.getHomeLibraryById
); // secured
router.patch(
  "/home/library/:id",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.updateHomeLibrary
);

/// Advertisement
router.get(
  "/home/advertisement",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  adminController.fetchAllAdverstisement
);
router.post(
  "/home/advertisement",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.insertAdverstisement
);
router.delete(
  "/home/advertisement/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.deleteAdverstisement
);
router.get(
  "/home/advertisement/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.getAdverstisementById
); // secured
router.patch(
  "/home/advertisement/:id",
  mutiUploadPlaylist,
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  adminController.updateAdverstisement
);

module.exports = router;