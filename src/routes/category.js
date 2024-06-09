const express = require('express');
const { check, validationResult } = require('express-validator');
const { createCategory, getCategories, addSubcategory, getMostExpenseCategories } = require('../controllers/category');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.post(
  '/',
  [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('icon').not().isEmpty().withMessage('Icon is required'),
    check('color').not().isEmpty().withMessage('Color is required'),
    check('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense')
  ],
  authenticateToken,
  createCategory
);

router.get('/', authenticateToken, getCategories);
router.get('/most-expense', authenticateToken, getMostExpenseCategories);

router.post(
  '/:id/subcategories',
  [
    check('name').not().isEmpty().withMessage('Subcategory name is required'),
    check('icon').not().isEmpty().withMessage('Subcategory icon is required'),
    check('color').not().isEmpty().withMessage('Subcategory color is required')
  ],
  authenticateToken,
  addSubcategory
);

module.exports = router;
