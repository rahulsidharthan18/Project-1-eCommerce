var express = require('express');
var router = express.Router();

const { loginPage, homePage, userSignup, loginAction, viewProducts, logoutUser, productDescription, otpLogin, otpCode ,
    otpVerify ,cart ,addToCart ,changeProductQuantity ,homeRedirect ,removeProductQuantity ,checkout ,placeOrder ,orderSuccessful ,viewOrders,
    viewOrderProducts, cancelUserOrder,productPagination } = require('../Controller/user-controller');
const { nocache, loginRedirect, sessionCheck, verifyLogin } = require('../Controller/middlewares/user-middlewares');

/* GET users listing. */
router.get('/', homePage);
router.get('/login-page', nocache, loginRedirect, loginPage);
router.post('/user-signup', userSignup);
router.post('/login-action', loginAction);
router.get('/viewlistProducts',sessionCheck,verifyLogin , viewProducts);
router.get('/logout', logoutUser);
router.get('/viewProductDescription/:id', sessionCheck ,productDescription);
router.get('/otplogin', otpLogin);
router.post('/otpCode', otpCode);
router.post('/otpVerify', otpVerify);
router.get('/cart',sessionCheck , cart);
router.get('/add-to-cart/:id' , addToCart)
router.post('/changeproductquantity', changeProductQuantity);
router.get('/home-redirect', homeRedirect);
router.post('/removeProductQuantity', removeProductQuantity);
router.get('/checkout', checkout);
router.post('/place-order' ,placeOrder);
router.get('/order-successful' ,orderSuccessful);
router.get('/viewOrders', viewOrders);
router.get('/view-order-products/:id', viewOrderProducts);
router.post('/cancel-user-order/:id', cancelUserOrder);
router.get('/productPagination/:id', productPagination)


module.exports = router;