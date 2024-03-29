const {
  doSignup,
  doLogin,
  findByNumber,
  couponManagement,
  deleteAddress,
  doEmailPhoneCheck,
  getCartCount,
  updateNewPassword,
  getCategotyList,
  getCartProducts,
  getTotalAmount,
  addToTheCart,
  changeCartProductQuantity,
  removeCartProducts,
  getUserWallet,
  getAllAddress,
  displayCoupons,
  getCartProductList,
  placeUserOrder,
  generateRazorpay,
  generateWalletOrder,
  getUserOrders,
  getOrderImgProducts,
  getOrderPayment,
  getAddresOrder,
  getOrderDetails,
  getOrderProducts,
  stockIncrementAfterCancel,
  orderProductsList,
  cancelOrder,
  cancelAfterCreateWallet,
  getWalletAmount,
  totalProductView,
  verifyPaymentHelper,
  getAllAddresses,
  addAddressUser,
  categoryFilterFind,
  returnOrder,
  stockIncrementAfterReturn,
  getOneAddressById,
  getUserEditAddress,
  updateEditedAddress,
} = require("../Model/user-helpers");
const {
  getAllProducts,
  getAllProductDescription,
} = require("../Model/product-helpers");
var productHelpers = require("../Model/product-helpers");
const userHelpers = require("../Model/user-helpers");
const { response } = require("express");
const adminHelpers = require("../Model/admin-helpers");
let otpuser;
let signupUsersData;
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;
const client = require("twilio")(accountSid, authToken, serviceId);

