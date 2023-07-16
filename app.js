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

app.route('/auth/google')
    .get(passport.authenticate('google', {
        scope: ['profile']
    }));

app.get("/auth/google/secrets",
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/secrets');
    });

app.get("/auth/github",
    passport.authenticate('github'));

app.get("/auth/github/secrets",
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/secrets');
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

app.get("/secrets", async (req, res)=> {
    const foundUsers = await User.find({secret: {$ne: null}});
    res.render("secrets", {usersSecrets: foundUsers});
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

app.route("/submit")
    .get((req, res)=> {
        if(req.isAuthenticated()){
            res.render("submit");
        }else{
            res.redirect("/login");
        }
    })
    .post(async (req, res)=> {
        const submittedSecret = req.body.secret;
        await User.findOneAndUpdate({_id: req.user._id}, {secret: submittedSecret})
            .then(()=> {
                res.redirect("/secrets");
            })
            .catch((err)=> {
                console.log(err);
            });
    });

app.listen(3000, function(req, res){
    console.log("The server is live on port 3000");
});