const express = require('express');
const router = express.Router();
const songController = require('../controller/songController');
const joiSchemaValidation = require('../middleware/joiSchemaValidation');
const tokenValidation = require('../middleware/tokenValidation');

router.get(
  "/search/v1.0",
  songController.searchSong
);

router.get(
  "/search/pupulateSearchTerm",
  songController.pupulateSearchTerm
);

router.get(
  "/all/fetch",
  songController.fetchALL
);

router.get(
    "/:id",
    tokenValidation.validateToken,
    songController.getSongById
);

router.get(
  "/podcast/all",
  tokenValidation.validateToken,
  songController.fetchAllPodcast
);


router.get(
  "/film",
  songController.getAllFilm
);

router.get(
  "/recommendation/:id",
  tokenValidation.validateToken,
  songController.getRecommendation
);


module.exports = router;