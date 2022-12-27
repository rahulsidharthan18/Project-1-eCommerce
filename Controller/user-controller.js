const { doSignup, doLogin } = require("../Model/user-helpers")




module.exports = {

    

    loginPage(req, res) {
        res.render('user/login')
    },


    homePage(req, res) {
        res.render('user/homepage', { user: true })
    },


    userSignup(req, res) {
        doSignup(req.body).then((userData) => {
            req.session.loggedIn = true;
            req.session.users = userData;
        })

        res.render('user/homepage', { user: true })

    },


    loginAction(req, res) {
     
        doLogin(req.body).then((user) => {
            
            req.session.loggedIn = true;
            req.session.users = user;
         
            res.render('user/homepage', { user: true })
        }).catch((error) => {
            res.render('user/login', {error:error.error})
        })
    }
}