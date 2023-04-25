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
        if (req.session.users) {
            res.redirect('/');
        } else {
            res.render('user/login')
        }
    },


    homePage: (async (req, res) => {
        let users = req.session.users
        let cartCount = null
        // if(req.session.users){
        // cartCount =await userHelpers.getCartCount(req.session.users._id)
        // }
        if (req.session.users) {
            cartCount = await userHelpers.getCartCount(req.session.users._id)
            res.render('user/homepage', { user: true, users, cartCount })
        } else {
            res.render('user/homepage', { user: true })
        }

    }),


    userSignup(req, res) {
        doSignup(req.body).then((userData) => {
            req.session.loggedIn = true;
            req.session.users = userData;
        })

        res.render('user/homepage', { user: true })

    },


    loginAction(req, res) {

        doLogin(req.body).then((user) => {

            req.session.loggedIn = true;
            req.session.users = user;

            res.redirect('/');
        }).catch((error) => {
            res.render('user/login', { error: error.error })
        })
    },


    viewProducts:(async(req, res)=>{
        let users = req.session.users
        cartCount = await userHelpers.getCartCount(req.session.users._id)
        // productCount = userHelpers.getProductsCount()
        let category = await userHelpers.getCategotyList()
        
        productHelpers.getAllProducts().then((product) => {
        let totalProducts = product.length
         let limit = 12
         let products = product.slice(0, limit);
        let pages = []
        for(let i=1; i<=Math.ceil(totalProducts/limit); i++){
            pages.push(i)
        }
        
        // console.log("pages: ",pages)
        

            res.render('user/view-products', { user: true, products, users ,cartCount, pages ,category });
        })
    }),

    logoutUser(req, res) {
        req.session.loggedIn = false;
        req.session.users = null;
        res.render('user/login');
    },

    productDescription(req, res) {
        let users = req.session.users
        productHelpers.getAllProductDescription(req.params.id).then((products) => {
            res.render('user/product-description', { user: true, products, users });
        })
        // res.render('user/' , {user:true , products})
    },

    otpLogin(req, res) {
        res.render('user/otpnumber')
    },

      otpCode : (async (req, res)=> {
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

    cart: (async (req, res) => {
        let users = req.session.users

        let products = await userHelpers.getCartProducts(req.session.users._id)
        let totalValue = await userHelpers.getTotalAmount(req.session.users._id)
        if (req.session.users) {
            cartCount = await userHelpers.getCartCount(req.session.users._id)
            if (products.length != 0) {
                res.render('user/cart', { user: true, users, products, cartCount, totalValue })
            } else {
                res.render('user/empty-cart', { user: true, users })
            }
        }
    }),

    addToCart(req, res) {
        console.log(req.params.id, req.session.users._id);
        userHelpers.addToTheCart(req.params.id, req.session.users._id).then(() => {
            res.json({ status: true })
        })
    },

    // changeProductQuantity: (req, res, next) => {
    //     console.log(req.body, "{{{{{{{{{{{{{{ppppppppppppppppppppppppppppppppppppppppppppppppppppp}}}}}}}}}}}}}}");
    //     userHelpers.changeCartProductQuantity(req.body).then(async (response) => {
    //         console.log(response,"RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRr");
    //         response.total = await userHelpers.getTotalAmount(req.body.user)
    //         console.log(response.total,"totallllllllllllllllllllllllllll");
    //         res.json(response)
    //     })
    // },

    changeProductQuantity: (req, res, next) => {
        console.log(req.body, "{{{{{{{{{{{{{{ppppppppppppppppppppppppppppppppppppppppppppppppppppp}}}}}}}}}}}}}}");
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
      },

      
      

    homeRedirect: (req, res) => {
        res.redirect('/')
    },

    removeProductQuantity(req, res) {
        userHelpers.removeCartProducts(req.body).then((response) => {
            res.json(response)
        })
    },

    checkout: (async (req, res) => {
        let users = req.session.users
        let total = await userHelpers.getTotalAmount(req.session.users._id)
        res.render('user/checkout-page', { user: true, users, total })
    }),

    placeOrder:(async(req, res) =>{
        let products = await userHelpers.getCartProductList(req.body.userId)
        if(req.body.offerdata) {
            var totalPrice = req.body.offerdata
        }else{
            var totalPrice =await userHelpers.getTotalAmount(req.body.userId)

        }
        userHelpers.placeUserOrder(req.body,products,totalPrice).then((orderId)=>{
            if(req.body['paymentmethod']==='COD') {
                res.json({codSuccess:true})
            } else {
                userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
                    res.json(response)
                })
            }
           
        })
    }),

    orderSuccessful(req,res){
        let users=req.session.users
        res.render('user/order-successful' ,{user:true, users})
    },

    viewOrders:(async(req,res)=>{
        let users=req.session.users
        let orders = await userHelpers.getUserOrders(req.session.users._id)
        res.render('user/view-orders', {user:true, users, orders})

    }),

    viewOrderProducts : (async(req,res)=>{
        let users = req.session.users
        let products = await userHelpers.getOrderProducts(req.params.id)
        let totalAmount = await userHelpers.getOrderDetails(req?.params?.id)
       products[0].totalAmount=totalAmount
        console.log(products[0].quantity,"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
        res.render('user/view-order-products', {user:true , users, products})
    }),

    cancelUserOrder : (async(req,res)=>{
        userHelpers.cancelCurrentOrder(req.params.id,req.body.status).then(()=>{
            res.redirect('/viewOrders')
        })
    }),

    productPagination : (async(req, res) =>{
        let users = req.session.users
    
        let pageCount = req.params.id || 1
        let pageNum = parseInt(pageCount)
        let limit = 12
        console.log("pageNum : ",pageNum);
        console.log(pageCount,"pageeeeeeeee");
    
        userHelpers.totalProductView(pageNum, limit).then((products) => {
            let pages = []
            productHelpers.getAllProducts().then((products) => {
                let totalProducts = products.length
                
                 let limit = 8
                for(let i=1; i<=Math.ceil(totalProducts/limit); i++){
                    pages.push(i)
                }
                              
                })
                res.render('user/view-products', {user:true,users ,products,pages})
        })
    }),

    verifyPayment: ((req, res)=>{
        console.log(req.body);
        userHelpers.verifyPaymentHelper(req.body).then(()=>{
            userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
                console.log("Payment Successfull");
                res.json({status : true})
            })
        }).catch((err)=>{
            res.json({status : false})
        })
    }),

    userAccount : ((req,res)=>{
        let users = req.session.users
        if(users){
            // userHelpers.getUserAddress(users).then((userdata)=>{
            //     console.log(userdata,"userdataaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
            //     // res.json(userdata)
               
            // })
            console.log(users,"pppppp");
            res.render('user/user-account', {user : true, users})
            
        }else{
            res.render('user/login')
        }
        
    }),

    addUserAdress :((req, res) => {
        let users = req.session.users
        if(users){
            res.render('user/add-user-adress', {user : true, users})
        }else{
            res.render('user/login')
        }
    }),

    addMultiAddress : ((req ,res)=>{
        users = req.session.users
        console.log(req.params);
        userHelpers.addAddressUser(req.body, users).then(()=>{
            res.redirect('/user-account')
        })
    }),

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
      })

    

}