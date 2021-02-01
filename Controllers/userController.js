const User = require('../models/user');
const Crag = require('../models/crag');
const Order = require('../models/order');
const Passport = require('passport');
//Express validator
const { check, validationResult } = require('express-validator');
const { sanitize } = require('express-validator')

const querystring = require('querystring');
const crag = require('../models/crag');
const { parse } = require('path');

exports.signUpGet = (req,res,next) => {
    res.render('sign_up', {title: 'User Sign Up'})
}

exports.signUpPost = [
    check('first_name').isLength({min: 1}).withMessage('First name must be specified')
    .isAlphanumeric().withMessage('FIrst name must be alphanumeric'),

    check('surname').isLength({min: 1}).withMessage('Surname must be specified')
    .isAlphanumeric().withMessage('Surname must be alphanumeric'),

    check('email').isEmail().withMessage('Invalid email address'),

    check('confirm_email')
    .custom( (value, {req} )  => value === req.body.email)
    .withMessage('Email addresses do not match'),

    check('password').isLength({ min:6 }).withMessage('Invalid password, password must be a minimum of 6 characters'),

    check('confirm_password')
    .custom( (value, {req} )  => value === req.body.password)
    .withMessage('Passwords do not match'),

    sanitize('*').trim().escape(),

    (req,res,next) => {
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            res.render('sign_up', {title: 'Please fix the following errors', errors: errors.array()});
            return;
        }else{
            const newUser = new User(req.body);
            User.register(newUser, req.body.password, function(err){
                if(err) {
                    console.log('error while registering!', err)
                    return next(err);
                }
                next();
            })
        }
    }
]

exports.loginGet = (req,res) => {
    res.render('login', {title: 'Login to continue'});
}

exports.loginPost = Passport.authenticate('local', {
    successRedirect:'/',
    successFlash: 'You are now logged in ',
    failureRedirect: '/login',
    failureFlash: 'Login failed, please try again'
})

exports.logout = (req,res) => {
    req.logout();
    req.flash('info', 'You are now logged out ');
    res.redirect('/');
}

exports.bookingConfirmation = async (req,res) => {
    try{
        const data =req.params.data;
        const searchData = querystring.parse(data);
        const crag = await Crag.find( {_id: searchData.id })
        res.render('confirmation', {title: 'Confirm your booking', crag, searchData })
    }catch(error){
        next(error);
    }

}

exports.myAccount = async (req,res,next) => {
    try{
        const orders = await Order.aggregate([
            { $match: { user_id: req.user.id} },
            { $lookup: {
                from :'crags',
                localField: 'crag_id',
                foreignField: '_id',
                as: 'crag_data'
            }}
        ])
        res.render('user_account', {title: 'My Account', orders})
    }catch{
        next(error);
    }
}

exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.isAdmin) {
        next();
        return;
    }
    res.redirect('/');
}

exports.orderPlaced = async (req,res,next) => {
    try{
        const data =req.params.data;
        const parsedData = querystring.parse(data);
        const order = new Order({
            user_id: req.user._id,
            crag_id: parsedData.id,
            order_details: {
                duration: parsedData.duration,
                dateOfDeparture: parsedData.dateOfDeparture,
                numberOfGuests: parsedData.numberOfGuests
            }
        });
        await order.save();
        req.flash('info', 'Thank you, your order has been placed!');
        res.redirect('/my-account');
    }catch(error){
        next(error);
    }
}

exports.allOrders = async (req,res,next) => {
    try{
        const orders = await Order.aggregate([
            { $lookup: {
                from :'crags',
                localField: 'crag_id',
                foreignField: '_id',
                as: 'crag_data'
            }}
        ])
        res.render('orders', {title: 'All Orders', orders})
    }catch{
        next(error);
    }
}