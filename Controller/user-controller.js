const { doSignup, doLogin, findByNumber } = require("../Model/user-helpers");
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
        
       

        productHelpers.getAllProducts().then((products) => {
            
        let totalProducts = products.length
         let limit = 6
         let limitedProducts = products.slice(0, limit);
        let pages = []
        for(let i=1; i<=Math.ceil(totalProducts/limit); i++){
            pages.push(i)
        }
        
        // console.log("pages: ",pages)
        

            res.render('user/view-products', { user: true, products, users ,cartCount, pages });
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

    otpCode(req, res) {
        number = req.body.number;
        // accound finding
        findByNumber(number).then((user) => {
            otpuser = user;
            client.verify
                .services(serviceId)
                .verifications.create({
                    to: "+91" + number,
                    channel: 'sms',
                })
                .then(() => {
                    res.render('user/otpcode');
                })
                .catch((err) => {
                    console.log(err.error);
                });
        })
            .catch((err) => {
                console.log(otpuser);
                res.render('user/otpnumber', { error: err.error });
            });


    },

    otpVerify(req, res) {

        console.log(req.body.otp);
        client.verify
            .services(serviceId)
            .verificationChecks.create({
                to: `+91${number}`,
                code: req.body.otp,
            }).then(async (data) => {
                console.log(data);
                if (data.status === 'approved') {
                    req.session.loggedIn = true;
                    req.session.users = otpuser;
                    res.redirect('/');
                } else {
                    console.log('OTP not matched');
                    res.render('user/otpcode', { user: true, error: 'invalid OTP' });
                }
            });

    },

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

    changeProductQuantity: (req, res, next) => {
        console.log(req.body, "{{{{{{{{{{{{{{ppppppppppppppppppppppppppppppppppppppppppppppppppppp}}}}}}}}}}}}}}");
        userHelpers.changeCartProductQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.getTotalAmount(req.body.user)
            res.json(response)
        })
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
        let totalPrice =await userHelpers.getTotalAmount(req.body.userId)
        userHelpers.placeUserOrder(req.body,products,totalPrice).then((response)=>{
            res.json({status:true})
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
        res.render('user/view-order-products', {user:true , users, products})
    }),

    cancelUserOrder : (async(req,res)=>{
        userHelpers.cancelCurrentOrder(req.params.id,req.body.status).then(()=>{
            res.redirect('/viewOrders')
        })
    }),

    productPagination : (async(req, res) =>{
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    
        console.log(req.params.id,"<<<<<<<<<<<<<<<<<<<<");
        let pageCount = req.params.id || 1
        let pageNum = parseInt(pageCount)
        let limit = 6
        console.log("pageNum : ",pageNum);
        console.log(pageCount,"pageeeeeeeee");
    
        userHelpers.totalProductView(pageNum, limit).then((products) => {
            let pages = []
            productHelpers.getAllProducts().then((products) => {
                console.log(products),"propppppppppppp";
                let totalProducts = products.length
                
                 let limit = 6
                for(let i=1; i<=Math.ceil(totalProducts/limit); i++){
                    pages.push(i)
                }
              
                console.log(response,"responseeeeeeeeeeeee>>>");
                
                })
                res.render('user/view-products', {user:true ,products,pages})
        })
    }),

    

}