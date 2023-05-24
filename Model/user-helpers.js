var db = require("../dbconfig/connection");
var collection = require("../dbconfig/collection");
const bcrypt = require("bcrypt");
const { reject, promise } = require("bcrypt/promises");
const { response } = require("express");
var ObjectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");
const { resolve } = require("node:path");
const { error } = require("node:console");
const { AwsPage } = require("twilio/lib/rest/accounts/v1/credential/aws");
var instance = new Razorpay({
  key_id: "rzp_test_2OQT5vz8WgTGvO",
  key_secret: "G6vMKKvkkG7mTw32cfp1ziP3",
});

module.exports = {
  doSignup: (userData) => {
    userData.isblocked = false;
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((userData) => {
          resolve(userData);
        });
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      // console.log(user);
      if (user) {
        if (user.isblocked) {
          reject({ error: "user is blocked" });
        } else {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              resolve(user);
            } else {
              reject({ error: "password" });
            }
          });
        }
      } else {
        reject({ error: "Invalid Email" });
      }
    });
  },

  //------------------------get all users admin------------------------------//

  getAllUser: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let AllUsers = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .find()
          .toArray();
        resolve(AllUsers);
      } catch (error) {
        reject(error);
      }
    });
  },
  

  //------------------------get all users admin end------------------------------//


  //------------------------  ------------------------------//

  findByNumber(num) {
    console.log(num);
    return new Promise(async (resolve, reject) => {
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ phone: num });
      if (user) {
        if (user.isblocked) {
          reject({ error: "This account is block" });
        } else {
          resolve(user);
        }
      } else {
        reject({ error: "account not found" });
      }
    });
  },

  addToTheCart: (proId, userId) => {
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
    };
    // console.log(proObj.item,proObj.quantity+' proobj');
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });

      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(proId) });

      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist + " : proExist");
        if (proExist != -1) {
          if (product.stocknumber != userCart.products[proExist].quantity) {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: ObjectId(userId), "products.item": ObjectId(proId) },
                {
                  $inc: { "products.$.quantity": 1 },
                }
              )
              .then(() => {
                resolve();
              });
          }
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: ObjectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      // console.log(cartItems);
      resolve(cartItems);
    });
  },

  getCartCount: async (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      // console.log(cart.products,"cart++++++++++++++++++++++++++++++++++++++++++++++++++++");
      if (cart) {
        count = db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: ObjectId(userId) }).length;
      }
      resolve(count);
    });
  },

  // changeCartProductQuantity: (details) => {
  //   details.count = parseInt(details.count);
  //   details.quantity = parseInt(details.quantity);

  //   console.log(details.count, details.quantity);

  //   return new Promise(async(resolve, reject) => {

  //     let stock= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(details.product)})
  //     console.log(stock.stocknumber,"ppppppppppppppppp");
  //     stock = stock.stocknumber
  //     if(stock<(details.quantity + details.count)) {
  //       console.log("rejected");
  //       return reject()
  //     }else{
  //       if (details.count == -1 && details.quantity == 1) {
  //         db.get()
  //           .collection(collection.CART_COLLECTION)
  //           .updateOne(
  //             { _id: ObjectId(details.cart) },
  //             {
  //               $pull: { products: { item: ObjectId(details.product) } },
  //             }
  //           )
  //           .then((response) => {
  //             resolve({ removeProduct: true });
  //           })
  //           .catch((error) => {
  //             reject(error);
  //           });
  //       } else {
  //         db.get()
  //           .collection(collection.CART_COLLECTION)
  //           .updateOne(
  //             {
  //               _id: ObjectId(details.cart),
  //               "products.item": ObjectId(details.product),
  //             },
  //             {
  //               $inc: { "products.$.quantity": details.count },
  //             }
  //           )
  //           .then((response) => {
  //             resolve({ status: true });
  //           })
  //           .catch((error) => {
  //             reject(error);
  //           });
  //       }
  //     }
  //   })
  //   .catch((error) => {
  //     // handle the error here
  //     console.error(error);
  //   });
  // },

  getCategotyList: () => {
    return new Promise(async (resolve, reject) => {
      let category = db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(category);
    });
  },

  changeCartProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    console.log(details.count, details.quantity);

    return new Promise(async (resolve, reject) => {
      let stock = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(details.product) });
      console.log(stock.stocknumber, "ppppppppppppppppp");
      stock = stock.stocknumber;
      if (stock < details.quantity + details.count) {
        console.log("rejected");
        return reject({ error: "Stock limit Exceeded" });
      } else {
        if (details.count == -1 && details.quantity == 1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { _id: ObjectId(details.cart) },
              {
                $pull: { products: { item: ObjectId(details.product) } },
              }
            )
            .then((response) => {
              resolve({ removeProduct: true });
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                _id: ObjectId(details.cart),
                "products.item": ObjectId(details.product),
              },
              {
                $inc: { "products.$.quantity": details.count },
              }
            )
            .then((response) => {
              resolve({ status: true });
            })
            .catch((error) => {
              reject(error);
            });
        }
      }
    }).catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
  },

  removeCartProducts: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(details.cart) },
          {
            $pull: { products: { item: ObjectId(details.product) } },
          }
        )
        .then((response) => {
          resolve(true);
        });
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: [
                    { $toDouble: "$quantity" },
                    { $toDouble: "$product.price" },
                  ],
                },
              },
            },
          },
        ])
        .toArray();
      // console.log(total[0].total,"//////////////////////////////RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
      resolve(total[0]?.total);
    });
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

  // placeUserOrder: (order, products, total) => {
  //   return new Promise((resolve, reject) => {
  //     let status = order.paymentmethod == "COD" ? "placed" : "pending";
  //     let orderObj = {
  //       deliveryDetails: {
  //         mobile: order.mobile,
  //         address: order.address,
  //         pincode: order.pincode,
  //       },
  //       userId: ObjectId(order.userId),
  //       paymentmethod: order.paymentmethod,
  //       products: products,
  //       totalPrice: total,
  //       status: status,
  //       date: new Date(),
  //     };
  //     db.get()
  //       .collection(collection.ORDER_COLLECTION)
  //       .insertOne(orderObj)
  //       .then((response) => {
  //         db.get()
  //           .collection(collection.CART_COLLECTION)
  //           .deleteOne({ user: ObjectId(order.userId) });
  //         resolve(response.insertedId.toString());
  //       })
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // },

  placeUserOrder: (order, products, total) => {
    console.log(
      products.length,
      "[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]"
    );
   
    return new Promise((resolve, reject) => {
      var status = order.paymentmethod == "COD" ? "placed" : "pending";
      var status = order.paymentmethod == "wallet" ? "placed" : "pending";

      let orderObj = {
        deliveryDetails: {
          name:order.name,
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
          email: order.email,
          town: order.town
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
        .then(async (response) => {
          for (let i = 0; i < products.length; i++) {
            let product = products[i];
            let quantity = parseInt(products[i].quantity);
            let productId = products[i].item;
            let productDetails = await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .findOne({ _id: ObjectId(productId) });
            console.log(productDetails);
            if (productDetails) {
              let stockQuantity = productDetails.stocknumber;
              let updatedQuantity = stockQuantity - quantity;
              db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                  { _id: ObjectId(productId) },
                  { $set: { stocknumber: updatedQuantity } }
                );

              console.log("lllllll", product, "product");
              console.log(quantity, "quantity");
              console.log(productId, "productid");
              console.log(productDetails, "pdetails");
              console.log(
                stockQuantity,
                "stock>>>>>>>>>>>>>>>",
                updatedQuantity,
                "updated"
              );
            } else {
              console.log(`Could not find product with id ${productId}`);
            }
          }
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

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      resolve(cart?.products);
    });
  },

  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(userId) })
        .sort({ date: -1 })
        .toArray();

      resolve(orders);
      console.log(orders);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
              totalAmount: "$products.totalPrice",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      console.log(orderItems, "]]]]]]]]]]]]]]]]]]]]]]]");
      resolve(orderItems);
    });
  },

  getOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let details = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });
      console.log(
        details.totalPrice,
        ",,,,,,,,,,,,,,,,,,,,,,,,,...................."
      );
      resolve(details.totalPrice);
    });
  },

  cancelCurrentOrder: (orderId, status) => {
    return new Promise((resolve, reject) => {
      if (status == "placed" || status == "pending" || status == "shipped") {
        status = "cancelled";
      }
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: status,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  // userProductView : () =>{
  //     return new Promise(async(resolve, reject) => {
  //         let products = await db.get.collection(collection.PRODUCT_COLLECTION).find().toArray()
  //         resolve(products)
  //     })
  // },

  userProductView: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let products = await db
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .toArray();
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
  },

  totalProductView: (pageNum, limit) => {
    let skipNum = parseInt((pageNum - 1) * limit);
    console.log(skipNum, "skipppp");
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .skip(skipNum)
        .limit(limit)
        .toArray();
      console.log(products, "products after skipped");
      resolve(products);
    });
  },

  generateRazorpay: (orderId, total) => {
    console.log(total, "razorpay");
    return new Promise((resolve, reject) => {
      instance.orders.create(
        {
          amount: total*100,
          currency: "INR",
          receipt: "" + orderId,
          notes: {
            key1: "value3",
            key2: "value2",
          },
        },
        (err, order) => {
          if (err) {
            console.log(err);
          } else {
            console.log(order);
            resolve(order);
          }
        }
      );
    });
  },

  verifyPaymentHelper: (details) => {
    return new Promise(async (resolve, reject) => {
      const { createHmac } = await import("node:crypto");
      let hmac = createHmac("sha256", "G6vMKKvkkG7mTw32cfp1ziP3");

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  addAddressUser: (address, userId) => {
    console.log("/////////////////////////", address, "[[[[[[[]]]]]]]", userId);
    address.userAddressId = new Date().valueOf()
    console.log(address.userAddressId,":::::::::::::::::::::::::::");

    return new Promise((resolve, reject) => {
      let addressToPush = db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId._id) },
          {
            $push: {
              Addresses: {
                addressId: ObjectId(),
                name: address.name,
                address: address.address,
                town: address.town,
                pincode: address.pincode,
                mobile: address.mobile,
                email: address.email,
                userAddressId: address.userAddressId
              },
            },
          }
        )
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getUserAddress: (userId) => {
    return new Promise((resolve, reject) => {
      console.log(userId, "uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
      let address = db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) })
        .then((userdata) => {
          resolve(userdata);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  couponManagement: (code, total) => {
    console.log(code);
    console.log(total);

    const fdate = new Date()

    total = parseInt(total);
    return new Promise(async (resolve, reject) => {
      console.log(fdate);
      const coupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .aggregate([
          {
            $match: {
              code: code,
              maxvalue: {
                $gte: total,
              },
              startdate: {
                $lte: fdate,
              },
              enddate: {
                $gte: fdate,
              },
            },
          },
          {
            $project: {
              _id: null,
              offerAmount: {
                $subtract: [
                  total,
                  {
                    $divide: [{ $multiply: [total, "$discount"] }, 100],
                  },
                ],
              },
            },
          },
        ])
        .toArray();
      console.log(coupon, coupon[0]?.offerAmount, ">>>>>>>>>>>>>>");
      if (coupon.length != 0) {
        resolve(coupon[0]?.offerAmount);
      } else {
        return reject();
      }
    }).catch((error) => {
      return reject();
    });
  },

  categoryFilterFind: (categoryName) => {
    let name = categoryName.name;
    return new Promise(async (resolve, reject) => {
      console.log("lllllllllllllllllllllllllllllllllllll");
      let result = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ category: name })
        .toArray();
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
      console.log(result);
      resolve(result);
    });
  },

  returnOrder: (orderId, status ,reason) => {
    console.log(status," sttttttttttttttttttt[[[[[[[[[[[]]]]]]]]]]]");
    if(status == 'delivered'){
      status = 'returned'
      console.log(status," sttttttttttttttttttt");
    }


    return new Promise(async (resolve, reject) => {
      let aa =await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)}
      ,{
        $set : {
          status : status,
          returnReason : reason
        }
      }).then((response)=>{
        resolve(response)
      })
    });
  },

  getAllAddress : (async(userId)=> {
    return new Promise (async(resolve,reject)=> {
      let address = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
    console.log(address.Addresses, "[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
    resolve(address.Addresses)
  })
}),

getOneAddressById: (userId, address) => {

  let addressId = parseInt(address)
  console.log(addressId);

  return new Promise(async (resolve, reject) => {
      let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
          {
              $match: {
                  _id: ObjectId(userId)
              }
          },
          {
              $unwind: '$Addresses'
          },
          {
              $match: { 'Addresses.userAddressId': addressId }
          },
          {
              $project: {
                  name: '$Addresses.name',
          address: '$Addresses.address',
          town: '$Addresses.town',
          pincode: '$Addresses.pincode',
          mobile: '$Addresses.mobile',
          email: '$Addresses.email',
          userAddressId: '$Addresses.userAddressId'
              }
          }
      ]).toArray()
      console.log(address,"poooooooooooooooooooooooooooooooooo");
      resolve(address[0])
  })
},  

