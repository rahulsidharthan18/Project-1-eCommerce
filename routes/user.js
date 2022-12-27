var express = require('express');
var router = express.Router();

const {loginPage,homePage,userSignup,loginAction} = require('../Controller/user-controller');
const {nocache , loginRedirect} = require('../Controller/middlewares/user-middlewares');

/* GET users listing. */
router.get('/',homePage);
router.get('/login-page',nocache , loginRedirect , loginPage);
router.post('/user-signup',userSignup);
router.post('/login-action',loginAction);

module.exports = router;
