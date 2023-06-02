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
  /******************************* user signup and login ***********************************/

  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        userData.isblocked = false;
        userData.password = await bcrypt.hash(userData.password, 10);
        
        const result = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },

  doEmailPhoneCheck: (userData) => {
    console.log(userData, "[0000000000000000000000000000000000000]");
    return new Promise(async (resolve, reject) => {
      let userWithEmail = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
  
      let userWithPhone = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ phone: userData.phone });
  
      console.log(
        userWithPhone,
        "[00000000000000000000000000000000",
        userWithEmail
      );
  
      if (userWithEmail) {
        console.log("123456");
        reject(new Error("Email already exists"));
      }
  
      if (userWithPhone) {
        console.log("456789");
        reject(new Error("Phone number already exists"));
      }
  
      resolve();
    });
  },
  
  
  

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });

            if (user) {
                if (user.isblocked) {
                    reject({ error: "user is blocked" });
                } else {
                    const status = await bcrypt.compare(userData.password, user.password);

                    if (status) {
                        resolve(user);
                    } else {
                        reject({ error: "Incorrect username or password" });
                    }
                }
            } else {
                reject({ error: "Invalid Email" });
            }
        } catch (error) {
            reject(error);
        }
    });
},

  /******************************* user users ***********************************/

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
  getUSer: (Id) => {
    console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
    return new Promise(async (resolve, reject) => {
        console.log(Id, "id coming here");
        let user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: ObjectId(Id) });
        console.log(user, "MMMMMMMMMMMMMMMMMMMMMMMMMMm");
        resolve(user);
    });
},
  
  /******************************* user number ***********************************/

  findByNumber(num) {
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

  /******************************* user cart ***********************************/

  addToTheCart: (proId, userId) => {
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
    };
  
    return new Promise(async (resolve, reject) => {
      try {
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
          if (proExist != -1) {
            if (product.stocknumber != userCart.products[proExist].quantity) {
              await db
                .get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                  { user: ObjectId(userId), "products.item": ObjectId(proId) },
                  {
                    $inc: { "products.$.quantity": 1 },
                  }
                );
              resolve();
            }else{
              reject({error: "Product limit exceeded"})
            }
          } else {
            await db
              .get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: ObjectId(userId) },
                {
                  $push: { products: proObj },
                }
              );
            resolve();
          }
        } else {
          let cartObj = {
            user: ObjectId(userId),
            products: [proObj],
          };
          await db
            .get()
            .collection(collection.CART_COLLECTION)
            .insertOne(cartObj);
          resolve();
        }
      } catch (error) {
        console.error('Error occurred while adding to cart:', error);
        reject(error);
      }
    });
  },
  
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
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
        
        resolve(cartItems);
      } catch (error) {
        console.error('Error occurred while fetching cart products:', error);
        reject(error);
      }
    });
  },
  

  getCartCount:(async (userId) => {
    try {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
  
      if (cart) {
        count = cart.products.length;
      }
  
      return count;
    } catch (e) {
      console.error(e);
    }
  }),  

  /******************************* user category list ***********************************/

  getCategotyList: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let category = await db
          .get()
          .collection(collection.CATEGORY_COLLECTION)
          .find()
          .toArray();
        resolve(category);
      } catch (error) {
        console.error('Error occurred while retrieving category list:', error);
        reject(error);
      }
    });
  },

  /******************************* user product ***********************************/

  changeCartProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
  
  
    return new Promise(async (resolve, reject) => {
      try {
        let stock = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: ObjectId(details.product) });
        stock = stock.stocknumber;
        if (stock < details.quantity + details.count) {
          reject({ error: "Stock limit Exceeded" });
        } else {
          if (details.count === -1 && details.quantity === 1) {
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
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  },
  

  removeCartProducts: (details) => {
    return new Promise((resolve, reject) => {
    try {
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
    } catch (error) {
    reject(error);
    }
    });
   },
   

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
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
              $set: {
                final: {
                  $switch: {
                    branches: [
                      {
                        case: { $and: [ { $gt: ['$product.proOffer', 0] } ] },
                        then: '$product.proOffer',
                      },
                      {
                          case: { $and: [ { $gt: ['$product.catOffer', 0] } ] },
                          then: '$product.catOffer',
                        },
                      {
                        case: { $and: [ { $gt: ['$product.price', 0] } ] },
                        then: '$product.price',
                      },
                   
                    ],
                    default: '',
                  },
                },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      { $toDouble: "$quantity" },
                      { $toDouble: "$final" },
                    ],
                  },
                },
              },
            },
          ])
          .toArray();
         (total,"PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
        resolve(total[0]?.total);
      } catch (error) {
        console.error('Error occurred while calculating total amount:', error);
        reject(error);
      }
    });
  },

  /******************************* user place order ***********************************/

  placeUserOrder: (order, products, total) => {
  
    return new Promise((resolve, reject) => {
      try {
        if(order.paymentmethod == "COD") {
          var status = order.paymentmethod == "COD" ? "placed" : "pending";
        }
        if(order.paymentmethod == "wallet") {
          var status = order.paymentmethod == "wallet" ? "placed" : "pending";
        }
  
        let orderObj = {
          deliveryDetails: {
            name: order.name,
            mobile: order.mobile,
            address: order.address,
            pincode: order.pincode,
            email: order.email,
            town: order.town,
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
              if (productDetails) {
                let stockQuantity = productDetails.stocknumber;
                let updatedQuantity = stockQuantity - quantity;
                db.get()
                  .collection(collection.PRODUCT_COLLECTION)
                  .updateOne(
                    { _id: ObjectId(productId) },
                    { $set: { stocknumber: updatedQuantity } }
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
            console.error("Error in inserting order:", error);
            throw error;
          });
      } catch (error) {
        console.error("Error in placeUserOrder:", error);
        reject(error);
      }
    });
  },

  /******************************* user cart ***********************************/

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: ObjectId(userId) });
        resolve(cart?.products);
      } catch (error) {
        console.error("Error in getCartProductList:", error);
        throw error;
      }
    });
  },  

  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({ userId: ObjectId(userId) })
          .sort({ date: -1 })
          .toArray();
  
        resolve(orders);
      } catch (error) {
        console.error("Error in getUserOrders:", error);
        throw error;
      }
    });
  },  

  /******************************* user orders ***********************************/

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
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
          console.log(orderItems,"[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
        resolve(orderItems);
      } catch (error) {
        console.error("Error in getOrderProducts:", error);
        reject(error);
      }
    });
  },

   getOrderImgProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderItems = await db
        .get()
