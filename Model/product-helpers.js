var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const { response } = require('express')
// const { ObjectId } = require('mongodb');
const { ObjectID } = require('bson')
var ObjectId = require('mongodb').ObjectID

module.exports = {

    addProduct(product) {
        product.stock = true
        product.stocknumber=parseInt(product.stocknumber)
        product.price=parseInt(product.price)
        
        return new Promise(async (resolve, reject) => {
            var item = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)

            if (item) {
                id = item.insertedId
                resolve(id)
            } else {
                reject()
            }
        }).catch((err) => {
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    getAllProductDescription: (prodId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(prodId) })
            resolve(products)
        })
    },

    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },

    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },

    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: ObjectID(proId) }, {
                    $set: {
                        brand: proDetails.brand,
                        model: proDetails.model,
                        category: proDetails.category,
                        description: proDetails.description,
                        color: proDetails.color,
                        dateofpublish: proDetails.dateofpublish,
                        price: proDetails.price
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },

    addProductCategory: (category) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne( category )

            if (item) {
                id = item.insertedId
                resolve(id)
            } else {
                reject()
            }
        }).catch((err) => {
        })


    },

    getAllCategorys: () => {
        return new Promise(async (resolve, reject) => {
            let categorys = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categorys)
        })
    },

    getCategoryDetails: (cateId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectID(cateId)}).then((response)=>{
                resolve(response)
            })
        })

    },

    updateCategory: (catId,bodyId)=>{
        return new Promise((resolve,reject)=>{
            console.log(bodyId,'/////////////////////////////////////////////////////////////////////////');
            console.log(catId,'ggggggggggggggghhhhhhhhhhhh');
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:ObjectID(catId)},{$set:{
                categoryName : bodyId.categoryName
            }}).then((response)=>{
                console.log(response+"{{{{{{{{{{}}}}}}}}}[[[[[]]]]]}");
                resolve()
            })
        })

        
},

    deleteCategory: (catId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id:ObjectID(catId) }).then((response) => {
                resolve(response)
            })
        })
    },

    getCategoryDropdown : ()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((response)=>{
                resolve(response)
            })
        })
    }

   

}