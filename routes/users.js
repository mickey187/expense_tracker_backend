var express = require('express');
const { createUser, getUserById } = require('../Controllers/UserController');
var router = express.Router();


router.post('/', createUser);
router.get('/:userId', getUserById);

module.exports = router;
