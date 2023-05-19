const MongoClient = require("mongodb").MongoClient
const state = {
    db: null
}

module.exports.connect = function (done) {
    const url = "mongodb+srv://rahulsidharthan18:5LBhjaNiGrO818eN@cluster0.2l5wqgs.mongodb.net/?retryWrites=true&w=majority"
    const dbname = 'userdata'

    MongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
    })
    done()
}

module.exports.get = function () {
    return state.db
}