const express = require('express');
const router = express.Router();
const { getBranches, createBranch, deleteBranch } = require('../controllers/branchController');

router.get('/', getBranches);
router.post('/', createBranch);
router.delete('/:id', deleteBranch);

module.exports = router;
