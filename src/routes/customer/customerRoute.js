const express = require('express');
const customerController = require("../../controllers/customer/customerController.js");
const validateUserToken = require('../../middlewares/validateUserToken.js');


const router = express.Router();


router.get('/login', customerController.login)
router.post('/register', customerController.register)
router.get('/customer-details', validateUserToken, customerController.getUserDetails)
router.post('/add-customer-address', validateUserToken, customerController.addCustomerAddress)
router.get('/get-customer-all-orders', validateUserToken, customerController.getCustomerAllOrders)
router.put('/update-customer', validateUserToken, customerController.updateCustomer)
router.put('/changePassword', validateUserToken, customerController.changePassword)

module.exports = router;