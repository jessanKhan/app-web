const express = require('express');
const router = express.Router();
const homeController = require('../controller/homeController');
const joiSchemaValidation = require('../middleware/joiSchemaValidation');
const tokenValidation = require('../middleware/tokenValidation');

router.get('/',
    homeController.getAllHomes  
);

router.get(
    "/cms/:slug",
    homeController.getCMS
);

router.get('/search/',
    homeController.Search  
);

module.exports = router;