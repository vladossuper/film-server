const express = require('express');

const router = express.Router();
const searchController = require('../../controllers/search');

router.post('/search', searchController);

module.exports = router;