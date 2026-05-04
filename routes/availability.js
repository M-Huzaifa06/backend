const express = require('express');
const router = express.Router();
const { getSlots, checkSlot } = require('../controllers/availabilityController');

router.post('/slots', getSlots);
router.post('/check', checkSlot);

module.exports = router;
