var express = require("express");
var router = express.Router();

const {
  loginPage,
  homePage,
  userSignup,
  loginAction,
  viewProducts,
  logoutUser,
  productDescription,
  otpLogin,
  otpCode,
  otpVerify,
  cart,
  addToCart,
  changeProductQuantity,
  homeRedirect,
  removeProductQuantity,
  checkout,
  placeOrder,
  orderSuccessful,
  viewOrders,
  viewOrderProducts,
  cancelUserOrder,
  productPagination,
  verifyPayment,
  userAccount,
  addUserAdress,
  addMultiAddress,
  checkCoupon,
  contactUs,
  categoryFilter,
  returnUserOrder,
  fillAddress,
  editUserAddress,
  editMultiAddressSubmit,
  cancelReason,
  returnReason,
  userWallet,
  deleteAddress
} = require("../Controller/user-controller");
const {
  nocache,
  loginRedirect,
  sessionCheck,
  verifyLogin,
} = require("../Controller/middlewares/user-middlewares");

/* GET users listing. */
router.get("/", homePage);
router.get("/login-page", nocache, loginRedirect, loginPage);
router.post("/user-signup", userSignup);
router.post("/login-action", loginAction);
router.get("/viewlistProducts", sessionCheck, verifyLogin, viewProducts);
router.get("/logout", logoutUser);
router.get("/viewProductDescription/:id", sessionCheck, productDescription);
router.get("/otplogin", otpLogin);
router.post("/otpCode", otpCode);
router.post("/otpVerify", otpVerify);
router.get("/cart", sessionCheck, cart);
router.get("/add-to-cart/:id",sessionCheck, addToCart);
router.post("/changeproductquantity",sessionCheck, changeProductQuantity);
router.get("/home-redirect",sessionCheck, homeRedirect);
router.post("/removeProductQuantity",sessionCheck, removeProductQuantity);
router.get("/checkout", sessionCheck,checkout);
router.post("/place-order",sessionCheck, placeOrder);
router.get("/order-successful", sessionCheck,orderSuccessful);
router.get("/viewOrders",sessionCheck, viewOrders);
router.get("/view-order-products/:id",sessionCheck, viewOrderProducts);
router.post("/cancel-user-order",sessionCheck, cancelUserOrder);
router.get("/productPagination/:id",sessionCheck, productPagination);
router.post("/verify-payment",sessionCheck, verifyPayment);
router.get("/user-account",sessionCheck, userAccount);
router.get("/add-user-adress",sessionCheck, addUserAdress);
router.post("/add-multi-address/:id",sessionCheck, addMultiAddress);
router.post("/checkcoupon",sessionCheck, checkCoupon);
router.get("/contact-us",sessionCheck, contactUs);
router.post("/categoryFilter",sessionCheck, categoryFilter);
router.post('/return-user-order',sessionCheck, returnUserOrder);
router.post('/fillAddress' ,sessionCheck, fillAddress);
router.get('/edit-user-address/:id',sessionCheck, editUserAddress);
router.post('/edit-multi-address-submit/:id',sessionCheck, editMultiAddressSubmit);
router.post('/cancel-reason',sessionCheck, cancelReason);
router.post('/return-reason',sessionCheck, returnReason);
router.get('/user-wallet',sessionCheck, userWallet)
router.get('/delete-user-address/:id',sessionCheck,deleteAddress)


module.exports = router;