orderProductsList : ((orderId)=> {
  return new Promise(async (resolve, reject)=> {
    let order = await db.get().collection(collection.ORDER_COLLECTION)
    .findOne({_id : ObjectId(orderId)})
    resolve(order.products)
  })
}),

stockIncrementAfterReturn : ((item)=>{
  console.log(item, "item'''''''");

  return new Promise (async(resolve, reject) => {
    for (let i=0; i<item.length; i++) {
      await db.get().collection(collection.PRODUCT_COLLECTION)
      .updateOne({_id : item[i].prod},
        {
          $inc : {
            stocknumber : + item[i].quantity
          }
        })
    }
  })

}),

getAddresOrder : ((orderId) => {
  return new Promise (async (resolve, reject) => {
    let addres = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id: ObjectId(orderId)})
   console.log(addres,"((((((((((((((((((((((((((((()))))))))))))))))))))))))))))");
    resolve(addres)
  })
}),

cancelOrder: (orderId, status , reason) => {
  console.log(status," sttttttttttttttttttt[[[[[[[[[[[]]]]]]]]]]]");
  if(status == 'shipped' || status == 'placed'){
    status = 'cancelled'
    console.log(status," sttttttttttttttttttt");
  }


  return new Promise(async (resolve, reject) => {
    let aa =await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)}
    ,{
      $set : {
        status : status,
        cancelReason: reason
      }
    }).then((response)=>{
      resolve(response)
    })
  });
},


  stockIncrementAfterCancel : ((item)=>{
  
    return new Promise (async(resolve, reject) => {
      for (let i=0; i<item.length; i++) {
        await db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({_id : item[i].prod},
          {
            $inc : {
              stocknumber : + item[i].quantity
            }
          })
      }

    }).then(()=>{
      resolve()
    })
  
  }),

  getOrderPayment : ((orderId)=> {
    console.log(orderId);

    return new Promise(async(resolve, reject)=> {
      let method = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
      resolve(method)
    })
  }),

  getUserEditAddress : ((userId, addressId) =>{
    console.log(addressId);

    return new Promise(async(resolve, reject)=> {
      let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
        {
          $match: {
            _id:ObjectId(userId)
          }
        },
        {
          $unwind :'$Addresses'
        },
        {
          $match : {
            'Addresses.addressId' : ObjectId(addressId)
          }
        },
        {
          $project : {
            Addresses : 1,
            _id: 0
          }
        }

      ]).toArray()
      console.log(address,"[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[addreas]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
      resolve(address)
    })
  }),

  updateEditedAddress : (userId, addressId, address) => {
console.log( addressId,"00000000000000000000000000000000000");
    return new Promise(async(resolve, reject) => {
      let updatedAddress = await db.get().collection(collection.USER_COLLECTION).updateOne({
        _id: ObjectId(userId),
        'Addresses.addressId': ObjectId(addressId)
      },
      {
        $set: {
          "Addresses.$.name": address.name,
          "Addresses.$.address": address.address,
          "Addresses.$.town": address.town,
          "Addresses.$.pincode": address.pincode,
          "Addresses.$.mobile": address.mobile,
          "Addresses.$.email": address.email,
        }
      })
      
      console.log(updatedAddress, " pppppppppppppppppppppppppppppppppppppppppppppppppp");
      resolve(updatedAddress)
    })
  },

  getAllAddresses : ((userId)=>{
    return new Promise(async(resolve, reject) => {
      await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
      .then((response)=>{
        resolve(response)
      })
    })
  }),

  getWalletAmount : (orderId) => {

    return new Promise(async (resolve, reject) => {

        let wallet = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) })
        resolve(wallet)
    })
},

  cancelAfterCreateWallet : ((totalAmount, userId, payment) => {
    if(payment != 'pending') {
      return new Promise(async (resolve, reject) => {

        let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: ObjectId(userId) })
        if (wallet) {

           await db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: ObjectId(userId) },

                [{ $set: { total: { $add: ["$total", totalAmount] } } }]
            ).then(() => {
                resolve()
            })
      
        } else {


            let walletObj = {

                userId: ObjectId(userId),
                total: totalAmount
            }
           await db.get().collection(collection.WALLET_COLLECTION).insertOne(walletObj)
                .then(() => {
                    resolve()
                })

        }
    })
    }
  }),

  getUserWallet : (userId)=>{
    let users = userId
    return new Promise (async (resolve, reject)=>{
      let userWallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({userId:ObjectId(users)})
      console.log(userWallet,"HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
      resolve(userWallet)
    })
  },

  generateWalletOrder: (user, totalAmount) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.get().collection(collection.WALLET_COLLECTION).updateOne(
          { userId: ObjectId(user) },
          {
            $inc: {
              total: -parseInt(totalAmount)
            }
          }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  


};
