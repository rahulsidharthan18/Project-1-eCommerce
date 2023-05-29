const { response } = require("express");
const userHelpers = require("../../Model/user-helpers");

module.exports = {
    sessionCheck : (req,res,next)=>{
        if (req.session.users){
            next();
        }else{
           
            res.redirect('/login-page');
        }
    },

    loginRedirect : (req,res,next)=>{
        if(!req.session.users){
            req.session.loggedIn = false;
        }
        if(req.session.users){
            res.redirect('/');
        }else{
            next();
        }
    },

     nocache : (req, res, next) => {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
      },

      verifyLogin : (req,res,next)=>{
        if(req.session.loggedIn){
            next()
        }else{
            res.redirect('/login-page')
        }
      },

      categorySessionCheck : (req,res,next)=>{
        if (req.session.users){
            next();
        }else{
           
           next();
        }
    },

    addCartSessionCheck : (req, res, next) => {
        if (req.session.users) {
          next();
        } else {
          res.json({ redirect: '/login-page' });
        }
      }
      
}