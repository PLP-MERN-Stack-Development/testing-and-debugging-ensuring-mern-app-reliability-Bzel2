const express = require('express');
const {
  getAllBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  getBugStats
} = require('../controllers/bugController');

const router = express.Router();

// Routes
router.route('/stats')
  .get(getBugStats);

router.route('/')
  .get(getAllBugs)
  .post(createBug);

router.route('/:id')
  .get(getBugById)
  .patch(updateBug)
  .delete(deleteBug);

module.exports = router;
