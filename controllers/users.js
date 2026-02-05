const User = require('../models/user.js');

module.exports.signup = async (req, res, next) => {
    try{
        let { username, email, password } = req.body;
        const newUser=new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, err => {                       //both login and logout are provided by passport. It is a callback function
            if (err) {return next(err)};
            req.flash('success', 'Welcome to Wanderwithme !');
            res.redirect('/listings');
        });
    }catch(e){
        req.flash('error', e.message);
        res.redirect('signup');
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login.ejs');
}

module.exports.login =async (req, res) => {

    req.flash("success", "welcome back!");
    let redirectUrl = res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl);  //passport automatially deletes the session on successful login, so we store the redirect url before that
    delete req.session.redirectUrl;

}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {                        //both login and logout are provided by passport. It is a callback function
        if (err) { return next(err); }
        req.flash('success', "logged you out!");
        res.redirect('/listings');
    });
}