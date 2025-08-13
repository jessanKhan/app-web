const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const joiSchemaValidation = require('../middleware/joiSchemaValidation');
const userSchema = require('../apiSchema/userSchema');
const tokenValidation = require('../middleware/tokenValidation');
var multer  = require('multer');
var upload = multer({ dest: './uploads/profile_pic/' });
const uploadPlaylist = multer({ dest: "./uploads/playlist" });
const uploadKaraoke = multer({ dest: "./uploads/user_karaoke" });

router.post('/otp-generation',
  joiSchemaValidation.validateBody(userSchema.otpGeneration),
  userController.sendOtp
);
router.post('/otp-validation',
  joiSchemaValidation.validateBody(userSchema.otpValidation),
  userController.otpValidation
);
router.post('/signup',upload.single('file'),
  joiSchemaValidation.validateBody(userSchema.signup),
  userController.signup
);
router.post('/social-login',
  //joiSchemaValidation.validateBody(userSchema.socialLogin),
  userController.socialLogin
)

router.post('/login',
  joiSchemaValidation.validateBody(userSchema.login),
  userController.login
)

router.get('/profile/details',
  tokenValidation.validateToken,
  userController.getUser
)

router.post('/profile/update',
  tokenValidation.validateToken,
  upload.single('file'),
  userController.updateProfile
)

router.post('/insertFavourite',
  tokenValidation.validateToken,
  joiSchemaValidation.validateBody(userSchema.favourite),
  userController.addtoFavourite
)
router.get(
  "/favourite",
 tokenValidation.validateToken,
 userController.getFavouriteList
);
router.delete(
  "/favourite/:id",
 tokenValidation.validateToken,
 userController.deleteFavourite
);
router.post(
  "/playlist/create",uploadPlaylist.single("file") ,
 tokenValidation.validateToken,
 joiSchemaValidation.validateBody(userSchema.createPlaylist),
 userController.createPlaylist
);
router.get(
  "/playlist/fetch",
 tokenValidation.validateToken,
 userController.fetchPlaylist
);
router.delete(
  "/playlist/delete/:id",
 tokenValidation.validateToken,
 userController.deletePlaylist
);

router.post(
  "/playlist/addSong",
  tokenValidation.validateToken,
  joiSchemaValidation.validateBody(userSchema.addPlaylistSong),
  userController.addPlaylistSong
);
router.post(
  "/playlist/removeSong",
  tokenValidation.validateToken,
  joiSchemaValidation.validateBody(userSchema.addPlaylistSong),
  userController.removePlaylistSong
);

router.get(
  "/playlist/details/:id",
  tokenValidation.validateToken,
  userController.playlistDetails
);

router.get(
  "/karaokeist",
 tokenValidation.validateToken,
 userController.karaokeList
);

router.post(
  "/karaoke/save",
  uploadKaraoke.single("file"),
  tokenValidation.validateToken,
  joiSchemaValidation.validateBody(userSchema.insertKaraokeSchema),
  userController.insertKaraoke
);
router.delete(
  "/karaoke/:id",
  tokenValidation.validateToken,
  userController.deleteKaraoke
);



router.get(
  "/karaoke/getall",
 tokenValidation.validateToken,
 userController.getUserCreatedKaraoke
);


router.get(
  "/library/details",
 tokenValidation.validateToken,
 userController.getUserLibrary
);


//Subscription

router.get(
  "/package/all",
 tokenValidation.validateToken,
 userController.getAllPackage
);
router.post(
  "/initiate_transaction/",
  tokenValidation.validateToken,
  //joiSchemaValidation.validateBody(userSchema.insertKaraokeSchema),
  userController.inititateTransaction
);
router.post(
  "/subscribe/",
  tokenValidation.validateToken,
  //joiSchemaValidation.validateBody(userSchema.insertKaraokeSchema),
  userController.insertSubscription
);
router.post(
  "/play_song/",
  tokenValidation.validateToken,
  //joiSchemaValidation.validateBody(userSchema.insertKaraokeSchema),
  userController.insertSongPlay
);

router.get(
  "/logout/",
  tokenValidation.validateToken,
  //joiSchemaValidation.validateBody(userSchema.insertKaraokeSchema),
  userController.logout
);

router.post(
  "/giftcard/validate",
 tokenValidation.validateToken,
 userController.validateGiftcard
);
router.get(
  "/song_played/list",
 tokenValidation.validateToken,
 userController.getPlayedSongList
);

router.post(
  "/emailOTP",
 userController.emailOTP
);

router.post('/otp-validation-email-mobile',
  //joiSchemaValidation.validateBody(userSchema.otpValidation),
  userController.otpValidationEmailMobile
);

router.get(
  "/otpTest",
 userController.otpTest
);
router.post('/handlesslresponse',
  userController.handlesslresponse
);


router.post('/delete-account-request',
  //joiSchemaValidation.validateBody(userSchema.otpGeneration),
  userController.deleteAccountRequest
);

router.get('/delete-account',
  tokenValidation.validateToken,
  //joiSchemaValidation.validateBody(userSchema.otpGeneration),
  userController.deleteAccount
);
router.get('/unsubscribe',
  tokenValidation.validateToken,
  //joiSchemaValidation.validateBody(userSchema.otpGeneration),
  userController.unsubscribe
);

router.post('/forgot-password',
  //joiSchemaValidation.validateBody(userSchema.otpGeneration),
  userController.forgotPassword
);
router.post('/reset-password',
  //joiSchemaValidation.validateBody(userSchema.otpGeneration),
  userController.resetPassword
);
// router.get('/combine',
//   joiSchemaValidation.validateBody(userSchema.signup),
//   userController.combine
// );

router.get(
  "/subscription_exired/",
  userController.subscription_exired
);

router.get(
  "/notification/new",
 tokenValidation.validateToken,
 userController.fetchNotificationlist
);
router.get(
  "/notification/all",
 tokenValidation.validateToken,
 userController.fetchAllNotificationlist
);

router.get(
  "/notification/view/:id",
 tokenValidation.validateToken,
 userController.notificationView
);

module.exports = router;