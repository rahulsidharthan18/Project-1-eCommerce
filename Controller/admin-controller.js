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

      let data = await adminHelpers
        .getDashboardChart()
        .then((data) => {
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
    productHelpers
      .getAllProducts()
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
    userHelpers
      .getAllUsers()
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
    productHelpers
      .getCategoryDropdown()
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

    productHelpers
      .addProduct(data)
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

    productHelpers
      .deleteProduct(proId)
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
    productHelpers
      .updateProduct(req.params.id, req.body)
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
    try {
      res.redirect("/admin/allProducts");
    } catch (error) {
      // Handle the exception/error
      console.error("An error occurred:", error);
      // Optionally, send an error response to the client
      res.status(500).send("Internal Server Error");
    }
  },

  addCategory(req, res) {
    try {
      res.render("admin/add-category", { layout: "admin-layout", admin: true });
    } catch (error) {
      // Handle the exception/error
      console.error("An error occurred:", error);
      // Optionally, send an error response to the client
      res.status(500).send("Internal Server Error");
    }
  },

  addCategorySubmit(req, res) {
    productHelpers
      .addProductCategory(req.body)
      .then((response) => {
        res.redirect("/admin/allcategory");
      })
      .catch((error) => {
        res.send("error");
      });
  },

  allCategory(req, res) {
    console.log("{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}");
    productHelpers
      .getAllCategorys()
      .then((categorys) => {
        console.log(categorys, "[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]");
        res.render("admin/all-category", {
          categorys,
          layout: "admin-layout",
          admin: true,
        });
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        res.status(500).send("Internal Server Error");
      });
  },

  editCategory: async (req, res) => {
    try {
      let categoryDetails = await productHelpers.getCategoryDetails(
        req.params.id
      );
      console.log(categoryDetails);
      res.render("admin/edit-category", {
        admin: true,
        layout: "admin-layout",
        categoryDetails,
      });
    } catch (error) {
      console.error("An error occurred:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  editCategorySubmit(req, res) {
    console.log(req.params.id);
    console.log(req.body.catId, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    productHelpers
      .updateCategory(req.body.catId, req.body)
      .then(() => {
        res.redirect("/admin/allcategory");
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        res.status(500).send("Internal Server Error");
      });
  },

  deleteCategory: (req, res) => {
    productHelpers
      .deleteCategory(req.params.id, req.body)
      .then((response) => {
        res.redirect("/admin/allcategory");
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        res.status(500).send("Internal Server Error");
      });
  },

  signoutAdmin(req, res) {
    try {
      req.session.loggedIn = false;
      req.session.admin = null;
      res.render("admin/admin-login", { layout: "admin-layout" });
    } catch (error) {
      // Handle the exception
      console.error("An error occurred during admin sign out:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  orderManagement: async (req, res) => {
    try {
      let orders = await adminHelpers.getOrders();
      res.render("admin/order-management", {
        admin: true,
        layout: "admin-layout",
        orders,
      });
    } catch (error) {
      // Handle the exception
      console.error("An error occurred in order management:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  viewProductsOrder: async (req, res) => {
    try {
      let products = await adminHelpers.getProductsOrdermanagement(
        req.params.id
      );
      let totalAmount = await userHelpers.getOrderDetails(req?.params?.id);
      products[0].totalAmount = totalAmount;
      res.render("admin/view-products-order", {
        admin: true,
        layout: "admin-layout",
        products,
      });
    } catch (error) {
      // Handle the exception
      console.error("An error occurred in view products order:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  cancelOrderManagement: async (req, res) => {
    try {
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
    } catch (error) {
      // Handle the exception
      console.error("An error occurred in cancel order management:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  //   allCoupons : (req, res) => {
  //    res.render('admin/all-coupons', {admin:true,
  //     layout: "admin-layout"})
  //   },

  addCoupon: (req, res) => {
    res.render("admin/add-coupons", { admin: true, layout: "admin-layout" });
  },

  addCouponSubmit: (req, res) => {
    try {
      console.log(req.body, "lllllllllllllllllllllliiiiiiiiiiiiiiiiiii");
      adminHelpers
        .addCoupons(req.body)
        .then((response) => {
          res.redirect("/admin/allCoupons");
        })
        .catch((error) => {
          // Handle the error appropriately (e.g., logging or sending an error response)
          console.error("Error adding coupons:", error);
          res.status(500).send("Internal Server Error");
        });
    } catch (error) {
      // Handle the error appropriately (e.g., logging or sending an error response)
      console.error("Error processing coupon submission:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  viewDiscountCoupons: (req, res) => {
    adminHelpers
      .findCoupons()
      .then((coupons) => {
        res.render("admin/all-coupons", {
          admin: true,
          layout: "admin-layout",
          coupons,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("An error occurred while retrieving coupons.");
      });
  },

  removeCoupon: (req, res) => {
    let couponId = req.params.id;
    adminHelpers
      .deleteCoupon(couponId)
      .then(() => {
        res.redirect("/admin/allCoupons");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("An error occurred while deleting the coupon.");
      });
  },

  editAdminCoupon: (req, res) => {
    adminHelpers
      .findCoupon(req.params.id)
      .then((coupon) => {
        res.render("admin/edit-coupons", {
          admin: true,
          layout: "admin-layout",
          coupon,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("An error occurred while retrieving the coupon.");
      });
  },

  editCouponSubmit: (req, res) => {
    let id = req.params.id;
    let body = req.body;
    adminHelpers
      .updateCoupon(id, body)
      .then(() => {
        res.redirect("/admin/allCoupons");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("An error occurred while retrieving the coupon.");
      });
  },

  orderStatus: (req, res) => {
    console.log(req.query, "ddddddddddddddddddddddddd");
    let data = req.query;

    adminHelpers
      .updateOrderStatus(data)
      .then((response) => {
        res.json(response);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("An error occurred while retrieving the coupon.");
      });
  },

  salesReport: async (req, res) => {
    adminHelpers
      .getSaleOrders()
      .then((orders) => {
        res.render("admin/sales-report", {
          admin: true,
          layout: "admin-layout",
          orders,
        });
      })
      .catch((error) => {
        console.error(error);
        res
          .status(500)
          .send("An error occurred while retrieving the sale orders.");
      });
  },

  addCategoryOffer: async (req, res) => {
    try {
      let addPercent = await adminHelpers.addCategoryPercentage(req.body);
      let addOfferAmount = await productHelpers.addCategoryOfferAmount(
        req.body
      );
      res.redirect("/admin/allcategory");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send("An error occurred while adding the category offer.");
    }
  },

  addProductsOffer: async (req, res) => {
    try {
      console.log(req.body, "ppppppppppp");
      let insertPercent = await adminHelpers.addProductPercentage(req.body);
      let addOfferAmount = await productHelpers.addProductOfferAmount(req.body);
      res.redirect("/admin/allProducts");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while adding the products offer.");
    }
  },
  

  productOffer: (req, res) => {
    productHelpers.getProductOffers()
      .then((offers) => {
        res.render("admin/product-offer", {
          admin: true,
          layout: "admin-layout",
          offers,
        });
      })
      .catch((error) => {
        // Handle the error here
        console.error("Error retrieving product offers:", error);
        res.status(500).send("Internal Server Error");
      });
  },
  

  categoryOffer: (req, res) => {
    productHelpers.getCategoryOffers()
      .then((offers) => {
        res.render("admin/category-offer", {
          admin: true,
          layout: "admin-layout",
          offers,
        });
      })
      .catch((error) => {
        // Handle the error here
        console.error("Error retrieving category offers:", error);
        res.status(500).send("Internal Server Error");
      });
  },
  

  salesDateFilter: (req, res) => {
    console.log(req.body);
    adminHelpers.salesReportFilter(req.body)
      .then((orders) => {
        res.render("admin/sales-report", {
          admin: true,
          layout: "admin-layout",
          orders,
        });
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
        res.status(500).send("An error occurred.");
      });
  },
  

  returnAdminOrder: (req, res) => {
    adminHelpers.returnAdminOrder(req.params.id, req.body.status)
      .then(() => {
        adminHelpers.AdminOrderProductsList(req.params.id)
          .then((products) => {
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
  
            userHelpers.stockIncrementAfterReturn(ids)
              .then(() => {
                userHelpers.getWalletAmount(req.params.id)
                  .then((wallet) => {
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
                  })
                  .catch((error) => {
                    // Handle the error
                    console.error(error);
                    res.status(500).send("An error occurred.");
                  });
              })
              .catch((error) => {
                // Handle the error
                console.error(error);
                res.status(500).send("An error occurred.");
              });
          })
          .catch((error) => {
            // Handle the error
            console.error(error);
            res.status(500).send("An error occurred.");
          });
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
        res.status(500).send("An error occurred.");
      });
  },  

  deleteProductOffer: async (req, res) => {
    try {
      await productHelpers.deleteProOffer(req.params.id);
      await productHelpers.deleteOfferFromProduct(req.params.id);
      console.log("99999999999999999999999999999999999");
      res.redirect("/admin/productOffer");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  },
  
  deleteCategoryOffer: async (req, res) => {
    try {
      await adminHelpers.deleteCatOffer(req.params.id);
      await adminHelpers.deleteOfferFromCategory(req.params.id);
      res.redirect("/admin/categoryOffer");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  },
  
};
