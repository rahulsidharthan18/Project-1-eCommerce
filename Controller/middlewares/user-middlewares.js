const { response } = require("express");
const userHelpers = require("../../Model/user-helpers");
const {getUSer}=require('../../Model/user-helpers');


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

      verifyUser:async (req,res,next)=>
    {
        try
        {
            if(req.session.loggedIn)
            {
                
                let user = await getUSer(req.session.users._id)
                console.log(user.isBlocked);
                if(user.isBlocked == false){
                   
                  
                    next()
                  }
                else{

                    req.session.users=null
                   
                    req.session.loggedIn=false

                    res.redirect('/login-page')
                }
              
            }
            else{
                res.redirect('/login-page')
            }
        }
        catch(error)
  {
      res.render('error', { message: error.message, code: 500, layout: 'error-layout' });
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