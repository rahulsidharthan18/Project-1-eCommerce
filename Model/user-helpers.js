var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const bcrypt = require('bcrypt')


module.exports = {
    doSignup: (userData) => {
    
        userData.isblocked=false
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((userData) => {
                resolve(userData)
            })
        })
    },

    doLogin : (userData)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            console.log(user);
            if(user){
                
                 if(user.isblocked){
                    reject({error:"user is blocked"})
                 }else{
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                        if(status){
                            resolve(user)
                        }else{
                            reject({error:"password"})
                        }
    
                    })
                    
                 }
                  

            }else{
                reject({error:"Email"})
            }

 })
},

    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let AllUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(AllUsers)
           
        })
    }
}   