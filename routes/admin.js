var express = require("express");
var router = express.Router();

const {
  adminLoginpage,
  loginAdmin,
  adminAlluser,
  productsAdmin,
  getAllUsers,
  adminBlockUser,
  adminUnBlockUser,
  addProducts,
  addProductsSubmit,
  deleteProductAction,
  editProductAction,
  editProductSubmit,
  dashboardAdmin,
  editCancelAdmin,
  addCategory,
  addCategorySubmit,
  allCategory,
  editCategory,
  deleteCategory,
  editCategorySubmit,
  signoutAdmin,
  orderManagement,
  viewProductsOrder,
  cancelOrderManagement,
  viewDiscountCoupons,
  addCoupon,
  addCouponSubmit,
  removeCoupon,
  editAdminCoupon,
  editCouponSubmit,
  orderStatus,
  salesReport,
  addCategoryOffer,
  addProductsOffer,
  productOffer,
  categoryOffer,
  salesDateFilter,
  returnAdminOrder,
  deleteProductOffer 
} = require("../Controller/admin-controller");
const {
  nocache,
  loginRedirect,
} = require("../Controller/middlewares/admin-middlewares");
var multer = require('multer');
const {uploadMultiple} = require("../public/javascripts/multerConfig")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/product-images')
  },
  filename: function (req, file, cb) {
    console.log(file,"filemulter");
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg')
  }
})

const upload = multer({ storage: storage })



router.get("/", nocache, loginRedirect, adminLoginpage);
router.post("/login-action", loginAdmin);
// router.use(verifyLogin)
router.get("/alluser", adminAlluser, getAllUsers);
router.get("/allProducts", productsAdmin);
router.get("/blockUser", adminBlockUser);
router.get("/unBlockUser", adminUnBlockUser);
router.get("/addproducts", addProducts);
router.post("/addProduct-submit", upload.array('image1', 4), addProductsSubmit);
router.get("/delete-product/:id", deleteProductAction);
router.get("/edit-product/:id", editProductAction);
router.post("/editProduct-submit/:id", editProductSubmit);
router.get("/dashboard", dashboardAdmin);
router.get("/editCancel", editCancelAdmin);
router.get("/addcategory", addCategory);
router.post("/add-categorysubmit", addCategorySubmit);
router.get("/allcategory", allCategory);
router.get("/edit-category/:id", editCategory);
router.get("/delete-category/:id", deleteCategory);
router.post("/edit-category-submit", editCategorySubmit);
router.get("/signOut-Admin", signoutAdmin);
router.get("/order-management", orderManagement);
router.get("/products-ordermanagement/:id", viewProductsOrder);
router.post("/cancel-ordermanagement/:id", cancelOrderManagement);
router.get("/allCoupons", viewDiscountCoupons);
router.get("/addCoupon", addCoupon);
router.post("/addCoupon-submit", addCouponSubmit);
router.get("/remove-coupon/:id", removeCoupon);
router.get("/edit-coupon/:id", editAdminCoupon);
router.post("/editCoupon-submit/:id", editCouponSubmit);
router.post("/order-status", orderStatus);
router.get("/salesReport" ,salesReport);
router.post("/add-category-offer", addCategoryOffer);
router.post("/add-product-offer", addProductsOffer);
router.get("/productOffer", productOffer);
router.get("/categoryOffer", categoryOffer);
router.post("/sales-date-filter", salesDateFilter);
router.post("/return-ordermanagement/:id", returnAdminOrder);
router.get("/delete-product-offer/:id", deleteProductOffer);


module.exports = router;
