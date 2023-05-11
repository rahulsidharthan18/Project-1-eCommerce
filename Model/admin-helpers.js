var db = require("../dbconfig/connection");
var collection = require("../dbconfig/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { reject } = require("bcrypt/promises");
const { response } = require("express");
var moment = require("moment");

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
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(blockUserId) },
          {
            $set: { isblocked: true },
          }
        );
    }).then((response) => {
      resolve();
    });
  },

  //------------------------------to block a user----------------------------//

  //------------------------------to unblock a user--------------------------//
  unblockUser: (unblockUserId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(unblockUserId) },
          {
            $set: { isblocked: false },
          }
        );
    }).then((response) => {
      resolve();
    });
  },

  //------------------------------to unblock a user--------------------------//

  getOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({date: -1})
        .toArray();
      resolve(orders);
      console.log(orders,"jjjjjjjjjjkkkkkkkkkkkkkkk");
    });
  },

  getProductsOrdermanagement: (orderId) => {
    console.log(orderId, "orderidllllllllllllllllllllllllllllllllllll");
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
    });
  },

  cancelCurrentOrders: (orderId, status) => {
    return new Promise((resolve, reject) => {
      if (status == "placed" || status == "pending") {
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

  addCoupons: (couponId) => {
    const mStartdate = moment(couponId.startdate);
    const mEnddate = moment(couponId.enddate);
    const startFormatDate = mStartdate.format("DD MMM YYYY");
    const endFormatDate = mEnddate.format("DD MMM YYYY");
    console.log(endFormatDate, startFormatDate, "plplplplplplplplplplplplp");

    couponId.startdate = startFormatDate;
    couponId.enddate = endFormatDate;
    couponId.minvalue = Number(couponId.minvalue);
    couponId.maxvalue = Number(couponId.maxvalue);
    couponId.discount = Number(couponId.discount);

    return new Promise(async (resolve, reject) => {
      var item = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .insertOne(couponId);
      // .then(()=>{
      if (item) {
        id = item.insertedId;
        resolve(id);
      } else {
        reject();
      }
    });
    // })
  },

  findCoupons: () => {
    return new Promise(async (resolve, reject) => {
      let coupons = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find()
        .toArray();
      resolve(coupons);
    });
  },

  deleteCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .deleteOne({ _id: ObjectId(couponId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  findCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ _id: ObjectId(couponId) })
        .then((product) => {
          resolve(product);
        });
    });
  },

  updateCoupon: (couponId, couponDetails) => {
    console.log(
      couponDetails,
      "ccccccccccccccccccccccccccccc//////////////////////////"
    );
    return new Promise(async (resolve, reject) => {
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
        });
    });
  },

  updateOrderStatus : ((data)=>{
    let orderId = data.id;
    let statusValue = data.value

    return new Promise (async(resolve ,reject)=> {
      let updatedStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : ObjectId(orderId)}, {
        $set : {
          "status" : statusValue
        }
      }).then((response)=> {
        resolve(response)
      })
    })
  }),

  getSaleOrders : (()=>{
    const date = moment(new Date())
    const newDate = date.format("DD MMM YYYY")
    console.log(newDate, "DD MMM YYYY");
    let delivered = "delivered"
    return new Promise(async(resolve, reject)=>{
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({status:delivered}).toArray()
      console.log(orders,"{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
      resolve(orders)
    })
  }),

//   todayTotalSales: (()=>{
//     const date = moment(new Date());
//     // const startOfDay = moment(date).startOf('day').format("DD MMM YYYY");
//     // const endOfDay = moment(date).endOf('day').format("DD MMM YYYY");
//         // console.log(startOfDay, endOfDay);

//     const newDate = date.format("DD MMM YYYY");

//     console.log(newDate, "DD MMM YYYY");
//     return new Promise(async(resolve, reject)=>{
//         let totalOrders = await db.get().collection(collection.ORDER_COLLECTION)
//             .countDocuments({
//                 status: "delivered",
//                 // createdAt: { $eq : "newDate" }
//             });
//         console.log(totalOrders,"{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{mm}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
//         resolve(totalOrders);
//     });
// }),

todayTotalSales: (()=>{
  const date = moment(new Date());
  const newDate = date.format("DD MMM YYYY");
  return new Promise(async(resolve, reject)=>{
      let totalOrders = await db.get().collection(collection.ORDER_COLLECTION)
          .countDocuments({
              status: "delivered",
              "date": newDate
          });
      resolve(totalOrders);
  });
}),

monthlyTotalSales: (() => {
  const date = moment(new Date());
  const startOfMonth = moment(date).startOf('month').format("DD MM YYYY");
  const endOfMonth = moment(date).endOf('month').format("DD MM YYYY");

  return new Promise(async (resolve, reject) => {
    let totalOrders = await db.get().collection(collection.ORDER_COLLECTION)
      .countDocuments({
        status: "delivered",
        "date": {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

    console.log(totalOrders, "Count of Total Orders this month");
    resolve(totalOrders);
  });
}),

yearlyTotalSales: (() => {
  const date = moment(new Date());
  const startOfYear = moment(date).startOf('year').format("DD MMM YYYY");
const endOfYear = moment(date).endOf('year').format("DD MMM YYYY");


  return new Promise(async (resolve, reject) => {
    let totalOrders = await db.get().collection(collection.ORDER_COLLECTION)
      .countDocuments({
        status: "delivered",
        "date": {
          $gte: startOfYear,
          $lte: endOfYear
        }
      });

    console.log(totalOrders, "Count of Total Orders this year");
    resolve(totalOrders);
  });
})




}
