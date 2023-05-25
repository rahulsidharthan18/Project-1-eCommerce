const { doSignup, doLogin, findByNumber ,couponManagement } = require("../Model/user-helpers");
var productHelpers = require('../Model/product-helpers');
const userHelpers = require("../Model/user-helpers");
const { response } = require("express");
const adminHelpers = require("../Model/admin-helpers");
let otpuser;
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const serviceId = process.env.TWILIO_SERVICE_ID
const client = require("twilio")(accountSid,authToken,serviceId);



module.exports = {



    loginPage(req, res) {
        try {
            if (req.session.users) {
                res.redirect('/');
            } else {
                res.render('user/login')
            }
        } catch (error) {
            console.error(e);
            res.status(500).send('An error occurred');
        }
    },


    homePage: (async (req, res) => {
        try {
            let users = req.session.users
            let cartCount = null
        
        if (req.session.users) {
            cartCount = await userHelpers.getCartCount(req.session.users._id)
            res.render('user/homepage', { user: true, users, cartCount })
        } else {
            res.render('user/homepage', { user: true })
        }
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred');
        }

    }),


    userSignup(req, res) {
        try {
            doSignup(req.body).then((userData) => {
                req.session.loggedIn = true;
                req.session.users = userData;
                res.render('user/login');
            }).catch((error) => {
                // Handle error
                console.error('Signup error:', error);
                res.render('error', { message: 'An error occurred during signup.' });
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.render('error', { message: 'An error occurred during signup.' });
        }
    },
    


    loginAction(req, res) {
        try {
            doLogin(req.body).then((user) => {
                req.session.loggedIn = true;
                req.session.users = user;
                res.redirect('/');
            }).catch((error) => {
                res.render('user/login', { error: error.error });
            });
        } catch (error) {
            console.error('Login error:', error);
            res.render('error', { message: 'An error occurred during login.' });
        }
    },


    viewProducts: async (req, res) => {
        try {
            let users = req.session.users;
            let cartCount = await userHelpers.getCartCount(req.session.users._id);
            let category = await userHelpers.getCategotyList();
    
            let product = await productHelpers.getAllProducts();
            let totalProducts = product.length;
            let limit = 12;
            let products = product.slice(0, limit);
            let pages = [];
    
            for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
                pages.push(i);
            }
    
            res.render('user/view-products', { user: true, products, users, cartCount, pages, category });
        } catch (error) {
            console.error('Error occurred while viewing products:', error);
            res.render('error', { message: 'An error occurred while viewing products.' });
        }
    },    

    logoutUser(req, res) {
        req.session.loggedIn = false;
        req.session.users = null;
        res.render('user/login');
    },

    productDescription(req, res) {
        let users = req.session.users;
        productHelpers.getAllProductDescription(req.params.id)
            .then((products) => {
                res.render('user/product-description', { user: true, products, users });
            })
            .catch((error) => {
                console.error('Error occurred while fetching product description:', error);
                res.render('error', { message: 'An error occurred while fetching product description.' });
            });
    },    

    otpLogin(req, res) {
        res.render('user/otpnumber')
    },

      otpCode : (async (req, res)=> {
        console.log(serviceId,"ffffffffffffffffffffffffffffffffffffffffff");
        try {
          const number = req.body.number;
          const user = await findByNumber(number);
          console.log(user,"[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
            otpuser = user
            console.log(otpuser);
          const result = await client.verify.v2.services(serviceId).verifications.create({
            to: "+91" + number,
            channel: 'sms',
          });
          res.render('user/otpcode',{number:number});
        } catch (error) {
          console.error(error);
          res.render('user/otpnumber', { error: error.message });
        }
      })
      
      ,


      otpVerify :(async(req, res) => {
        console.log(req.body,"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
        number = otpuser.phone
        console.log(number);
        console.log(req.body.otp);
        const verify = await client.verify.v2.services(serviceId)
            .verificationChecks.create({
                to: `+91${number}`,
                code: req.body.otp,
            }).then(async (data) => {
                console.log(data);
                if (data.status === 'approved') {
                    req.session.loggedIn = true;
                    console.log(otpuser,"(((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))");
                    req.session.users = otpuser;
                    res.redirect('/');
                } else {
                    console.log('OTP not matched');
                    res.render('user/otpcode', { user: true, error: 'invalid OTP' });
                }
            });

    })


    //   otpVerify: async (req, res) => {
    //     try {
    //       console.log("PPPPPPPPPPPP", req.body.otp);
    //       console.log("client:", client);
    //       console.log("serviceId:", serviceId);
    //       const data = await client.verify.v2.services(serviceId).checks.create({
    //         to: `+91${number}`,
    //         code: req.body.otp,
    //       });
    //       console.log(data);
    //       if (data.status === 'approved') {
    //         req.session.loggedIn = true;
    //         req.session.users = otpuser;
    //         res.redirect('/');
    //       } else {
    //         console.log('OTP not matched');
    //         res.render('user/otpcode', { user: true, error: 'invalid OTP' });
    //       }
    //     } catch (error) {
    //       console.log('Error occurred while verifying OTP:', error);
    //       res.render('user/otpcode', { user: true, error: 'Error occurred while verifying OTP' });
    //     }
    //   }
      
      
      ,

      cart: async (req, res) => {
        try {
            let users = req.session.users;
    
            if (req.session.users) {
                let products = await userHelpers.getCartProducts(req.session.users._id);
                let totalValue = await userHelpers.getTotalAmount(req.session.users._id);
                let cartCount = await userHelpers.getCartCount(req.session.users._id);
    
                if (products.length !== 0) {
                    res.render('user/cart', { user: true, users, products, cartCount, totalValue });
                } else {
                    res.render('user/empty-cart', { user: true, users });
                }
            }
        } catch (error) {
            console.error('Error occurred while fetching cart details:', error);
            res.render('error', { message: 'An error occurred while fetching cart details.' });
        }
    },    

    addToCart(req, res) {
        try {
            console.log(req.params.id, req.session.users._id);
            userHelpers.addToTheCart(req.params.id, req.session.users._id).then(() => {
                res.json({ status: true });
            });
        } catch (error) {
            console.error('Error occurred while adding to cart:', error);
            res.json({ status: false, error: 'An error occurred while adding to cart.' });
        }
    },    

    changeProductQuantity: (req, res, next) => {
        try {
          userHelpers.changeCartProductQuantity(req.body)
            .then(async (response) => {
              console.log(response, "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRr");
              if (response) {
                const total = await userHelpers.getTotalAmount(req.body.user);
                console.log(total, "totallllllllllllllllllllllllllll");
                response.total = total;
                res.json(response);
              } else {
                console.log("Response is undefined");
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
        res.redirect('/')
    },

    removeProductQuantity(req, res) {
        userHelpers
          .removeCartProducts(req.body)
          .then((response) => {
            res.json(response);
          })
          .catch((error) => {
            console.error(error);
            res.json({ error: "Unable to remove product quantity" });
          });
      },      

      checkout: async (req, res) => {
        try {
          let users = req.session.users;
          let total = await userHelpers.getTotalAmount(req.session.users._id);
          let address = await userHelpers.getAllAddress(req.session.users._id);
          let wallet = await userHelpers.getUserWallet(users._id);
      
          if (wallet && wallet.total && wallet.total > 0 && wallet.total >= total) {
            wallet.exist = "success";
          } else {
            wallet.total = 0;
          }
      
          console.log(address, "[[{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}]]");
          res.render('user/checkout-page', { user: true, users, total, address, wallet });
        } catch (error) {
          console.error("Error in checkout:", error);
          res.render('error-page', { message: "An error occurred during checkout." });
        }
      },      

      placeOrder: async (req, res) => {
        try {
          let products = await userHelpers.getCartProductList(req.body.userId);
          let totalPrice;
          if (req.body.offerdata) {
            totalPrice = req.body.offerdata;
          } else {
            totalPrice = await userHelpers.getTotalAmount(req.body.userId);
          }
          userHelpers.placeUserOrder(req.body, products, totalPrice)
            .then((orderId) => {
              if (req.body['paymentmethod'] === 'COD') {
                res.json({ codSuccess: true });
              } else if (req.body['paymentmethod'] === 'razorpay') {
                userHelpers.generateRazorpay(orderId, totalPrice)
                  .then((response) => {
                    res.json(response);
                  })
                  .catch((error) => {
                    console.error("Error in generateRazorpay:", error);
                    throw error;
                  });
              } else {
                console.log("WAllet{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
                userHelpers.generateWalletOrder(req.body.userId, totalPrice)
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

    orderSuccessful(req,res){
        let users=req.session.users
        res.render('user/order-successful' ,{user:true, users})
    },

    viewOrders: async (req, res) => {
        try {
          let users = req.session.users;
          let orders = await userHelpers.getUserOrders(req.session.users._id);
          res.render('user/view-orders', { user: true, users, orders });
        } catch (error) {
          console.error("Error in viewOrders:", error);
          res.render('error-page', { message: "An error occurred while fetching user orders." });
        }
      },      

      viewOrderProducts: async (req, res) => {
        try {
          let users = req.session.users;
          let products = await userHelpers.getOrderProducts(req.params.id);
          let totalAmount = await userHelpers.getOrderDetails(req?.params?.id);
          let address = await userHelpers.getAddresOrder(req.params.id);
          let paymentmethod = await userHelpers.getOrderPayment(req.params.id);
          console.log("kkkkkk", paymentmethod.paymentmethod, "method{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}");
          products[0].totalAmount = totalAmount;
          products[0].paymentmethod = paymentmethod.paymentmethod;
          console.log(products, "kkkkkkkkkkkkkkkkkkkk");
          console.log(products[0].paymentmethod, "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
          console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm");
          res.render('user/view-order-products', { user: true, users, products, address });
        } catch (error) {
          console.error("Error in viewOrderProducts:", error);
          res.render('error-page', { message: "An error occurred while fetching order products." });
        }
      },      

      cancelUserOrder: async (req, res) => {
        try {
          let reason = req.body.creason;
          let orderId = req.body.orderId;
          let orderStatus = req.body.orderStatus;
      
          await userHelpers.cancelOrder(orderId, orderStatus, reason);
      
          let products = await userHelpers.orderProductsList(orderId);
      
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
      
          await userHelpers.stockIncrementAfterCancel(ids);
      
          let wallet = await userHelpers.getWalletAmount(req.body.orderId);
          if (wallet && wallet.paymentmethod === 'razorpay') {
            await userHelpers.cancelAfterCreateWallet(wallet.totalPrice, wallet.userId, wallet.paymentmethod);
          }
      
          res.redirect('/viewOrders');
        } catch (error) {
          console.error("Error in cancelUserOrder:", error);
          res.redirect('/viewOrders'); // Redirect to an error page or display an error message
        }
      },

    //   productPagination : (async(req, res) =>{
    //     let users = req.session.users
    
    //     let pageCount = req.params.id || 1
    //     let pageNum = parseInt(pageCount)
    //     let limit = 12
    //     console.log("pageNum : ",pageNum);
    //     console.log(pageCount,"pageeeeeeeee");
    
    //     userHelpers.totalProductView(pageNum, limit).then((products) => {
    //         let pages = []
    //         productHelpers.getAllProducts().then((products) => {
    //             let totalProducts = products.length
                
    //              let limit = 8
    //             for(let i=1; i<=Math.ceil(totalProducts/limit); i++){
    //                 pages.push(i)
    //             }
                              
    //             })
    //             res.render('user/view-products', {user:true,users ,products,pages})
    //     })
    // }),

      productPagination: async (req, res) => {
        try {
          let users = req.session.users;
          let pageCount = req.params.id || 1;
          let pageNum = parseInt(pageCount);
          let limit = 8;
          console.log("pageNum: ", pageNum);
          console.log(pageCount, "pageeeeeeeee");
      
          let products = await userHelpers.totalProductView(pageNum, limit);
          let pages = [];
      
          let allProducts = await productHelpers.getAllProducts();
          let totalProducts = allProducts.length;
        //   let limit = 8;
      
          for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
            pages.push(i);
          }
      
          res.render('user/view-products', { user: true, users, products, pages });
        } catch (error) {
          console.error("Error in productPagination:", error);
          res.redirect('/'); // Redirect to an error page or display an error message
        }
      },      

      verifyPayment: (req, res) => {
        try {
          console.log(req.body);
          userHelpers.verifyPaymentHelper(req.body).then(() => {
            userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
              console.log("Payment Successful");
              res.json({ status: true });
            });
          }).catch((err) => {
            res.json({ status: false });
          });
        } catch (error) {
          console.error("Error in verifyPayment:", error);
          res.json({ status: false });
        }
      },      

      userAccount: (req, res) => {
        try {
          let user = req.session.users;
          if (user) {
            userHelpers.getAllAddresses(user._id).then((users) => {
              console.log(users, "pppppp");
              res.render('user/user-account', { user: true, users });
            });
          } else {
            res.render('user/login');
          }
        } catch (error) {
          console.error("Error in userAccount:", error);
          res.render('error-page');
        }
      },      

    addUserAdress :((req, res) => {
        let users = req.session.users
        if(users){
            res.render('user/add-user-adress', {user : true, users})
        }else{
            res.render('user/login')
        }
    }),

    addMultiAddress: (req, res) => {
        try {
          let users = req.session.users;
          console.log(req.params);
          userHelpers.addAddressUser(req.body, users).then(() => {
            res.redirect('/user-account');
          });
        } catch (error) {
          console.error("Error in addMultiAddress:", error);
          res.render('error-page');
        }
      },      

    checkCoupon : ((req,res)=>{
        couponManagement(req.body.data, req.body.total).then((response)=>{
            res.json(response)
        }).catch(()=>{
            const error = "Enter a valid coupon";
            res.status(400).json({error:error});
            console.log(error);
        })
    }),

    contactUs : ((req,res)=>{
        res.render('user/contact-us' , {user:true})
      }),

      categoryFilter: async (req, res) => {
        try {
          console.log(req.body);
          let name = req.body;
          let category = await userHelpers.getCategotyList();
      
          let products = await userHelpers.categoryFilterFind(name);
          res.render('user/view-products', { user: true, products, category });
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      },      

      returnUserOrder: (req, res) => {
        try {
          userHelpers.returnOrder(req.body.orderId, req.body.orderStatus, req.body.retreason)
            .then(() => {
              userHelpers.orderProductsList(req.body.orderId)
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
                      userHelpers.getWalletAmount(req.body.orderId)
                        .then((wallet) => {
                          if (wallet && wallet.paymentmethod) {
                            userHelpers.cancelAfterCreateWallet(wallet.totalPrice, wallet.userId, wallet.paymentmethod);
                            res.redirect('/viewOrders');
                          } else {
                            res.redirect('/viewOrders');
                          }
                        })
                        .catch((error) => {
                          console.error(error);
                          res.status(500).send('Internal Server Error');
                        });
                    })
                    .catch((error) => {
                      console.error(error);
                      res.status(500).send('Internal Server Error');
                    });
                })
                .catch((error) => {
                  console.error(error);
                  res.status(500).send('Internal Server Error');
                });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Internal Server Error');
            });
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      },      

      fillAddress: async (req, res) => {
        try {
          let userAddressId = req.body.addressId;
      
          if (userAddressId) {
            let getOneAddress = await userHelpers.getOneAddressById(req.session.users._id, userAddressId);
      
            console.log('getOneAddress:', getOneAddress);
      
            if (getOneAddress) {
              let response = getOneAddress;
              response.status = true;
              console.log(response, "responseeeeeeeeeeeeeeeeeeeeeeeee");
              res.json(response);
            } else {
              res.json({ status: false });
            }
          } else {
            res.json({ status: false });
          }
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      },      

      editUserAddress: (req, res) => {
        try {
          const userId = req.session.users._id;
          const addressId = req.params.id;
      
          userHelpers.getUserEditAddress(userId, addressId)
            .then((address) => {
              console.log(address, "oooooooooooooooooookkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
              res.render('user/edit-user-address', { user: true, address });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Internal Server Error');
            });
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      },      

      editMultiAddressSubmit: (req, res) => {
        try {
          let addressId = req.params.id;
          let userId = req.session.users._id;
          let address = req.body;
      
          userHelpers.updateEditedAddress(userId, addressId, address)
            .then(() => {
              res.redirect('/user-account');
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Internal Server Error');
            });
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      },      

    cancelReason :((req, res)=> {
        
        let body = req.body
        console.log(body,"mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm");
        res.render('user/cancel-reason',{ user:true, body})
    }),

    returnReason :((req, res)=> {
        
        let body = req.body
        console.log(body,"mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm");
        res.render('user/return-reason',{ user:true, body})
    }),

    userWallet: async (req, res) => {
        try {
          let users = req.session.users;
          console.log(users._id, "oOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
          let wallet = await userHelpers.getUserWallet(users._id);
          console.log(wallet, "ppppppppppppp");
          res.render('user/user-wallet', { user: true, wallet });
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      }      
    
}