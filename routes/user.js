const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const passport  = require('passport')

router.get('/singup',(req,res) =>{
    res.render('user/singup')
})
router.post('/singup',(req,res) =>{
    var errors = []

    if(!req.body.name||typeof req.body.name == undefined||req.body.name == null){
        errors.push({err:'name is required'})
    }
    if(!req.body.email||typeof req.body.email == undefined||req.body.email == null){
        errors.push({err:'email is required'})
    }
    if(!req.body.password||typeof req.body.password == undefined||req.body.password == null){
        errors.push({err:'password is required'})
    }
    if(req.body.password.length<4){
        errors.push({err:'password is too short'})
    }
    if(req.body.password != req.body.password2){
        errors.push({err:'password does not match'})
    }
    if(errors.length>0){
        res.render("user/singup",{errors: errors})
    }
    else{
        User.findOne({email: req.body.email}).then((user) =>{
            if(user){
                req.flash('error_msg',"invalid email")
                res.redirect('/user/singup')
            }
            else{
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })
                console.log(newUser)
                bcrypt.genSalt(10,(error,salt) => {
                    bcrypt.hash(newUser.password,salt,(error,hash) => {
                        if(error){
                            req.flash('error_msg','houve um erro ao salvar')
                            res.redirect('/')
                        }
                        newUser.password = hash
                        newUser.save().then(() => {
                            req.flash('success_msg','User Created')
                            res.redirect("/")
                           
                        }).catch((error) => {
                            req.flash('error_msg','Erro aoo criar user')
                            res.redirect('/user/singup')
                        })
                    })
                })

            }
        }).catch((err) =>{
            req.flash('error_msg',"internal error")
        })
    }
})
router.get('/login',(req,res) =>{
    res.render('user/login')
    
})
router.post('/login',(req,res,next) => {
    passport.authenticate("local",{
        successRedirect: "/",
        failureRedirect: "/user/login",
        failureFlash:true
    })(req,res,next)

})
router.get('/logout',(req,res)=>{
    req.logOut()
    req.flash('success_msg',"logged out successfully")
    res.redirect('/')
})

module.exports = router