if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const dbUrl = process.env.ATLASDB_URL

const store = new MongoStore({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
})
store.on("error",(err)=>{
    console.log("Error in MONGO SESSION STORE",err)
})
const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash()); //always remember flash should always be above listing and review routes
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

main()
    .then(()=>{
        console.log("Connected to db")
    })
    .catch((err)=>{
        console.log(err)
    });

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;  
    next();
})
// app.get("/demouser",async(req,res)=>{
//     const user = new User({username:"demouser",email:"demouser@example.com"});
//     const newUser = await User.register(user,"demopassword");
//     res.send(newUser);
// });
app.use("/listings",listingRouter)
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter)



// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new resort",
//         description: "By the central hall",
//         price: 1200,
//         location: "Waterfront",
//         country: "Canada"
//     });
//     await sampleListing.save();
//     console.log("Sample was successfully created");
//     res.send("Successfully testing")
// })




app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!!"));
});

//same as above but it crashes. So above is better
// app.all("*",(req, res, next) => { 
//     next(new ExpressError(404, "Page not found!!")); 
// });



//Middleware for validation
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message})
})
app.listen(8080,()=>{
    console.log("listining on 8080")
})
