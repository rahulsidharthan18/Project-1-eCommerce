var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports = {
    doadminLoged: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })

            if (admin) {

                bcrypt.compare(adminData.password, admin.password).then((status) => {

                    if (status) {
                        response.admin = admin
                        response.status = true
                        resolve(response);
                    } else {
                        console.log('Login failed');
                        reject({ status: false })
                    }
                }).catch(() => {
                    reject(error)
                })
            } else {
                console.log('Login failed');
                reject({ status: false })
            }
        })
    },

    //------------------------------to block a user-------------------------------------
    blockUser: (blockUserId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(blockUserId) },
                {
                    $set: { isblocked: true }
                })
        }).then((response) => {
            resolve()
        })
    },
    //-----------------------------To unblock a user----------------------------------
    unblockUser: (unblockUserId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(unblockUserId) },
                {
                    $set: { isblocked: false }
                })
        }).then((response) => {
            resolve()
        })
    },

    getOrders : ()=>{
        return new Promise(async(resolve,reject)=>{
            let orders =await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders);
        })
    },

    getProductsOrdermanagement : (orderId)=>{
        console.log(orderId,"orderidllllllllllllllllllllllllllllllllllll");
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

    cancelCurrentOrders : (orderId, status)=>{
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
    }



}

