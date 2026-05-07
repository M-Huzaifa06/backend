const express = require('express');
const router = express.Router();
const { getServices, createService, deleteService } = require('../controllers/serviceController');

router.get('/', getServices);
router.post('/', createService);
router.delete('/:id', deleteService);

module.exports = router;
