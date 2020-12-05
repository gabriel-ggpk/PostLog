module.exports = {
    isAdm: function(req, res, next) {
        if(req.isAuthenticated()&&req.user.isAdmin==true){
            return next();
        }
        req.flash('error_msg',"access denied")
        res.redirect('/')
    }
}