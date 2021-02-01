var express = require('express');
var router = express.Router();

//require controller
const cragController = require("../Controllers/cragController")
const userController = require("../Controllers/userController")

/* GET home page. */
router.get('/', cragController.homePageFilters);
router.get('/all/:crag', cragController.cragDetail);
router.get('/all', cragController.listAllCrags);

//GET all countries
router.get('/countries',cragController.listAllCountries);
router.get('/countries/:country', cragController.cragsByCountry);

router.post('/results', cragController.searchResults);

//ADMIN routes:
router.get('/admin', userController.isAdmin, cragController.adminPage);
router.get('/admin/*', userController.isAdmin);
router.get('/admin/add', cragController.createCragGet);
router.post('/admin/add', 
    cragController.upload,
    cragController.pushToCloudinary,
    cragController.createCragPost);
router.get('/admin/editRemove', cragController.editRemoveGet);
router.post('/admin/editRemove', cragController.editRemovePost);
router.get('/admin/:cragId/update',cragController.updateCragGet);
router.post('/admin/:cragId/update',
    cragController.upload,
    cragController.pushToCloudinary,
    cragController.updateCragPost);
router.get('/admin/:cragId/delete',cragController.deleteCragGet);
router.post('/admin/:cragId/delete',cragController.deleteCragPost);
router.get('/admin/orders', userController.allOrders);

//User routes
router.get('/sign-up', userController.signUpGet);
router.post('/sign-up', userController.signUpPost, userController.loginPost);
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);
router.get('/logout',userController.logout);
router.get('/confirmation/:data', userController.bookingConfirmation);
router.get('/order-placed/:data', userController.orderPlaced);
router.get('/my-account', userController.myAccount);


module.exports = router;