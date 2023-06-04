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
  deleteProductOffer,
  deleteCategoryOffer,
} = require("../Controller/admin-controller");
const {
  nocache,
  loginRedirect,
  sessionCheck,
} = require("../Controller/middlewares/admin-middlewares");
var multer = require("multer");
const { uploadMultiple } = require("../public/javascripts/multerConfig");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/product-images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ".jpg");
  },
});

const upload = multer({ storage: storage });

router.get("/", nocache, loginRedirect, adminLoginpage);
router.post("/login-action", loginAdmin);
router.get("/alluser", sessionCheck, adminAlluser, getAllUsers);
router.get("/allProducts", sessionCheck, productsAdmin);
router.get("/blockUser", sessionCheck, adminBlockUser);
router.get("/unBlockUser", sessionCheck, adminUnBlockUser);
router.get("/addproducts", sessionCheck, addProducts);
router.post(
  "/addProduct-submit",
  sessionCheck,
  upload.array("image1", 4),
  addProductsSubmit
);
router.get("/delete-product/:id", sessionCheck, deleteProductAction);
router.get("/edit-product/:id", sessionCheck, editProductAction);
router.post(
  "/editProduct-submit/:id",
  sessionCheck,
  upload.array("image1", 4),
  editProductSubmit
);
router.get("/dashboard", sessionCheck, dashboardAdmin);
router.get("/editCancel", sessionCheck, editCancelAdmin);
router.get("/addcategory", sessionCheck, addCategory);
router.post("/add-categorysubmit", sessionCheck, addCategorySubmit);
router.get("/allcategory", sessionCheck, allCategory);
router.get("/edit-category/:id", sessionCheck, editCategory);
router.get("/delete-category/:id", sessionCheck, deleteCategory);
router.post("/edit-category-submit", sessionCheck, editCategorySubmit);
router.get("/signOut-Admin", sessionCheck, signoutAdmin);
router.get("/order-management", sessionCheck, orderManagement);
router.get("/products-ordermanagement/:id", sessionCheck, viewProductsOrder);
router.post("/cancel-ordermanagement/:id", sessionCheck, cancelOrderManagement);
router.get("/allCoupons", sessionCheck, viewDiscountCoupons);
router.get("/addCoupon", sessionCheck, addCoupon);
router.post("/addCoupon-submit", sessionCheck, addCouponSubmit);
router.get("/remove-coupon/:id", sessionCheck, removeCoupon);
router.get("/edit-coupon/:id", sessionCheck, editAdminCoupon);
router.post("/editCoupon-submit/:id", sessionCheck, editCouponSubmit);
router.post("/order-status", sessionCheck, orderStatus);
router.get("/salesReport", sessionCheck, salesReport);
router.post("/add-category-offer", sessionCheck, addCategoryOffer);
router.post("/add-product-offer", sessionCheck, addProductsOffer);
router.get("/productOffer", sessionCheck, productOffer);
router.get("/categoryOffer", sessionCheck, categoryOffer);
router.post("/sales-date-filter", sessionCheck, salesDateFilter);
router.post("/return-ordermanagement/:id", sessionCheck, returnAdminOrder);
router.get("/delete-product-offer/:id", sessionCheck, deleteProductOffer);
router.get("/delete-category-offer/:id", sessionCheck, deleteCategoryOffer);

module.exports = router;
