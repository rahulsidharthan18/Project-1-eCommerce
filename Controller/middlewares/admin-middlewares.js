
module.exports = {
    sessionCheck : (req,res,next)=>{
        if (req.session.admin){
            next();
        }else{
            res.redirect('/admin');
        }
    },

    loginRedirect : (req,res,next)=>{
        
        if(!req.session.admin){
            req.session.adminloggedIn = false;
        }
        if(req.session.admin){
            res.render('admin/admin-homepage', { layout: 'admin-layout', admin: true });
        }else{
            next();
        }
    },

     nocache : (req, res, next) => {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
      }
}