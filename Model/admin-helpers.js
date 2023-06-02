var db = require("../dbconfig/connection");
var collection = require("../dbconfig/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { reject } = require("bcrypt/promises");
const { response } = require("express");

module.exports = {
  /******************************* admin login***********************************/

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
                reject({ status: false });
              }
            })
            .catch(() => {
              reject({ status: false });
            });
        } else {
          reject({ status: false });
        }
      } catch (error) {
        reject({ status: false });
      }
    });
  },

  /******************************* admin block and unblock***********************************/
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

  /******************************* admin orders***********************************/

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
      } catch (error) {
        // Handle the exception
        console.error("An error occurred while fetching orders:", error);
        reject(error);
      }
    });
  },

  getProductsOrdermanagement: (orderId) => {
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
        console.error(
          "An error occurred while fetching products for order:",
          error
        );
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

  /******************************* admin coupons ***********************************/

  addCoupons: (couponId) => {
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
          reject(new Error("Failed to insert coupon"));
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
          console.log(coupon,"[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]");
          resolve(coupon);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  updateCoupon: (couponId, couponDetails) => {
    console.log(couponId, couponDetails,"[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
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

  /******************************* admin order status ***********************************/

  updateOrderStatus: (data) => {
    currentDate = new Date();
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
              statusDate: currentDate,
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

  /******************************* admin sales***********************************/

  getSaleOrders: () => {
    let delivered = "delivered";
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({ status: delivered })
          .toArray();
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
        currentDate.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison

        let totalOrders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({
            status: "delivered",
            date: {
              $gte: currentDate, // Check if the order date is greater than or equal to the current date
              $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Add one day to the current date and check if the order date is less than it
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

  /******************************* admin revenue ***********************************/

  todayTotalRevenue: () => {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison

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
                  $gte: currentDate, // Check if the order date is greater than or equal to the current date
                  $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Add one day to the current date and check if the order date is less than it
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

        resolve(total);
      } catch (error) {
        reject(error);
      }
    });
  },

  yearlyTotalRevenue: () => {
    const date = new Date();
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const endOfYear = new Date(date.getFullYear(), 11, 31);

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
                  $gte: startOfYear,
                  $lte: endOfYear,
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

        resolve(total);
      } catch (error) {
        reject(error);
      }
    });
  },

  /******************************* admin category offer ***********************************/

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

  /******************************* admin product offer ***********************************/

  addProductPercentage: (body) => {
    body.discount = parseInt(body.discount);
    return new Promise(async (resolve, reject) => {
      try {
        let product = await db
          .get()
          .collection(collection.PRODUCT_OFFER_COLLECTION)
          .findOne({ proModel: body.proModel });

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

  /******************************* admin dashboard ***********************************/

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
        data.wallet = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .countDocuments({ paymentmethod: "wallet" });

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

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  },

  /******************************* admin sales report ***********************************/

  salesReportFilter: (body) => {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

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

        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },

  returnAdminOrder: (orderId, status) => {
    if (status == "delivered") {
      status = "returned";
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
        let order = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .findOne({ _id: ObjectId(orderId) });
        resolve(order.products);
      } catch (error) {
        reject(error);
      }
    });
  },

  /******************************* admin category offer ***********************************/

  deleteCatOffer: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let deleted = await db
          .get()
          .collection(collection.CATEGORY_OFFER_COLLECTION)
          .deleteOne({ catId: categoryId });
        resolve(deleted);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteOfferFromCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let toDelete = await db
          .get()
          .collection(collection.CATEGORY_COLLECTION)
          .find({ _id: ObjectId(categoryId) })
          .toArray();
        let catName = toDelete[0].categoryName;
        let deleted = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateMany(
            { category: catName },
            {
              $unset: {
                catOffer: 1,
              },
            }
          );
        resolve(deleted);
      } catch (error) {
        reject(error);
      }
    });
  },
};
