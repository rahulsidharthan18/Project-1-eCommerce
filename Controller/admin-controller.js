const {
  doadminLoged,
  blockUser,
  unblockUser,
} = require("../Model/admin-helpers");
const { getAllUser } = require("../Model/user-helpers");
var productHelpers = require("../Model/product-helpers");
const { response } = require("express");
const adminHelpers = require("../Model/admin-helpers");
const userHelpers = require("../Model/user-helpers");

module.exports = {
  adminLoginpage(req, res) {
    res.render("admin/admin-login", { layout: "admin-layout" });
  },

  loginAdmin(req, res) {
    doadminLoged(req.body)
      .then((response) => {
        req.session.adminloggedIn = true;
        req.session.admin = response;
        res.render("admin/admin-homepage", {
          layout: "admin-layout",
          admin: true,
        });
      })
      .catch((error) => {
        res.render("admin/admin-login", {
          error: "Invalid login details",
          layout: "admin-layout",
        });
      });
  },

  adminAlluser(req, res) {
    getAllUser().then((AllUsers) => {
      res.render("admin/all-users", {
        layout: "admin-layout",
        AllUsers,
        admin: true,
      });
    });
  },

  productsAdmin(req, res) {
    productHelpers.getAllProducts().then((products) => {
      res.render("admin/all-products", {
        layout: "admin-layout",
        admin: true,
        products,
      });
    });
  },

  getAllUsers: (req, res) => {
    userHelpers.getAllUsers().then((AllUsers) => {
      res.render("admin/all-users", {
        layout: "admin-layout",
        AllUsers,
        admin: true,
      });
    });
  },

  adminBlockUser: (req, res) => {
    let blockUserId = req.query.id;
    blockUser(blockUserId);
    res.redirect("/admin/alluser");
  },
  //UNBLOCK USER
  adminUnBlockUser: (req, res) => {
    let unblockUserId = req.query.id;
    unblockUser(unblockUserId);
    res.redirect("/admin/alluser");
  },

  addProducts(req, res) {
    productHelpers.getCategoryDropdown().then((categoryDropdown) => {
      res.render("admin/add-products", {
        layout: "admin-layout",
        admin: true,
        categoryDropdown,
      });
    });
  },

  addProductsSubmit(req, res) {
    productHelpers.addProduct(req.body).then((response) => {
      image.mv("./public/product-images/" + response + ".jpg", (err) => {
        if (!err) {
          res.redirect("/admin/allProducts");
        } else {
          console.log(err);
        }
      });
    });
    let image = req.files.Image;
  },

  deleteProductAction(req, res) {
    let proId = req.params.id;

    productHelpers.deleteProduct(proId).then((response) => {
      res.redirect("/admin/allProducts");
    });
  },

  editProductAction: async (req, res) => {
    let product = await productHelpers.getProductDetails(req.params.id);
    productHelpers.getCategoryDropdown().then((categoryDropdown) => {
      res.render("admin/edit-product", {
        product,
        categoryDropdown,
        layout: "admin-layout",
        admin: true,
      });
    });
  },

  editProductSubmit(req, res) {
    let id = req.params.id;
    productHelpers.updateProduct(req.params.id, req.body).then(() => {
      res.redirect("/admin/allProducts");
      if (req.files?.Image) {
        let image = req.files.Image;
        image.mv("./public/product-images/" + id + ".jpg");
      }
    });
  },

  dashboardAdmin(req, res) {
    res.render("admin/admin-homepage", { layout: "admin-layout", admin: true });
  },

  editCancelAdmin(req, res) {
    res.redirect("/admin/allProducts");
  },

  addCategory(req, res) {
    res.render("admin/add-category", { layout: "admin-layout", admin: true });
  },

  addCategorySubmit(req, res) {
    productHelpers
      .addProductCategory(req.body)
      .then((response) => {
        res.redirect("/admin/allcategory");
      })
      .catch((error) => {
        res.render("admin/add-category", {
          layout: "admin-layout",
          admin: true,
          error: error,
        });
      });
  },

  allCategory(req, res) {
    productHelpers.getAllCategorys().then((categorys) => {
      res.render("admin/all-category", {
        categorys,
        layout: "admin-layout",
        admin: true,
      });
    });
  },

  editCategory: async (req, res) => {
    let categoryDetails = await productHelpers.getCategoryDetails(
      req.params.id
    );
    console.log(
      categoryDetails +
        "++++++++++++++++++++++++))))))))))))))))))))))))))))))))))))))))"
    );
    res.render("admin/edit-category", {
      admin: true,
      layout: "admin-layout",
      categoryDetails,
    });
  },

  editCategorySubmit(req, res) {
    console.log(req.params.id);
    console.log(req.body.catId, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    productHelpers.updateCategory(req.body.catId, req.body).then(() => {
      res.redirect("/admin/allcategory");
    });
  },

  deleteCategory: (req, res) => {
    productHelpers.deleteCategory(req.params.id, req.body).then((response) => {
      res.redirect("/admin/allcategory");
    });
  },

  signoutAdmin(req, res) {
    req.session.loggedIn = false;
    req.session.admin = null;
    res.render("admin/admin-login", { layout: "admin-layout" });
  },

  orderManagement: async (req, res) => {
    // let admin = req.session.admin
    let orders = await adminHelpers.getOrders();

    res.render("admin/order-management", {
      admin: true,
      layout: "admin-layout",
      orders,
    });
  },

  viewProductsOrder: async (req, res) => {
    let products = await adminHelpers.getProductsOrdermanagement(req.params.id);
    let totalAmount = await userHelpers.getOrderDetails(req?.params?.id);
    products[0].totalAmount = totalAmount;
    res.render("admin/view-products-order", {
      admin: true,
      layout: "admin-layout",
      products,
    });
  },

  cancelOrderManagement: async (req, res) => {
    adminHelpers
      .cancelCurrentOrders(req.params.id, req.body.status)
      .then(() => {
        res.redirect("/admin/order-management");
      });
  },

  //   allCoupons : (req, res) => {
  //    res.render('admin/all-coupons', {admin:true,
  //     layout: "admin-layout"})
  //   },

  addCoupon: (req, res) => {
    res.render("admin/add-coupons", { admin: true, layout: "admin-layout" });
  },

  addCouponSubmit: (req, res) => {
    adminHelpers.addCoupons(req.body).then((response) => {
      res.redirect("/admin/allCoupons");
    });
  },

  viewDiscountCoupons: (req, res) => {
    adminHelpers.findCoupons().then((coupons) => {
      res.render("admin/all-coupons", {
        admin: true,
        layout: "admin-layout",
        coupons,
      });
    });
  },

  removeCoupon: (req, res) => {
    let couponId = req.params.id;
    adminHelpers.deleteCoupon(couponId).then(() => {
      res.redirect("/admin/allCoupons");
    });
  },

  editAdminCoupon: (req, res) => {
    adminHelpers.findCoupon(req.params.id).then((coupon) => {
      res.render("admin/edit-coupons", {
        admin: true,
        layout: "admin-layout",
        coupon,
      });
    });
  },

  editCouponSubmit: (req, res) => {
    let id = req.params.id;
    let body = req.body;
    adminHelpers.updateCoupon(id, body).then(() => {
      res.redirect("/admin/allCoupons");
    });
  },
};
