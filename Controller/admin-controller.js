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

  loginAdmin: async (req, res) => {
    try {
      let todaySales = await adminHelpers.todayTotalSales();
      let monthlySales = await adminHelpers.monthlyTotalSales();
      let yearlySales = await adminHelpers.yearlyTotalSales();
  
      let todayRevenue = await adminHelpers.todayTotalRevenue();
      let monthlyRevenue = await adminHelpers.monthlyTotalRevenue();
      let yearlyRevenue = await adminHelpers.yearlyTotalRevenue();
  
      let data = await adminHelpers.getDashboardChart().then((data) => {
        // Handle the resolved promise
        console.log(data);
      })
      .catch((error) => {
        // Handle the rejected promise
        console.log(error);
      });
  
      doadminLoged(req.body)
        .then((response) => {
          req.session.adminloggedIn = true;
          req.session.admin = response;
          res.render("admin/admin-homepage", {
            layout: "admin-layout",
            admin: true,
            todaySales,
            monthlySales,
            yearlySales,
            todayRevenue,
            monthlyRevenue,
            yearlyRevenue,
            data,
          });
        })
        .catch((error) => {
          res.render("admin/admin-login", {
            error: "Invalid login details",
            layout: "admin-layout",
          });
        });
    } catch (error) {
      res.render("admin/admin-login", {
        error: "An error occurred",
        layout: "admin-layout",
      });
    }
  },
  

  adminAlluser(req, res) {
    try {
      getAllUser()
        .then((AllUsers) => {
          res.render("admin/all-users", {
            layout: "admin-layout",
            AllUsers,
            admin: true,
          });
        })
        .catch((error) => {
          console.log("Error fetching all users:", error);
          res.render("admin/error", {
            layout: "admin-layout",
            message: "Error fetching all users.",
            admin: true,
          });
        });
    } catch (error) {
      console.log("Error fetching all users:", error);
      res.render("admin/error", {
        layout: "admin-layout",
        message: "Error fetching all users.",
        admin: true,
      });
    }
  },
  

  productsAdmin(req, res) {
    productHelpers.getAllProducts()
      .then((products) => {
        res.render("admin/all-products", {
          layout: "admin-layout",
          admin: true,
          products,
        });
      })
      .catch((error) => {
        console.log("Error fetching all products:", error);
        res.render("admin/error", {
          layout: "admin-layout",
          message: "Error fetching all products.",
          admin: true,
        });
      });
  },
  

  getAllUsers: (req, res) => {
    userHelpers.getAllUsers()
      .then((AllUsers) => {
        res.render("admin/all-users", {
          layout: "admin-layout",
          AllUsers,
          admin: true,
        });
      })
      .catch((error) => {
        console.log("Error fetching all users:", error);
        res.render("admin/error", {
          layout: "admin-layout",
          message: "Error fetching all users.",
          admin: true,
        });
      });
  },
  

  adminBlockUser: (req, res) => {
    let blockUserId = req.query.id;
    blockUser(blockUserId)
      .then(() => {
        res.redirect("/admin/alluser");
      })
      .catch((error) => {
        console.log("Error blocking user:", error);
        res.render("admin/error", {
          layout: "admin-layout",
          message: "Error blocking user.",
          admin: true,
        });
      });
  },
  //UNBLOCK USER
  adminUnBlockUser: (req, res) => {
    let unblockUserId = req.query.id;
    unblockUser(unblockUserId)
      .then(() => {
        res.redirect("/admin/alluser");
      })
      .catch((error) => {
        console.log("Error unblocking user:", error);
        res.render("admin/error", {
          layout: "admin-layout",
          message: "Error unblocking user.",
          admin: true,
        });
      });
  },

  addProducts: (req, res) => {
    productHelpers.getCategoryDropdown()
      .then((categoryDropdown) => {
        res.render("admin/add-products", {
          layout: "admin-layout",
          admin: true,
          categoryDropdown,
        });
      })
      .catch((error) => {
        console.log("Error fetching category dropdown:", error);
        res.render("admin/error", {
          layout: "admin-layout",
          message: "Error fetching category dropdown.",
          admin: true,
        });
      });
  },

  addProductsSubmit: (req, res) => {
    console.log(
      "lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll"
    );
    const files = req.files;
    console.log(files, "loolooloo");
    const fileName = files.map((file) => {
      return file.filename;
    });
    let data = req.body;
    data.productImage = fileName;
  
    productHelpers.addProduct(data)
      .then((response) => {
        res.redirect("/admin/allProducts");
      })
      .catch((error) => {
        console.log("Error adding product:", error);
        res.send("kkk");
      });
  },

  deleteProductAction: (req, res) => {
    let proId = req.params.id;
  
    productHelpers.deleteProduct(proId)
      .then((response) => {
        res.redirect("/admin/allProducts");
      })
      .catch((error) => {
        console.log("Error deleting product:", error);
        res.render("admin/error", {
          layout: "admin-layout",
          message: "Error deleting product.",
          admin: true,
        });
      });
  },

  editProductAction: async (req, res) => {
    try {
      let product = await productHelpers.getProductDetails(req.params.id);
      productHelpers.getCategoryDropdown().then((categoryDropdown) => {
        res.render("admin/edit-product", {
          product,
          categoryDropdown,
          layout: "admin-layout",
          admin: true,
        });
      });
    } catch (error) {
      console.log("Error editing product:", error);
      res.render("admin/error", {
        layout: "admin-layout",
        message: "Error editing product.",
        admin: true,
      });
    }
  },

  editProductSubmit(req, res) {
    console.log(req.body, req.params.id, "bodyllllllllllllllllllllllllllllll");
    let id = req.params.id;
    productHelpers.updateProduct(req.params.id, req.body)
      .then(() => {
        if (req.files?.Image) {
          let image = req.files.Image;
          image.mv("./public/product-images/" + id + ".jpg", (error) => {
            if (error) {
              console.log("Error uploading product image:", error);
            }
            res.redirect("/admin/allProducts");
          });
        } else {
          res.redirect("/admin/allProducts");
        }
      })
      .catch((error) => {
        console.log("Error updating product:", error);
        res.render("admin/error", {
          layout: "admin-layout",
          message: "Error updating product.",
          admin: true,
        });
      });
  },

  dashboardAdmin: async (req, res) => {
    try {
      let todaySales = await adminHelpers.todayTotalSales();
      let monthlySales = await adminHelpers.monthlyTotalSales();
      let yearlySales = await adminHelpers.yearlyTotalSales();
  
      let todayRevenue = await adminHelpers.todayTotalRevenue();
      let monthlyRevenue = await adminHelpers.monthlyTotalRevenue();
      let yearlyRevenue = await adminHelpers.yearlyTotalRevenue();
  
      adminHelpers.getDashboardChart().then((data) => {
        console.log(data, "datachart ddddddddddddddddddd");
        res.render("admin/admin-homepage", {
          layout: "admin-layout",
          admin: true,
          todaySales,
          monthlySales,
          yearlySales,
          todayRevenue,
          monthlyRevenue,
          yearlyRevenue,
          data,
        });
      });
    } catch (error) {
      console.log("Error in dashboardAdmin:", error);
      res.send("admin/error");
    }
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
        userHelpers.orderProductsList(req.params.id).then((products) => {
          function destruct(products) {
            let data = [];
            for (let i = 0; i < products.length; i++) {
              let obj = {};
              obj.prod = products[i].item;
              obj.quantity = products[i].quantity;
              data.push(obj);
            }
            return data;
          }
          let ids = destruct(products);

          let stockIncAfterCancel = userHelpers
            .stockIncrementAfterCancel(ids)
            .then(() => {});

          userHelpers.getWalletAmount(req.params.id).then((wallet) => {
            if (wallet && wallet.paymentmethod == "razorpay") {
              userHelpers.cancelAfterCreateWallet(
                wallet.totalPrice,
                wallet.userId,
                wallet.paymentmethod
              );
              res.redirect("/admin/order-management");
            } else {
              res.redirect("/admin/order-management");
            }
          });
        });
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
    console.log(req.body, "lllllllllllllllllllllliiiiiiiiiiiiiiiiiii");
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

  orderStatus: (req, res) => {
    console.log(req.query, "ddddddddddddddddddddddddd");
    let data = req.query;

    adminHelpers.updateOrderStatus(data).then((response) => {
      res.json(response);
    });
  },

  salesReport: async (req, res) => {
    // let todaySales = await adminHelpers.todayTotalSales();
    // let monthlySales = await adminHelpers.monthlyTotalSales();
    // let yearlySales = await adminHelpers.yearlyTotalSales();
    // console.log(todaySales, "today Sales");
    // console.log(monthlySales, "monthly Sales");
    // console.log(yearlySales, "yearly Sales");
    adminHelpers.getSaleOrders().then((orders) => {
      res.render("admin/sales-report", {
        admin: true,
        layout: "admin-layout",
        orders,
        // todaySales,
        // monthlySales,
        // yearlySales,
      });
    });
  },

  addCategoryOffer: async (req, res) => {
    let addPercent = await adminHelpers.addCategoryPercentage(req.body);
    let addOfferAmount = await productHelpers
      .addCategoryOfferAmount(req.body)
      .then(() => {
        res.redirect("/admin/allcategory");
      });
  },

  addProductsOffer: async (req, res) => {
    console.log(req.body, "ppppppppppp");

    let insertPercent = await adminHelpers.addProductPercentage(req.body);
    let addOfferAmount = await productHelpers
      .addProductOfferAmount(req.body)
      .then(() => {
        res.redirect("/admin/allProducts");
      });
  },

  productOffer: (req, res) => {
    productHelpers.getProductOffers().then((offers) => {
      res.render("admin/product-offer", {
        admin: true,
        layout: "admin-layout",
        offers,
      });
    });
  },

  categoryOffer: (req, res) => {
    productHelpers.getCategoryOffers().then((offers) => {
      res.render("admin/category-offer", {
        admin: true,
        layout: "admin-layout",
        offers,
      });
    });
  },

  salesDateFilter: (req, res) => {
    console.log(req.body);
    adminHelpers.salesReportFilter(req.body).then((orders) => {
      res.render("admin/sales-report", {
        admin: true,
        layout: "admin-layout",
        orders,
      });
    });
  },

  returnAdminOrder: (req, res) => {
    console.log(
      req.params,
      req.body,
      " [[[[[[[[[[[[[[[[[pooooo]]]]]]]]]]]]]]]]]"
    );

    adminHelpers.returnAdminOrder(req.params.id, req.body.status).then(() => {
      adminHelpers.AdminOrderProductsList(req.params.id).then((products) => {
        function destruct(products) {
          let data = [];
          for (let i = 0; i < products.length; i++) {
            let obj = {};
            obj.prod = products[i].item;
            obj.quantity = products[i].quantity;
            data.push(obj);
          }
          return data;
        }
        let ids = destruct(products);
        console.log(ids, "ids[[[[[[[[[]]]]]]]]]");

        userHelpers.stockIncrementAfterReturn(ids).then(() => {});
        userHelpers.getWalletAmount(req.params.id).then((wallet) => {
          if (wallet && wallet.paymentmethod) {
            userHelpers.cancelAfterCreateWallet(
              wallet.totalPrice,
              wallet.userId,
              wallet.paymentmethod
            );
            res.redirect("/admin/order-management");
          } else {
            res.redirect("/admin/order-management");
          }
        });
      });
    });
  },

  deleteProductOffer : (async (req, res) => {
    await productHelpers.deleteProOffer(req.params.id)
    await productHelpers.deleteOfferFromProduct(req.params.id).then((response)=>{
      console.log("99999999999999999999999999999999999");
      res.redirect('/admin/productOffer')
    })
  }),

  deleteCategoryOffer : (async (req, res) => {
    await adminHelpers.deleteCatOffer(req.params.id)
    await adminHelpers.deleteOfferFromCategory(req.params.id).then((response)=>{
      res.redirect('/admin/categoryOffer')
    })
  })
};
