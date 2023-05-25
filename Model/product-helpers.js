var db = require("../dbconfig/connection");
var collection = require("../dbconfig/collection");
const { response } = require("express");
// const { ObjectId } = require('mongodb');
const { ObjectID } = require("bson");
const { reject } = require("bcrypt/promises");
var ObjectId = require("mongodb").ObjectID;

module.exports = {
  addProduct: (product) => {
    product.stock = true;
    product.stocknumber = parseInt(product.stocknumber);
    product.price = parseInt(product.price);
  
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .insertOne(product)
          .then((item) => {
            if (item) {
              id = item.insertedId;
              resolve(id);
            } else {
              reject();
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  //----------------------------admin get all products-------------------------//

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .toArray();
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
  },
  

  //----------------------------admin get all products end-------------------//

  getAllProductDescription: (prodId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: ObjectId(prodId) });
        resolve(products);
      } catch (error) {
        console.error('Error occurred while fetching product description:', error);
        reject(error);
      }
    });
  },
  

  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .deleteOne({ _id: ObjectId(proId) })
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: ObjectId(proId) })
          .then((product) => {
            resolve(product);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  updateProduct: (proId, proDetails) => {
    console.log(proId, proDetails, "heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: ObjectID(proId) },
            {
              $set: {
                brand: proDetails.brand,
                model: proDetails.model,
                category: proDetails.category,
                description: proDetails.description,
                color: proDetails.color,
                dateofpublish: proDetails.dateofpublish,
                price: proDetails.price,
              },
            }
          )
          .then((response) => {
            resolve();
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  

  addProductCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      console.log(category, "ooooooooooooooooooopppppppppppppppppp");
      let unique = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find({ categoryName: category.categoryName })
        .toArray();
      console.log(unique, "[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]");
      if (unique.length > 0 && unique[0].categoryName) {
        reject("Category already exists");
      } else {
        let item = await db
          .get()
          .collection(collection.CATEGORY_COLLECTION)
          .insertOne(category);
        if (item) {
          console.log(item.insertedId);
          id = item.insertedId;
          resolve(id);
        } else {
          reject();
        }
      }
    });
    // .catch((err) => {
    // })
  },

  getAllCategorys: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let categories = await db
          .get()
          .collection(collection.CATEGORY_COLLECTION)
          .find()
          .toArray();
        resolve(categories);
      } catch (error) {
        reject(error);
      }
    });
  },

  getCategoryDetails: (cateId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: ObjectID(cateId) })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  updateCategory: (catId, bodyId) => {
    return new Promise((resolve, reject) => {
      console.log(bodyId, "/////////////////////////////////////////////////////////////////////////");
      console.log(catId, "ggggggggggggggghhhhhhhhhhhh");
      try {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .updateOne(
            { _id: ObjectID(catId) },
            {
              $set: {
                categoryName: bodyId.categoryName,
              },
            }
          )
          .then((response) => {
            console.log(response + "{{{{{{{{{{}}}}}}}}}[[[[[]]]]]}");
            resolve();
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  
deleteCategory: (catId) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.CATEGORY_COLLECTION)
      .deleteOne({ _id: ObjectID(catId) })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
},

  getCategoryDropdown: () => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .find()
          .toArray()
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  addCategoryOfferAmount: (body) => {
    console.log(body, "888888888888888888888");
    let catName = body.catName;
    body.discount = parseInt(body.discount);
    let discount = body.discount;
  
    return new Promise(async (resolve, reject) => {
      try {
        var offers = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .aggregate([
            {
              $match: { category: catName },
            },
            {
              $project: { price: 1 },
            },
  
            {
              $addFields: {
                offer: {
                  $subtract: [
                    "$price",
                    { $divide: [{ $multiply: ["$price", discount] }, 100] },
                  ],
                },
              },
            },
          ])
          .toArray();
        console.log(offers);
        for (let i = 0; i < offers.length; i++) {
          let element = offers[i];
          await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateMany(
              { _id: element._id },
              {
                $set: {
                  catOffer: element.offer,
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
  

  addProductOfferAmount: (body) => {
    console.log(body);
    let proModel = body.proModel;
    body.discount = parseInt(body.discount);
    let discount = body.discount;
  
    return new Promise(async (resolve, reject) => {
      try {
        var offers = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .aggregate([
            {
              $match: { _id: ObjectId(body.proId) },
            },
            {
              $project: { price: 1 },
            },
            {
              $addFields: {
                offer: {
                  $subtract: [
                    "$price",
                    { $divide: [{ $multiply: ["$price", discount] }, 100] },
                  ],
                },
              },
            },
          ])
          .toArray();
        console.log(offers);
        for (let i = 0; i < offers.length; i++) {
          let element = offers[i];
          await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateMany(
              { _id: ObjectId(body.proId) },
              {
                $set: {
                  proOffer: element.offer,
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

  getProductOffers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await db
          .get()
          .collection(collection.PRODUCT_OFFER_COLLECTION)
          .find()
          .toArray();
        console.log(response, "lllllllllllkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
        resolve(response);
      } catch (error) {
        // Handle the error here
        console.error("Error retrieving product offers:", error);
        reject(error);
      }
    });
  },
  

  getCategoryOffers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await db
          .get()
          .collection(collection.CATEGORY_OFFER_COLLECTION)
          .find()
          .toArray();
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },  

  deleteProOffer: (prodId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let deleted = await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).deleteOne({ proId: prodId });
      resolve(deleted);
    } catch (error) {
      reject(error);
    }
  });
},

deleteOfferFromProduct: (prodId) => {
  console.log(prodId, "999999999999999999999999999999999999999[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]");
  return new Promise(async (resolve, reject) => {
    try {
      let deleted = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
        { _id: ObjectId(prodId) },
        {
          $unset: {
            proOffer: 1
          }
        }
      );
      resolve(deleted);
    } catch (error) {
      reject(error);
    }
  });
},


};
