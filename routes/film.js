const express = require('express');

const router = express.Router();
const filmController = require('../controllers/film');

router.post('/film/set', filmController.setFilmController);
router.get('/film/get', filmController.getFilmController);
router.post('/film/delete', filmController.deleteFilmController);
router.post('/film/details', filmController.detailsFilmController);

module.exports = router;