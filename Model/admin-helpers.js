var db = require("../dbconfig/connection");
var collection = require("../dbconfig/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { reject } = require("bcrypt/promises");
const { response } = require("express");

module.exports = {

  //------------------------------admin login-----------------------------//

  doadminLoged: (adminData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let loginStatus = false;
        let response = {};
        let admin = await db
          .get()
          .collection(collection.ADMIN_COLLECTION)
          .findOne({ email: adminData.email });
  
        if (admin) {
          bcrypt
            .compare(adminData.password, admin.password)
            .then((status) => {
              if (status) {
                response.admin = admin;
                response.status = true;
                resolve(response);
              } else {
                console.log("Login failed");
                reject({ status: false });
              }
            })
            .catch(() => {
              reject({ status: false });
            });
        } else {
          console.log("Login failed");
          reject({ status: false });
        }
      } catch (error) {
        console.log(error);
        reject({ status: false });
      }
    });
  },

  //------------------------------admin login end-----------------------------//

  //------------------------------to block a user----------------------------//
  blockUser: (blockUserId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(blockUserId) },
            {
              $set: { isblocked: true },
            }
          )
          .then(() => {
            resolve();
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  //------------------------------to block a user----------------------------//

  //------------------------------to unblock a user--------------------------//
  unblockUser: (unblockUserId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(unblockUserId) },
            {
              $set: { isblocked: false },
            }
          )
          .then(() => {
            resolve();
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  //------------------------------to unblock a user--------------------------//

  getOrders: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find()
          .sort({ date: -1 })
          .toArray();
        resolve(orders);
        console.log(orders, "jjjjjjjjjjkkkkkkkkkkkkkkk");
      } catch (error) {
        // Handle the exception
        console.error("An error occurred while fetching orders:", error);
        reject(error);
      }
    });
  },

  getProductsOrdermanagement: (orderId) => {
    console.log(orderId, "orderidllllllllllllllllllllllllllllllllllll");
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
        resolve(orderItems);
      } catch (error) {
        // Handle the exception
        console.error("An error occurred while fetching products for order:", error);
        reject(error);
      }
    });
  },

  cancelCurrentOrders: (orderId, status) => {
    return new Promise((resolve, reject) => {
      if (status == "placed" || status == "pending") {
        status = "cancelled";
      }
  
      try {
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
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },  

  addCoupons: (couponId) => {
    console.log(couponId, " couuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
    couponId.startdate = new Date(couponId.startdate);
    couponId.enddate = new Date(couponId.enddate);
    couponId.minvalue = Number(couponId.minvalue);
    couponId.maxvalue = Number(couponId.maxvalue);
    couponId.discount = Number(couponId.discount);
  
    return new Promise(async (resolve, reject) => {
      try {
        var item = await db
          .get()
          .collection(collection.COUPON_COLLECTION)
          .insertOne(couponId);
        
        if (item) {
          id = item.insertedId;
          resolve(id);
        } else {
          reject(new Error('Failed to insert coupon'));
        }
      } catch (error) {
        reject(error);
      }
    });
  },  

  findCoupons: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let coupons = await db
          .get()
          .collection(collection.COUPON_COLLECTION)
          .find()
          .toArray();
        resolve(coupons);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .deleteOne({ _id: ObjectId(couponId) })
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  findCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ _id: ObjectId(couponId) })
        .then((coupon) => {
          resolve(coupon);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  updateCoupon: (couponId, couponDetails) => {
    console.log(
      couponDetails,
      "ccccccccccccccccccccccccccccc//////////////////////////"
    );
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: ObjectId(couponId) },
          {
            $set: {
              name: couponDetails.name,
              code: couponDetails.code,
              discount: couponDetails.discount,
              startdate: couponDetails.startdate,
              enddate: couponDetails.enddate,
              minvalue: couponDetails.minvalue,
              maxvalue: couponDetails.maxvalue,
            },
          }
        )
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },  

  updateOrderStatus: (data) => {
    let orderId = data.id;
    let statusValue = data.value;
  
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: statusValue,
            },
          }
        )
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },  

  getSaleOrders: () => {
    let delivered = "delivered";
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({ status: delivered })
          .toArray();
        console.log(orders, "{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },
  

  todayTotalSales: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let currentDate = new Date();
        let totalOrders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({
            status: "delivered",
            $expr: {
              $eq: [
                { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                { $dateToString: { format: "%Y-%m-%d", date: currentDate } },
              ],
            },
          })
          .toArray();
        resolve(totalOrders.length);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  monthlyTotalSales: () => {
    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
    return new Promise(async (resolve, reject) => {
      try {
        let totalOrders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .countDocuments({
            status: "delivered",
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          });
  
        resolve(totalOrders);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  yearlyTotalSales: () => {
    const date = new Date();
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const endOfYear = new Date(date.getFullYear(), 11, 31);
  
    return new Promise(async (resolve, reject) => {
      try {
        let totalOrders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .countDocuments({
            status: "delivered",
            date: {
              $gte: startOfYear,
              $lte: endOfYear,
            },
          });
  
        resolve(totalOrders);
      } catch (error) {
        reject(error);
      }
    });
  },

  todayTotalRevenue: () => {
    let currentDate = new Date();
    console.log(currentDate, "llll");
  
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: "delivered",
                $expr: {
                  $eq: [
                    { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    { $dateToString: { format: "%Y-%m-%d", date: currentDate } },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: {
                  $sum: "$totalPrice",
                },
              },
            },
          ])
          .toArray();
        console.log(total, "kokoko");
        resolve(total);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  monthlyTotalRevenue: () => {
    let date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: "delivered",
                date: {
                  $gte: startOfMonth,
                  $lte: endOfMonth,
                },
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: {
                  $sum: "$totalPrice",
                },
              },
            },
          ])
          .toArray();
  
        // console.log(total,"tototot");
  
        resolve(total);
      } catch (error) {
        reject(error);
      }
    });
  },

  yearlyTotalRevenue: (() => {
    const date = new Date();
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const endOfYear = new Date(date.getFullYear(), 11, 31);
  
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              status: "delivered",
              "date": {
                $gte: startOfYear,
                $lte: endOfYear
              }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: '$totalPrice'
              }
            }
          }
        ]).toArray();
  
        resolve(total);
      } catch (error) {
        reject(error);
      }
    });
  }),
  

  addCategoryPercentage: (body) => {
    body.discount = parseInt(body.discount);
    return new Promise(async (resolve, reject) => {
      try {
        let category = await db
          .get()
          .collection(collection.CATEGORY_OFFER_COLLECTION)
          .findOne({ catId: body.catId });
  
        if (category) {
          let updateOffer = await db
            .get()
            .collection(collection.CATEGORY_OFFER_COLLECTION)
            .updateOne(
              { catId: body.catId },
              {
                $set: {
                  discount: body.discount,
                },
              }
            );
          resolve(updateOffer);
        } else {
          let addoffer = await db
            .get()
            .collection(collection.CATEGORY_OFFER_COLLECTION)
            .insertOne(body);
          resolve(addoffer);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  

  addProductPercentage: (body) => {
    body.discount = parseInt(body.discount);
    return new Promise(async (resolve, reject) => {
      try {
        let product = await db
          .get()
          .collection(collection.PRODUCT_OFFER_COLLECTION)
          .findOne({ proModel: body.proModel });
        console.log(product);
  
        if (product) {
          let updateOffer = await db
            .get()
            .collection(collection.PRODUCT_OFFER_COLLECTION)
            .updateOne(
              { proModel: body.proModel },
              {
                $set: {
                  discount: body.discount,
                },
              }
            );
          resolve(updateOffer);
        } else {
          let addoffer = await db
            .get()
            .collection(collection.PRODUCT_OFFER_COLLECTION)
            .insertOne(body);
          resolve(addoffer);
        }
      } catch (error) {
        reject(error);
      }
    });
  },  

getDashboardChart: () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};

      data.cod = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ paymentmethod: "COD" });
      data.razorpay = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ paymentmethod: "razorpay" });
      data.online = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ paymentmethod: "razorpay" });

      data.placed = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ status: "placed" });
      data.pending = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ status: "pending" });
      data.delivered = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ status: "delivered" });
      data.cancelled = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ status: "cancelled" });
      data.returned = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ status: "returned" });

      console.log(data.cod, "cod");
      console.log(data.razorpay, "razorpay");
      console.log(data.online, "online");
      console.log(data.placed, "placed");
      console.log(data.pending, "pending");
      console.log(data.delivered, "delivered");
      console.log(data.cancelled, "cancelled");
      console.log(data.returned, "returned");

      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
},