.collection(collection.ORDER_COLLECTION)
.aggregate([
  {
    $match: { userId: ObjectId(orderId) },
  },
  {
    $project: {
      products: { $slice: ["$products", 1] }, // Limit products array to 1 element
    },
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
  {
    $sort: { product: -1 } // Sort by products field in descending order
  }
])
.toArray();

        console.log(orderItems,"////////////////////////////////////////////////////////////////////////////////");        
        resolve(orderItems);
      } catch (error) {
        console.error("Error in getOrderProducts:", error);
        reject(error);
      }
    });
  },
  
  getOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let details = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .findOne({ _id: ObjectId(orderId) });
        
        resolve(details.totalPrice);
      } catch (error) {
        console.error("Error in getOrderDetails:", error);
        reject(error);
      }
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
    return new Promise(async (resolve, reject) => {
      try {
        let skipNum = parseInt((pageNum - 1) * limit);
  
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .skip(skipNum)
          .limit(limit)
          .toArray();
  
        resolve(products);
      } catch (error) {
        console.error("Error in totalProductView:", error);
        reject(error);
      }
    });
  },  

  /******************************* user razorpay payment ***********************************/

  generateRazorpay: (orderId, total) => {
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

  /******************************* user address ***********************************/

 addAddressUser: (address, userId) => {
  address.userAddressId = new Date().valueOf();

  return new Promise((resolve, reject) => {
    try {
      db.get()
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
                userAddressId: address.userAddressId,
              },
            },
          }
        )
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error("Error in addAddressUser:", error);
          reject(error);
        });
    } catch (error) {
      console.error("Error in addAddressUser:", error);
      reject(error);
    }
  });
},

  getUserAddress: (userId) => {
    return new Promise((resolve, reject) => {
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

  /******************************* user coupon ***********************************/

  couponManagement: (code, total) => {
  
    const currentDate = new Date();
  
    total = parseInt(total);
    
    return new Promise(async (resolve, reject) => {
      try {
  
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
                  $lte: currentDate,
                },
                enddate: {
                  $gte: currentDate,
                },
              },
            },
            {
              $project: {
                _id: 0,
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
  
  
        if (coupon.length !== 0) {
          resolve(coupon[0]?.offerAmount);
        } else {
          reject(new Error("Invalid coupon"));
        }
      } catch (error) {
        console.error("An error occurred in couponManagement:", error);
        reject(error);
      }
    });
  },  

  /******************************* user category filter ***********************************/

  categoryFilterFind: (categoryName) => {
    let name = categoryName.name;
    return new Promise(async (resolve, reject) => {
      try {
        let result = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ category: name })
          .toArray();
        resolve(result);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  },  

  /******************************* user order cancel and return ***********************************/

  returnOrder: (orderId, status ,reason) => {
    if(status == 'delivered'){
      status = 'returned'
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

  cancelOrder: (orderId, status , reason) => {
    if(status == 'shipped' || status == 'placed'){
      status = 'cancelled'
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

  /******************************* user addresses ***********************************/

  getAllAddress: async (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let address = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) });
        resolve(address.Addresses);
      });
    } catch (error) {
      console.error("Error in getAllAddress:", error);
      throw error;
    }
  },  

  getAddresOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .findOne({ _id: ObjectId(orderId) });
        resolve(address);
      } catch (error) {
        console.error("Error in getAddresOrder:", error);
        reject(error);
      }
    });
  },

  getOneAddressById: (userId, address) => {
    let addressId = parseInt(address);
  
    return new Promise(async (resolve, reject) => {
      try {
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
        ]).toArray();
        resolve(address[0]);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  },    

  getUserEditAddress: (userId, addressId) => {

    return new Promise(async (resolve, reject) => {
      try {
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
            $match: {
              'Addresses.addressId': ObjectId(addressId)
            }
          },
          {
            $project: {
              Addresses: 1,
              _id: 0
            }
          }
        ]).toArray();
        resolve(address);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  },
  
  updateEditedAddress: (userId, addressId, address) => {
    return new Promise(async (resolve, reject) => {
      try {
        let updatedAddress = await db.get().collection(collection.USER_COLLECTION).updateOne(
          {
            _id: ObjectId(userId),
            'Addresses.addressId': ObjectId(addressId)
          },
          {
            $set: {
              'Addresses.$.name': address.name,
              'Addresses.$.address': address.address,
              'Addresses.$.town': address.town,
              'Addresses.$.pincode': address.pincode,
              'Addresses.$.mobile': address.mobile,
              'Addresses.$.email': address.email
            }
          }
        );
  
        resolve(updatedAddress);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  },
  
  getAllAddresses: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) });
        resolve(response);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  },

  /******************************* user product listing ***********************************/

