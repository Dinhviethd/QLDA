const express = require('express');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
// router.use(authMiddleware);

router.get('/', documentController.getDocuments);
router.post('/', documentController.uploadDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
