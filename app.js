require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const User = require("./mongodb");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res)=> {
    res.render("home");
});

app.route("/login")
    .get((req, res)=> {
        res.render("login");
    })
    .post((req, res)=> {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        req.login(user, (err)=> {
            if(err){
                console.log(err);
            }else{
                passport.authenticate("local")(req, res, ()=> {
                    res.redirect("/secrets");
                });
            }
        });
    });

app.get("/secrets", (req, res)=> {
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.route("/register")
    .get((req, res)=> {
        res.render("register");
    })
    .post((req, res)=> {
        User.register({username: req.body.username}, req.body.password, (err, user)=> {
            if(err){
                console.log(err);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req, res, ()=> {
                    res.redirect("/secrets");
                });
            }
        });
    });

app.get("/logout", (req, res)=> {
    res.render("home");
});

app.listen(3000, function(req, res){
    console.log("The server is live on port 3000");
});