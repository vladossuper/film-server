const express = require('express');

const router = express.Router();
const filmController = require('../controllers/film');

router.post('/film/set', filmController.setFilmController);
router.get('/film/get', filmController.getFilmController);
router.post('/film/delete', filmController.deleteFilmController)

module.exports = router;