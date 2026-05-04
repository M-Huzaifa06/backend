const express = require('express');
const router = express.Router();
const { getBarbers } = require('../controllers/barberController');

router.get('/', getBarbers);

module.exports = router;