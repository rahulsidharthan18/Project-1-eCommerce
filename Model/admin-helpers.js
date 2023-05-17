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
    couponId.startdate = new Date(couponId.startdate)
    couponId.enddate = new Date(couponId.enddate);
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
    let delivered = "delivered"
    return new Promise(async(resolve, reject)=>{
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({status:delivered}).toArray()
      console.log(orders,"{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
      resolve(orders)
    })
  }),

todayTotalSales: (()=>{
  return new Promise(async(resolve, reject)=>{
    let currentDate = new Date()
      let totalOrders = await db.get().collection(collection.ORDER_COLLECTION)
          .find({
              status: "delivered",
              $expr: {
                $eq: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, { $dateToString: { format: "%Y-%m-%d", date: currentDate } }]
              }
          }).toArray()
      resolve(totalOrders.length);
  });
}),

monthlyTotalSales: (() => {
  const date = new Date();
const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return new Promise(async (resolve, reject) => {
    let totalOrders = await db.get().collection(collection.ORDER_COLLECTION)
      .countDocuments({
        status: "delivered",
        "date": {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

    resolve(totalOrders);
  });
}),

yearlyTotalSales: (() => {
  const date = new Date();
const startOfYear = new Date(date.getFullYear(), 0, 1);
const endOfYear = new Date(date.getFullYear(), 11, 31);

  return new Promise(async (resolve, reject) => {
    let totalOrders = await db.get().collection(collection.ORDER_COLLECTION)
      .countDocuments({
        status: "delivered",
        "date": {
          $gte: startOfYear,
          $lte: endOfYear
        }
      });

    resolve(totalOrders);
  });
}),

todayTotalRevenue : (()=> {
  let currentDate = new Date()
  console.log(currentDate,"llll");

  return new Promise (async(resolve, reject) => {
    let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match : {
          status:"delivered",
          $expr: {
            $eq: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, { $dateToString: { format: "%Y-%m-%d", date: currentDate } }]
          }
      }
    },
    {
      $group:
      {
      _id: null,
      totalRevenue : {
        $sum : '$totalPrice'
      }
    }}
    ]).toArray()
    console.log(total,"kokoko");
    resolve(total)
  })
}),

monthlyTotalRevenue: (()=> {
  let date = new Date()
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return new Promise (async(resolve, reject) => {
    let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match : {
          status:"delivered",
          "date": {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        } 
      },
      {
        $group:
        {
          _id: null,
          totalRevenue : {
            $sum : '$totalPrice'
          }
        }
      }
    ]).toArray()

    // console.log(total,"tototot");

    resolve(total)
  })
}),

yearlyTotalRevenue : (()=> {
  const date = new Date();
const startOfYear = new Date(date.getFullYear(), 0, 1);
const endOfYear = new Date(date.getFullYear(), 11, 31);

  return new Promise (async(resolve, reject) => {
    let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match : {
          status:"delivered",
          "date": {
            $gte: startOfYear,
            $lte: endOfYear
          }
        } 
      },
      {
        $group:
        {
          _id: null,
          totalRevenue : {
            $sum : '$totalPrice'
          }
        }
      }
    ]).toArray()

    // console.log(total,"tototot");

    resolve(total)
  })
}),

addCategoryPercentage : ((body)=> {
  body.discount = parseInt(body.discount)
  return new Promise(async(resolve, reject)=> {
   let category =  await db.get().collection(collection.CATEGORY_OFFER_COLLECTION).findOne({catId: body.catId})
   if(category) {
    let updateOffer =  await db.get().collection(collection.CATEGORY_OFFER_COLLECTION).updateOne({catId: body.catId},
      {
        $set : {
          discount: body.discount
        }
      })
    resolve(updateOffer)
   }else{
    let addoffer = await db.get().collection(collection.CATEGORY_OFFER_COLLECTION).insertOne(body)
    resolve(addoffer)
   }

  })
}),

addProductPercentage : (body)=>{
  body.discount = parseInt(body.discount)
  return new Promise(async (resolve, reject)=>{
    let product = await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).findOne({proModel : body.proModel})
console.log(product);
    if(product) {
      let updateOffer =  await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).updateOne({proModel : body.proModel},
        {
          $set : {
            discount: body.discount
          }
        })
        resolve(updateOffer)

    } else {

      let addoffer = await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).insertOne(body)
      resolve(addoffer)
    }
  })
},

getDashboardChart : (()=>{

  return new Promise(async (resolve, reject) => {
    let data = {}

    data.cod = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({paymentmethod: 'COD'})
    data.razorpay = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({paymentmethod: 'razorpay'})
    data.online = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({paymentmethod: 'razorpay'})
  
    data.placed = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status: "placed"})
    data.pending = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status: "pending"})
    data.delivered = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status: "delivered"})
    data.cancelled = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status: "cancelled"})
    data.returned = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status: "returned"})
  
    console.log(data.cod,"cod");
    console.log(data.razorpay,"razorpay");
    console.log(data.online,"online");
    console.log(data.placed,"placed");
    console.log(data.pending,"pending");
    console.log(data.delivered,"delivered");
    console.log(data.cancelled,"cancelled");
    console.log(data.returned,"returned");
    
    resolve(data)
  })
})


}
