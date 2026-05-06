const express = require('express');
const router = express.Router();
const { getBarbers, createBarber, updateBarber, deleteBarber } = require('../controllers/barberController');

router.get('/', getBarbers);
router.post('/', createBarber);
router.put('/:id', updateBarber);
router.delete('/:id', deleteBarber);

module.exports = router;