// salesReportFilter: (body) => {
//   const startDate = new Date(body.startDate);
//   const endDate = new Date(body.endDate);

//   console.log(startDate, endDate, "hhhhhhhhhhhhhhhhhhhhhhhhhhhse");

//   return new Promise(async (resolve, reject) => {
//     let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
//       {
//         $match: {
//           status: "delivered",
//           $expr: {
//             $and: [
//               { $gte: ["$date", startDate] },
//               { $lte: ["$date", endDate] }
//             ]
//           }
//         }
//       }
//     ]).toArray();

//     console.log(orders, "orderssssssssssssssss");
//     resolve(orders);
//   });
// }

salesReportFilter: (body) => {
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  console.log(startDate, endDate, "hhhhhhhhhhhhhhhhhhhhhhhhhhhse");

  return new Promise(async (resolve, reject) => {
    try {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "delivered",
              $expr: {
                $and: [
                  { $gte: ["$date", startDate] },
                  { $lte: ["$date", endDate] },
                ],
              },
            },
          },
          {
            $sort: { date: -1 }, // Sort by date in descending order (-1) for last order first
          },
        ])
        .toArray();

      console.log(orders, "orderssssssssssssssss");
      resolve(orders);
    } catch (error) {
      reject(error);
    }
  });
},

returnAdminOrder: (orderId, status) => {
  console.log(status, "sttttttttttttttttttt[[[[[[[[[[[]]]]]]]]]]]");
  if (status == 'delivered') {
    status = 'returned';
    console.log(status, "sttttttttttttttttttt");
  }

  return new Promise(async (resolve, reject) => {
    try {
      let response = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: status,
            },
          }
        );
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
},


AdminOrderProductsList: (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) });
      resolve(order.products);
    } catch (error) {
      reject(error);
    }
  });
},

deleteCatOffer: (categoryId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let deleted = await db.get().collection(collection.CATEGORY_OFFER_COLLECTION).deleteOne({ catId: categoryId });
      resolve(deleted);
    } catch (error) {
      reject(error);
    }
  });
},

deleteOfferFromCategory: (categoryId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let toDelete = await db.get().collection(collection.CATEGORY_COLLECTION).find({ _id: ObjectId(categoryId) }).toArray();
      let catName = toDelete[0].categoryName;
      let deleted = await db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
        { category: catName },
        {
          $unset: {
            catOffer: 1
          }
        }
      );
      resolve(deleted);
    } catch (error) {
      reject(error);
    }
  });
},





}
