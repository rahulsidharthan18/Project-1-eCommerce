var express = require('express');
var router = express.Router();

const { adminLoginpage, loginAdmin, adminAlluser ,categoryAdmin ,ordersAdmin ,getAllUsers ,adminBlockUser ,adminUnBlockUser } = require('../Controller/admin-controller');
const {nocache , loginRedirect} = require('../Controller/middlewares/admin-middlewares');

router.get('/', nocache , loginRedirect , adminLoginpage);
router.post('/login-action', loginAdmin);
router.get('/alluser', adminAlluser , getAllUsers);
router.get('/allcategory',categoryAdmin);
router.get('/allorders',ordersAdmin);
router.get('/blockUser',  adminBlockUser)                                                  
router.get('/unBlockUser',  adminUnBlockUser)

module.exports = router;
