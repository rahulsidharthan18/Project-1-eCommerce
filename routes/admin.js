var express = require('express');
var router = express.Router();

const { adminLoginpage, loginAdmin, adminAlluser, productsAdmin, getAllUsers, adminBlockUser, adminUnBlockUser, addProducts, addProductsSubmit, 
    deleteProductAction, editProductAction,editProductSubmit, dashboardAdmin, editCancelAdmin, addCategory, addCategorySubmit, allCategory ,
    editCategory ,deleteCategory ,editCategorySubmit, signoutAdmin, orderManagement, viewProductsOrder, cancelOrderManagement } = require('../Controller/admin-controller');
const { nocache, loginRedirect } = require('../Controller/middlewares/admin-middlewares');


router.get('/', nocache, loginRedirect, adminLoginpage);
router.post('/login-action', loginAdmin);
// router.use(verifyLogin)
router.get('/alluser', adminAlluser, getAllUsers);
router.get('/allProducts', productsAdmin);
router.get('/blockUser', adminBlockUser);
router.get('/unBlockUser', adminUnBlockUser);
router.get('/addproducts', addProducts);
router.post('/addProduct-submit', addProductsSubmit);
router.get('/delete-product/:id', deleteProductAction);
router.get('/edit-product/:id', editProductAction);
router.post('/editProduct-submit/:id', editProductSubmit);
router.get('/dashboard', dashboardAdmin);
router.get('/editCancel', editCancelAdmin);
router.get('/addcategory', addCategory);
router.post('/add-categorysubmit', addCategorySubmit);
router.get('/allcategory', allCategory);
router.get('/edit-category/:id' ,editCategory);
router.get('/delete-category/:id',deleteCategory);
router.post('/edit-category-submit' ,editCategorySubmit);
router.get('/signOut-Admin' ,signoutAdmin);
router.get('/order-management', orderManagement);
router.get('/products-ordermanagement/:id', viewProductsOrder);
router.post('/cancel-ordermanagement/:id', cancelOrderManagement)


module.exports = router;
