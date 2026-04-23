const express = require('express');
const isAuth = require('../middleware/isAuth');
const {
  createContribution,
  getContributions,
  updateContribution,
  deleteContribution
} = require('../controllers/contributionController');

const router = express.Router();

router.route('/')
  .get(isAuth, getContributions)
  .post(isAuth, createContribution);

router.route('/:id')
  .put(isAuth, updateContribution)
  .delete(isAuth, deleteContribution);

module.exports = router;
