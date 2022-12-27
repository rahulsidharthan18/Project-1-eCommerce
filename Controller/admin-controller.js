const { doadminLoged ,blockUser ,unblockUser} = require('../Model/admin-helpers')
const { getAllUser } = require('../Model/user-helpers')

module.exports = {
    adminLoginpage(req, res) {
    res.render('admin/admin-login', { layout: 'admin-layout' });
    },
    
    loginAdmin(req, res) {
                doadminLoged(req.body).then((response) => {
                    console.log(response);
                    req.session.adminloggedIn = true;
                    req.session.admin= response;
            res.render('admin/admin-homepage', { layout: 'admin-layout', admin: true });
        }).catch((error) => {
            res.render('admin/admin-login', { error: 'Invalid login details' })
        })
    },

    adminAlluser(req, res) {
       getAllUser().then((AllUsers) => {
            
            res.render('admin/all-users', { layout: 'admin-layout', AllUsers, admin: true })
        })
    },

    categoryAdmin(req,res){
        res.render('admin/all-category', {layout: 'admin-layout',admin:true});
    },

    ordersAdmin(req,res){
        res.render('admin/all-products', {layout: 'admin-layout',admin:true});
    },

    getAllUsers: (req, res) => {
        userHelpers.getAllUsers().then((AllUsers) => {
            res.render('admin/all-users', { layout: 'admin-layout', AllUsers, admin: true })
        })
    },

    adminBlockUser: (req, res) => {
        let blockUserId = req.query.id
        blockUser(blockUserId)
        res.redirect('/admin/alluser')
    },
    //UNBLOCK USER
    adminUnBlockUser: (req, res) => {
        let unblockUserId = req.query.id
        unblockUser(unblockUserId)
        res.redirect('/admin/alluser')
    }

}