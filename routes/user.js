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
  deleteAddress,
  signupOtpVerify
} = require("../Controller/user-controller");
const {
  nocache,
  loginRedirect,
  sessionCheck,
  verifyUser,
  categorySessionCheck,
  addCartSessionCheck
} = require("../Controller/middlewares/user-middlewares");

/* GET users listing. */
router.get("/", homePage);
router.get("/login-page", nocache, loginRedirect, loginPage);
router.post("/user-signup", userSignup);
router.post("/login-action", loginAction);
router.get("/viewlistProducts", viewProducts);
router.get("/logout", logoutUser);
router.get("/viewProductDescription/:id", productDescription);
router.get("/otplogin", otpLogin);
router.post("/otpCode", otpCode);
router.post("/otpVerify", otpVerify);
router.get("/cart",verifyUser, sessionCheck, cart);
router.get("/add-to-cart/:id",verifyUser,addCartSessionCheck, addToCart);
router.post("/changeproductquantity",verifyUser,sessionCheck, changeProductQuantity);
router.get("/home-redirect",verifyUser,sessionCheck, homeRedirect);
router.post("/removeProductQuantity",verifyUser,sessionCheck, removeProductQuantity);
router.get("/checkout", verifyUser,sessionCheck,checkout);
router.post("/place-order",verifyUser,sessionCheck, placeOrder);
router.get("/order-successful",verifyUser, sessionCheck,orderSuccessful);
router.get("/viewOrders",verifyUser,sessionCheck, viewOrders);
router.get("/view-order-products/:id",verifyUser,sessionCheck, viewOrderProducts);
router.post("/cancel-user-order",verifyUser,sessionCheck, cancelUserOrder);
router.get("/productPagination/:id",verifyUser,sessionCheck, productPagination);
router.post("/verify-payment",verifyUser,sessionCheck, verifyPayment);
router.get("/user-account",verifyUser,sessionCheck, userAccount);
router.get("/add-user-adress",verifyUser,sessionCheck, addUserAdress);
router.post("/add-multi-address/:id",verifyUser,sessionCheck, addMultiAddress);
router.post("/checkcoupon",verifyUser,sessionCheck, checkCoupon);
router.get("/contact-us",verifyUser,sessionCheck, contactUs);
router.post("/categoryFilter",verifyUser,categorySessionCheck, categoryFilter);
router.post('/return-user-order',verifyUser,sessionCheck, returnUserOrder);
router.post('/fillAddress' ,verifyUser,sessionCheck, fillAddress);
router.get('/edit-user-address/:id',verifyUser,sessionCheck, editUserAddress);
router.post('/edit-multi-address-submit/:id',verifyUser,sessionCheck, editMultiAddressSubmit);
router.post('/cancel-reason',verifyUser,sessionCheck, cancelReason);
router.post('/return-reason',verifyUser,sessionCheck, returnReason);
router.get('/user-wallet',verifyUser,sessionCheck, userWallet)
router.get('/delete-user-address/:id',verifyUser,sessionCheck,deleteAddress);
router.post('/signupOtpVerify', signupOtpVerify);


module.exports = router;
