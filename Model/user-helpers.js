var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const bcrypt = require('bcrypt')
const { reject, promise } = require('bcrypt/promises')
const { response } = require('express')
var ObjectId = require('mongodb').ObjectID
const Razorpay = require('razorpay')
const { resolve } = require('node:path')
var instance = new Razorpay({
    key_id: 'rzp_test_2OQT5vz8WgTGvO',
    key_secret: 'G6vMKKvkkG7mTw32cfp1ziP3',
  });


module.exports = {
    doSignup: (userData) => {

        userData.isblocked = false
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((userData) => {
                resolve(userData)
            })
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            // console.log(user);
            if (user) {

                if (user.isblocked) {
                    reject({ error: "user is blocked" })
                } else {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            resolve(user)
                        } else {
                            reject({ error: "password" })
                        }

                    })

                }


            } else {
                reject({ error: "Invalid Email" })
            }

        })
    },

    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let AllUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(AllUsers)

        })
    },

    findByNumber(num) {
        console.log(num);
        return new Promise(async (resolve, reject) => {
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: num });
            if (user) {
                if (user.isblocked) {
                    reject({ error: 'This account is block' });
                } else {
                    resolve(user);
                }
            } else {
                reject({ error: 'account not found' });

            }
        })
    },

    addToTheCart: (proId, userId) => {
        let proObj = {
            item: ObjectId(proId),
            quantity: 1
        }
        // console.log(proObj.item,proObj.quantity+' proobj');
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist + 'proExist');
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)
        })
    },

    getCartCount: (async (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            // console.log(cart.products,"cart++++++++++++++++++++++++++++++++++++++++++++++++++++");
            if (cart) {
                count = db.get().collection(collection.CART_COLLECTION).findOne({user: ObjectId(userId)}).length
            }
            resolve(count)
        })
    }),

    changeCartProductQuantity: (details) => {
    
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity)
        console.log(details.count,details.quantity);
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:ObjectId(details.cart)},
                {
                    $pull : {products:{item:ObjectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart),'products.item':ObjectId(details.product)},
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {  
                        resolve({status:true})
                    })
            }
        })
    },

    removeCartProducts: (details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:ObjectId(details.cart)},
                {
                    $pull : {products:{item:ObjectId(details.product)}}
                }
                ).then((response)=>{
                    resolve(true)
                })
        })
    },

    getTotalAmount :(userId)=>{
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group:{
                        
                        _id:null,total:{$sum:{$multiply:[{ $toDouble: "$quantity" },
                       { $toDouble: "$product.price" }]}}
                    }
                }


            ]).toArray()
            // console.log(total[0].total,"//////////////////////////////RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
            resolve(total[0]?.total)
        })
    },

    // placeUserOrder : (order,products,total)=>{
    //     return new Promise((resolve,reject)=>{
    //         let status=order.paymentmethod=='COD'?'placed':'pending'
    //         let orderObj = {
    //             deliveryDetails:{
    //                 mobile:order.mobile,
    //                 address:order.address,
    //                 pincode:order.pincode
    //             },
    //             userId:ObjectId(order.userId),
    //             paymentmethod:order.paymentmethod,
    //             products:products,
    //             totalPrice:total,
    //             status:status,
    //             date:new Date()
    //         }
    //         db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
    //             db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
    //             resolve(response.ops[0]._id)
    //         })
    //     })
    // },

    placeUserOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
          let status = order.paymentmethod == 'COD' ? 'placed' : 'pending';
          let orderObj = {
            deliveryDetails: {
              mobile: order.mobile,
              address: order.address,
              pincode: order.pincode,
            },
            userId: ObjectId(order.userId),
            paymentmethod: order.paymentmethod,
            products: products,
            totalPrice: total,
            status: status,
            date: new Date(),
          };
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .insertOne(orderObj)
            .then((response) => {
              db.get()
                .collection(collection.CART_COLLECTION)
                .deleteOne({ user: ObjectId(order.userId) });
              resolve(response.insertedId.toString());
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
      

    getCartProductList : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            resolve(cart.products)
        })
    },

    getUserOrders : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders =await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userId)}).toArray()
            resolve(orders);
        })
    },

    getOrderProducts : (orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }

            ]).toArray()
            resolve(orderItems);

        })
    },

    cancelCurrentOrder : ((orderId, status)=>{
        return new Promise((resolve,reject)=>{
            if(status=='placed'||status=='pending'){
                status = "cancelled"
            }
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
                {
                    $set:{
                        status : status
                    }
                }
                ).then((response)=>{
                    resolve(response)
                })
            

        })
        
    }),

    // userProductView : () =>{
    //     return new Promise(async(resolve, reject) => {
    //         let products = await db.get.collection(collection.PRODUCT_COLLECTION).find().toArray()
    //         resolve(products)
    //     })
    // },

    userProductView : () =>{
        return new Promise(async (resolve, reject) => {
            try {
              let products = await db.collection(collection.PRODUCT_COLLECTION).find().toArray();
              resolve(products);
            } catch (error) {
              reject(error);
            }
          });
          
    },

  
    totalProductView: (pageNum, limit) => {
        let skipNum = parseInt((pageNum - 1) * limit);
        console.log(skipNum,"skipppp");
        return new Promise(async (resolve, reject) => {
          let products = await db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .find()
            .skip(skipNum)
            .limit(limit)
            .toArray();
            console.log(products,"products after skipped")
          resolve(products);
        });
      },

      generateRazorpay : (orderId, total) =>{
        return new Promise((resolve, reject)=>{
            
            instance.orders.create({
                amount: total,
                currency: "INR",
                receipt: "" + orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }

            }, (err, order) => {

                if (err) {
                    console.log(err);
                } else {
                    console.log(order);
                    resolve(order);
                }
            })
        })
      },

      verifyPaymentHelper : (details)=>{
        return new Promise(async(resolve, reject)=>{
            const {
                createHmac,
              } = await import('node:crypto');
                let hmac = createHmac('sha256', 'G6vMKKvkkG7mTw32cfp1ziP3');

                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
                hmac = hmac.digest('hex')
                if(hmac == details['payment[razorpay_signature]']){
                    resolve()
                } else {
                    reject()
                }
        })
      },

      changePaymentStatus : (orderId)=>{
        return new Promise((resolve , reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:ObjectId(orderId)},
            {
                $set : {
                    status : 'Placed'
                }
            }
            ).then(()=>{
                resolve()
            })
        })
      }
      

}