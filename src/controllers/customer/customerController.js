const db = require('../../db/models/index');
const { sendSuccess , sendError } =  require('../../utils/sendResponse');
const Order = db.orders;
const CryptoJS = require('crypto-js');
const Customer = db.customers;
const Addresses = db.addresses;
const jwt = require('jsonwebtoken');


const updateCustomer = async (req, res) => {
    try{
        const customer_id = req.userId;
        const { first_name, last_name, primary_mobile_number, primary_email, username, password, date_of_birth, secondary_mobile_number, secondary_email } = req.body;
        // const customer_id = CryptoJS.AES.decrypt(req.header('customer_id'), process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        const encryptedPass = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();
        if(!customer_id){
            return sendError(res, 400, false, "Customer id is required", null);
        }else if(!first_name || !last_name || !primary_mobile_number || !primary_email || !username || !password || !date_of_birth || !secondary_mobile_number || !secondary_email){
            return sendError(res, 400, false, "All fields are required", null);
        }else if(primary_mobile_number.length !== 10){
            return sendError(res, 400, false, "Primary mobile number must be 10 digits", null);
        }else if(primary_email.length < 8 || primary_email.length > 64){
            return sendError(res, 400, false, "Primary email must be between 8 and 64 characters", null);
        }else if(password.length < 8 || password.length > 64){
            return sendError(res, 400, false, "Password must be between 8 and 64 characters", null);
        }else if(secondary_mobile_number.length !== 10){
            return sendError(res, 400, false, "Secondary mobile number must be 10 digits", null);
        }else if(secondary_email.length < 8 || secondary_email.length > 64){
            return sendError(res, 400, false, "Secondary email must be between 8 and 64 characters", null);
        }else{
            const findCustomer = await Customer.findOne({
                where : {
                    id : customer_id
                }
            });
            if(findCustomer){
                const customer = await Customer.update({
                    first_name : first_name,
                    last_name : last_name,
                    primary_mobile_number : primary_mobile_number,
                    primary_email : primary_email,
                    username : username,
                    password : encryptedPass,
                    date_of_birth : date_of_birth,
                    secondary_mobile_number : secondary_mobile_number,
                    secondary_email : secondary_email
                }, {
                    where : {
                        id : customer_id
                    }
                });
                return sendSuccess(res, 200, true, "Customer updated successfully", customer);
            }else{
                return sendError(res, 400, false, "Customer not found", null);
            }
        }
    }catch(err){
        return sendError(res, 500, false, err.message, null);
    }   
}


// add custmoer address 
const addCustomerAddress = async (req, res) => {
    // add validationss on address
    try{
        const customer_id = req.userId;
        const { address_line_1 , address_line_2 , area , city , state , country , postal_code , landmark } = req.body;

        if(!customer_id || !address_line_1 || !address_line_2 || !area || !city || !state || !country || !postal_code || !landmark){
            return sendError(res, 400, false, "All fields are required");
        }else if(postal_code.length !== 6){
            return sendError(res, 400, false, "Postal code must be 6 digits");
        }else {
            const findCustomer = await Customer.findOne({
                where : {
                    id : customer_id
                }
            });

            if(!findCustomer){
                return sendError(res, 400, false, "Customer not found");
            }else{
                const address = await Addresses.create({
                    customer_id,
                    address_line_1,
                    address_line_2,
                    area,
                    city,
                    state,
                    country,
                    postal_code,
                    landmark
                });
                return sendSuccess(res, 200, true, "Address added successfully", address);
            }
        }
    }catch(err){
        return sendError(res, 500, false, "Something went wrong", err)
    }
}

// get customers all order by customer id
const getCustomerAllOrders = async (req, res) => {
    try{
        const customer_id = req.userId;
         // Get Customer's all orders by Customer Id using sequelize
        const customer = await Customer.findOne({
            where: {
                id: customer_id
            },
            include: [
                {
                    model: Order,
                    as: "orders",
                }
            ]
        });
        if(customer){
            return sendSuccess(res, 200, true, "Customer's all orders", customer);
        }else{
            return sendError(res, 400, false, "Customer not found");
        }           
     }
     catch(error){
        return sendError(res, 500, false, "Something went wrong", error);
    }

}

const login = async (req, res) => {
    try{
        const { username, password } = req.body;

        if(!username || !password){
            return sendError(res, 400, false , "All fields are required");
        }else{
            const findCustomer = await Customer.findOne({
                where : {
                    username : username,
                } ,
                attributes : ['id', 'first_name', 'last_name', 'username', 'password']
            });
            if(!findCustomer){
                return sendError(res, 400, false, "Invalid credentials");
            }else{
                const bytes  = CryptoJS.AES.decrypt(findCustomer.password, process.env.SECRET_KEY);
                const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
                if(originalPassword === password){
                    const token = jwt.sign({ id: findCustomer.id }, process.env.SECRET_KEY, {
                        expiresIn: 86400 // 24 hours
                    });
                    return sendSuccess(res, 200, true, "Login successful", { token });
                }else{
                    return sendError(res, 400, false, "Invalid credentials");
                }
            }
        }
    }catch(err){
        return  sendError(res, 500, false, "Something went wrong", err);
    }
}


const register = async (req , res) => {
    try {
        const { first_name , last_name , primary_mobile_number , primary_email , username , password  } = req.body;
        const encryptedPass = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

        if(!first_name || !last_name || !primary_mobile_number || !primary_email || !username || !password){
            return sendError(res, 400, false, "All fields are required");
        }else if(primary_mobile_number.length !== 10){
            return sendError(res, 400, false, "Mobile number must be 10 digits", null);
        }else if(!regex.test(primary_email)){
            return sendError(res, 400, false, "Invalid email", null);
        }else{
            const findCustomer = await Customer.findOne({
                where : {
                    username : username,
                    primary_email : primary_email,
                    primary_mobile_number : primary_mobile_number
                }
            });
            if(findCustomer){
                return sendError(res, 400, false, "Customer already exists", null);
            }else{
                const customer = await Customer.create({
                    first_name,
                    last_name,
                    primary_mobile_number,
                    primary_email,
                    username,
                    password : encryptedPass
                });
                return sendSuccess(res, 200, true, "Customer registered successfully", customer);
            }
        }

    }catch(err) {
        return sendError(res, 500, false, "Something went wrong", err);
    }

}

const getUserDetails = async (req, res) => {
    try {
        let userId = req.userId;
        const user = await Customer.findOne({attributes: ['first_name', 'last_name', 'primary_email']}, { where: { id: userId } });
        if (!user) {
            return sendError(res, 400, false, "User does not exist")
        }else{
            return sendSuccess(res, 200, true, "User details", user)
        }        
    } catch (error) {
        return sendError(res, 500, false, "Something went wrong", error);        
    }
}


module.exports = {
    addCustomerAddress,
    getCustomerAllOrders,
    login,
    register,
    getUserDetails,
    updateCustomer
}