orderProductsList: (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = await db.get().collection(collection.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });

      if (order) {
        resolve(order.products);
      } else {
        reject(new Error('Order not found'));
      }
    } catch (error) {
      reject(error);
    }
  });
},

/******************************* user stock changes ***********************************/

stockIncrementAfterReturn: (item) => {

  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < item.length; i++) {
        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: item[i].prod },
            {
              $inc: {
                stocknumber: +item[i].quantity,
              },
            }
          );
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
},

stockIncrementAfterCancel: (item) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < item.length; i++) {
        await db.get().collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: item[i].prod },
            {
              $inc: {
                stocknumber: +item[i].quantity
              }
            }
          );
      }
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
},

/******************************* user payment status ***********************************/

getOrderPayment: (orderId) => {

  return new Promise(async (resolve, reject) => {
    try {
      let method = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });
      resolve(method);
    } catch (error) {
      console.error("Error in getOrderPayment:", error);
      reject(error);
    }
  });
},

  getWalletAmount: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let wallet = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) });
        resolve(wallet);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  cancelAfterCreateWallet: (totalAmount, userId, payment) => {
    if (payment != 'pending') {
      return new Promise(async (resolve, reject) => {
        try {
          let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: ObjectId(userId) });
          
          if (wallet) {
            await db.get().collection(collection.WALLET_COLLECTION).updateOne(
              { userId: ObjectId(userId) },
              [{ $set: { total: { $add: ["$total", totalAmount] } } }]
            );
            resolve();
          } else {
            let walletObj = {
              userId: ObjectId(userId),
              total: totalAmount
            };
            await db.get().collection(collection.WALLET_COLLECTION).insertOne(walletObj);
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      });
    }
  },  

  /******************************* user wallet ***********************************/

  getUserWallet: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userWallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: ObjectId(userId) });
        resolve(userWallet);
      } catch (error) {
        console.error("Error in getUserWallet:", error);
        throw error;
      }
    });
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
  deleteAddress: (addressId, userId) => {
    console.log(addressId, "pppppppppppppppppppppppppppppppppppppppp");
    console.log(userId._id, "p]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: ObjectId(userId._id) },
            { $pull: { Addresses: { addressId: ObjectId(addressId) } } }
        ).then((response) => {
            resolve(response);
        });
    });
},

displayCoupons : (()=>{
  return new Promise(async(resolve, reject) => {
    let coupons = await db.get().collection(collection.COUPON_COLLECTION).find({}).toArray()
    resolve(coupons)  
  })
})



};