module.exports = {
  /******************************* user login and signup ***********************************/

  loginPage(req, res) {
    try {
      if (req.session.users) {
        res.redirect("/");
      } else {
        res.render("user/login");
      }
    } catch (error) {
      console.error(e);
      res.status(500).send("An error occurred");
    }
  },

  loginAction(req, res) {
    try {
      doLogin(req.body)
        .then((user) => {
          req.session.loggedIn = true;
          req.session.users = user;
          res.redirect("/");
        })
        .catch((error) => {
          res.render("user/login", { error: error.error });
        });
    } catch (error) {
      console.error("Login error:", error);
      res.render("error", { message: "An error occurred during login." });
    }
  },

  userSignup: async (req, res) => {
    try {
      await doEmailPhoneCheck(req.body);

      signupUsersData = req.body;
      client.verify.v2
        .services(serviceId)
        .verifications.create({
          to: "+91" + `${signupUsersData.phone}`,
          channel: "sms",
        })
        .then(() => {
          res.render("user/signup-otp", { number: signupUsersData.phone });
        });
    } catch (error) {
      console.error("Signup error:", error);
      res.render("user/login", { errors: error.message });
    }
  },

  signupOtpVerify: async (req, res) => {
    number = signupUsersData.phone;
    await client.verify.v2
      .services(serviceId)
      .verificationChecks.create({
        to: `+91${number}`,
        code: req.body.otp,
      })
      .then(async (data) => {
        if (data.status === "approved") {
          await doSignup(signupUsersData).then((userdata) => {
            // req.session.loggedIn = true
            // req.session.users = userdata;
            res.redirect("/login-page");
          });
        } else {
          res.send("ddddddddddd");
        }
      });
  },

  logoutUser(req, res) {
    req.session.loggedIn = false;
    req.session.users = null;
    res.render("user/login");
  },

  /******************************* home page ***********************************/

  homePage: async (req, res) => {
    try {
      let users = req.session.users;
      let cartCount = null;

      if (req.session.users) {
        cartCount = await getCartCount(req.session.users._id);
        res.render("user/homepage", { user: true, users, cartCount });
      } else {
        res.render("user/homepage", { user: true });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  },

  /******************************* user forgot password ***********************************/

  forgotPassword: (req, res) => {
    res.render("user/forgot-password-number");
  },

  forgotOtpCode: async (req, res) => {
    try {
      const number = req.body.number;
      const user = await findByNumber(number);
      otpuser = user;
      const result = await client.verify.v2
        .services(serviceId)
        .verifications.create({
          to: "+91" + number,
          channel: "sms",
        });
      res.render("user/forgot-otp-code", { number: number });
    } catch (error) {
      console.error(error);
      res.render("user/forgot-otp-code", { error: error.message });
    }
  },

  forgotOtpVerify: async (req, res) => {
    number = otpuser.phone;
    const verify = await client.verify.v2
      .services(serviceId)
      .verificationChecks.create({
        to: `+91${number}`,
        code: req.body.otp,
      })
      .then(async (data) => {
        if (data.status === "approved") {
          req.session.loggedIn = true;
          req.session.users = otpuser;
          res.render("user/new-password");
        } else {
          res.render("user/forgot-otp-code", {
            user: true,
            error: "invalid OTP",
          });
        }
      });
  },

  changePassword: (req, res) => {
    body = req.body.password;
    updateNewPassword(otpuser._id, body).then(() => {
      res.redirect("/login-page");
    });
  },

  /******************************* user products***********************************/

  viewProducts: async (req, res) => {
    try {
      let users = req.session.users;
      // let cartCount = await userHelpers.getCartCount(req.session.users._id);
      let category = await getCategotyList();

      let product = await getAllProducts();
      let totalProducts = product.length;
      let limit = 12;
      let products = product.slice(0, limit);
      let pages = [];

      for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
        pages.push(i);
      }

      res.render("user/view-products", {
        user: true,
        products,
        users,
        // cartCount,
        pages,
        category,
      });
    } catch (error) {
      console.error("Error occurred while viewing products:", error);
      res.render("error", {
        message: "An error occurred while viewing products.",
      });
    }
  },

  productDescription(req, res) {
    let users = req.session.users;
    getAllProductDescription(req.params.id)
      .then((products) => {
        res.render("user/product-description", { user: true, products, users });
      })
      .catch((error) => {
        console.error(
          "Error occurred while fetching product description:",
          error
        );
        res.render("error", {
          message: "An error occurred while fetching product description.",
        });
      });
  },

  /******************************* user otp***********************************/

  otpLogin(req, res) {
    res.render("user/otpnumber");
  },

  otpCode: async (req, res) => {
    try {
      let otpTimer; // Define a variable to store the timer
      const number = req.body.number;
      const user = await findByNumber(number);
      otpuser = user;
      const result = await client.verify.v2
        .services(serviceId)
        .verifications.create({
          to: "+91" + number,
          channel: "sms",
        });

      // Start the timer for OTP expiration (e.g., 5 minutes)
      otpTimer = setTimeout(() => {
        // Handle timer expiry
        // For example, display a message or perform any necessary actions
      }, 1 * 60 * 1000); // 5 minutes in milliseconds

      res.render("user/otpcode", { number: number });
    } catch (error) {
      console.error(error);
      res.render("user/otpnumber", { error: error.message });
    }
  },

  otpVerify: async (req, res) => {
    number = otpuser.phone;
    const verify = await client.verify.v2
      .services(serviceId)
      .verificationChecks.create({
        to: `+91${number}`,
        code: req.body.otp,
      })
      .then(async (data) => {
        if (data.status === "approved") {
          req.session.loggedIn = true;
          req.session.users = otpuser;
          res.redirect("/");
        } else {
          res.render("user/otpcode", { user: true, error: "invalid OTP" });
        }
      });
  },

  /******************************* user cart***********************************/

  cart: async (req, res) => {
    try {
      let users = req.session.users;

      if (req.session.users) {
        let products = await getCartProducts(req.session.users._id);
        let totalValue = await getTotalAmount(req.session.users._id);
        let cartCount = await getCartCount(req.session.users._id);

        if (products.length !== 0) {
          res.render("user/cart", {
            user: true,
            users,
            products,
            cartCount,
            totalValue,
          });
        } else {
          res.render("user/empty-cart", { user: true, users });
        }
      }
    } catch (error) {
      console.error("Error occurred while fetching cart details:", error);
      res.render("error", {
        message: "An error occurred while fetching cart details.",
      });
    }
  },

  addToCart(req, res) {
    try {
      addToTheCart(req.params.id, req.session.users._id)
        .then(() => {
          res.json({ status: true });
        })
        .catch(() => {
          res.json({ status: false });
        });
    } catch (error) {
      console.error("Error occurred while adding to cart:", error);
      res.json({
        status: false,
        error: "An error occurred while adding to cart.",
      });
    }
  },

  changeProductQuantity: (req, res, next) => {
    try {
      changeCartProductQuantity(req.body)
        .then(async (response) => {
          if (response) {
            const total = await getTotalAmount(req.body.user);
            response.total = total;
            res.json(response);
          } else {
            res.json({ error: "Unable to change product quantity" });
          }
        })
        .catch((error) => {
          console.error(error);
          res.json({ error: "Unable to change product quantity" });
        });
    } catch (error) {
      console.error("Error occurred while changing product quantity:", error);
      res.json({ error: "Unable to change product quantity" });
    }
  },

  homeRedirect: (req, res) => {
    res.redirect("/");
  },

  removeProductQuantity(req, res) {
    removeCartProducts(req.body)
      .then((response) => {
        res.json(response);
      })
      .catch((error) => {
        console.error(error);
        res.json({ error: "Unable to remove product quantity" });
      });
  },

  /******************************* user checkout***********************************/

  checkout: async (req, res) => {
    try {
      let users = req.session.users;
      let total = await getTotalAmount(req.session.users._id);
      let address = await getAllAddress(req.session.users._id);
      let wallet = await getUserWallet(users._id);

      let coupon = await displayCoupons();
      if (wallet && wallet.total && wallet.total > 0 && wallet.total >= total) {
        wallet.exist = "success";
      } else {
        // wallet.total= 0;
      }

      res.render("user/checkout-page", {
        user: true,
        users,
        total,
        address,
        wallet,
        coupon,
      });
    } catch (error) {
      console.error("Error in checkout:", error);
      res.render("error-page", {
        message: "An error occurred during checkout.",
      });
    }
  },

  placeOrder: async (req, res) => {
    try {
      let products = await getCartProductList(req.body.userId);
      let totalPrice;
      if (req.body.offerdata) {
        totalPrice = req.body.offerdata;
      } else {
        totalPrice = await getTotalAmount(req.body.userId);
      }
      placeUserOrder(req.body, products, totalPrice)
        .then((orderId) => {
          if (req.body["paymentmethod"] === "COD") {
            res.json({ codSuccess: true });
          } else if (req.body["paymentmethod"] === "razorpay") {
            generateRazorpay(orderId, totalPrice)
              .then((response) => {
                res.json(response);
              })
              .catch((error) => {
                console.error("Error in generateRazorpay:", error);
                throw error;
              });
          } else {
            generateWalletOrder(req.body.userId, totalPrice)
              .then(() => {
                res.json({ wallet: true });
              })
              .catch((error) => {
                console.error("Error in generateWalletOrder:", error);
                throw error;
              });
          }
        })
        .catch((error) => {
          console.error("Error in placeUserrsraOrder:", error);
          throw error;
        });
    } catch (error) {
      console.error("Error in placeOrder:", error);
      res.json({ error: "An error occurred while placing the order." });
    }
  },

  orderSuccessful(req, res) {
    let users = req.session.users;
    res.render("user/order-successful", { user: true, users });
  },

  viewOrders: async (req, res) => {
    try {
      const currentDate = new Date();
      let users = req.session.users;
      let orders = await getUserOrders(req.session.users._id);
      orders.forEach((order) => {
        if (order.status === "delivered") {
          const statusDate = new Date(order.statusDate);
          const diffInDays = Math.floor(
            (currentDate - statusDate) / (1000 * 60 * 60 * 24)
          );
          order.canReturn = diffInDays < 7; // Add a `canReturn` property indicating if the order can be returned
        } else {
          order.canReturn = false; // For other status, set `canReturn` to false
        }
      });
      const products = await getOrderImgProducts(req.session.users._id);
      const productImage = products.map((product) => {
        const image = product.product.productImage[0];
        return {
          ...product,
          prodImg: image,
        };
      });
      if (orders.length === productImage.length) {
        for (let i = 0; i < productImage.length; i++) {
          orders[i].prodImage = productImage[i].prodImg;
        }
      } else {
        console.log("Mismatched array lengths");
      }
      res.render("user/view-orders", {
        user: true,
        users,
        orders,
        currentDate,
        products: productImage,
      });
    } catch (error) {
      console.error("Error in viewOrders:", error);
      res.render("error-page", {
        message: "An error occurred while fetching user orders.",
      });
    }
  },

  /******************************* user order products***********************************/

  viewOrderProducts: async (req, res) => {
    try {
      let users = req.session.users;
      let products = await getOrderProducts(req.params.id);
      let totalAmount = await getOrderDetails(req?.params?.id);
      let address = await getAddresOrder(req.params.id);
      let paymentmethod = await getOrderPayment(req.params.id);
      products[0].totalAmount = totalAmount;
      products[0].paymentmethod = paymentmethod.paymentmethod;
      res.render("user/view-order-products", {
        user: true,
        users,
        products,
        address,
      });
    } catch (error) {
      console.error("Error in viewOrderProducts:", error);
      res.render("error-page", {
        message: "An error occurred while fetching order products.",
      });
    }
  },

  /******************************* user order cancel***********************************/

  cancelUserOrder: async (req, res) => {
    try {
      let reason = req.body.creason;
      let orderId = req.body.orderId;
      let orderStatus = req.body.orderStatus;

      await cancelOrder(orderId, orderStatus, reason);

      let products = await orderProductsList(orderId);

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

      await stockIncrementAfterCancel(ids);

      let wallet = await getWalletAmount(req.body.orderId);
      if (wallet && wallet.paymentmethod === "razorpay") {
        await cancelAfterCreateWallet(
          wallet.totalPrice,
          wallet.userId,
          wallet.paymentmethod
        );
      }
      if (wallet && wallet.paymentmethod === "wallet") {
        await cancelAfterCreateWallet(
          wallet.totalPrice,
          wallet.userId,
          wallet.paymentmethod
        );
      }

      res.redirect("/viewOrders");
    } catch (error) {
      console.error("Error in cancelUserOrder:", error);
      res.redirect("/viewOrders"); // Redirect to an error page or display an error message
    }
  },

  /******************************* user pagination***********************************/

  productPagination: async (req, res) => {
    try {
      let users = req.session.users;
      let pageCount = req.params.id || 1;
      let pageNum = parseInt(pageCount);
      let limit = 8;
      let products = await totalProductView(pageNum, limit);
      let pages = [];

      let allProducts = await getAllProducts();
      let totalProducts = allProducts.length;
      //   let limit = 8;

      for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
        pages.push(i);
      }

      res.render("user/view-products", { user: true, users, products, pages });
    } catch (error) {
      console.error("Error in productPagination:", error);
      res.redirect("/"); // Redirect to an error page or display an error message
    }
  },

  /******************************* user payment verification***********************************/

  verifyPayment: (req, res) => {
    try {
      verifyPaymentHelper(req.body)
        .then(() => {
          userHelpers
            .changePaymentStatus(req.body["order[receipt]"])
            .then(() => {
              res.json({ status: true });
            });
        })
        .catch((err) => {
          res.json({ status: false });
        });
    } catch (error) {
      console.error("Error in verifyPayment:", error);
      res.json({ status: false });
    }
  },

  /******************************* user account and address***********************************/

  userAccount: (req, res) => {
    try {
      let user = req.session.users;
      if (user) {
        getAllAddresses(user._id).then((users) => {
          res.render("user/user-account", { user: true, users });
        });
      } else {
        res.render("user/login");
      }
    } catch (error) {
      console.error("Error in userAccount:", error);
      res.render("error-page");
    }
  },

  addUserAdress: (req, res) => {
    let users = req.session.users;
    if (users) {
      res.render("user/add-user-adress", { user: true, users });
    } else {
      res.render("user/login");
    }
  },

  addMultiAddress: (req, res) => {
    try {
      let users = req.session.users;
      addAddressUser(req.body, users).then(() => {
        res.redirect("/user-account");
      });
    } catch (error) {
      console.error("Error in addMultiAddress:", error);
      res.render("error-page");
    }
  },

  /******************************* user coupon check***********************************/

  checkCoupon: (req, res) => {
    couponManagement(req.body.data, req.body.total)
      .then((response) => {
        res.json(response);
      })
      .catch(() => {
        const error = "Enter a valid coupon";
        res.status(400).json({ error: error });
      });
  },

  contactUs: (req, res) => {
    let users = req.session.users;
    res.render("user/contact-us", { user: true, users });
  },

  /******************************* user category filter***********************************/

  categoryFilter: async (req, res) => {
    try {
      if (req.session.loggedIn) {
        let users = req.session.users;
        let name = req.body;
        let category = await getCategotyList();

        let product = await categoryFilterFind(name);
        let totalProducts = product.length;
        let limit = 12;
        let products = product.slice(0, limit);
        let pages = [];

        for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
          pages.push(i);
        }
        res.render("user/view-products", {
          user: true,
          products,
          category,
          users,
          pages,
        });
      } else {
        let name = req.body;
        let category = await getCategotyList();

        let products = await categoryFilterFind(name);
        res.render("user/view-products", { user: true, products, category });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  /******************************* user order return***********************************/

  returnUserOrder: (req, res) => {
    try {
      returnOrder(req.body.orderId, req.body.orderStatus, req.body.retreason)
        .then(() => {
          orderProductsList(req.body.orderId)
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

              stockIncrementAfterReturn(ids)
                .then(() => {
                  userHelpers
                    .getWalletAmount(req.body.orderId)
                    .then((wallet) => {
                      if (wallet && wallet.paymentmethod) {
                        cancelAfterCreateWallet(
                          wallet.totalPrice,
                          wallet.userId,
                          wallet.paymentmethod
                        );
                        res.redirect("/viewOrders");
                      } else {
                        res.redirect("/viewOrders");
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                      res.status(500).send("Internal Server Error");
                    });
                })
                .catch((error) => {
                  console.error(error);
                  res.status(500).send("Internal Server Error");
                });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Internal Server Error");
            });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Internal Server Error");
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  /******************************* user fill address***********************************/

  fillAddress: async (req, res) => {
    try {
      let userAddressId = req.body.addressId;

      if (userAddressId) {
        let getOneAddress = await getOneAddressById(
          req.session.users._id,
          userAddressId
        );

        if (getOneAddress) {
          let response = getOneAddress;
          response.status = true;
          res.json(response);
        } else {
          res.json({ status: false });
        }
      } else {
        res.json({ status: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  editUserAddress: (req, res) => {
    try {
      const userId = req.session.users._id;
      const addressId = req.params.id;

      getUserEditAddress(userId, addressId)
        .then((address) => {
          res.render("user/edit-user-address", { user: true, address });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Internal Server Error");
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  editMultiAddressSubmit: (req, res) => {
    try {
      let addressId = req.params.id;
      let userId = req.session.users._id;
      let address = req.body;

      updateEditedAddress(userId, addressId, address)
        .then(() => {
          res.redirect("/user-account");
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Internal Server Error");
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  /******************************* user cancellation and return reasons***********************************/

  cancelReason: (req, res) => {
    let body = req.body;
    res.render("user/cancel-reason", { user: true, body });
  },

  returnReason: (req, res) => {
    let body = req.body;
    res.render("user/return-reason", { user: true, body });
  },

  /******************************* user wallet***********************************/

  userWallet: async (req, res) => {
    try {
      let users = req.session.users;
      let wallet = await getUserWallet(users._id);
      res.render("user/user-wallet", { user: true, wallet });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteAddress(req, res) {
    let users = req.session.users;
    deleteAddress(req.params.id, users).then((response) => {
      res.redirect("/user-account");
    });
  },
};
