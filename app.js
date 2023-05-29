const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const signIn = require("./mongodb");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));

app.get("/", (req, res)=> {
    res.render("home");
});

app.route("/login")
    .get((req, res)=> {
        res.render("login");
    })
    .post(async (req, res)=> {
        const email = req.body.username;
        const password = md5(req.body.password);
        await signIn.findOne({email: email})
            .then((userFound)=> {
                if(userFound.password === password){
                    res.render("secrets");
                }else{
                    console.log("Invalid Credentials!");
                }
            })
            .catch((err)=> {
                console.log(err);
            });
    });

app.route("/register")
    .get((req, res)=> {
        res.render("register");
    })
    .post(async (req, res)=> {
        const userData = new signIn({
            email: req.body.username,
            password: md5(req.body.password)
        });
        userData.save()
            .then(()=> {
                res.render("secrets");
            })
            .catch((err)=> {
                console.log(err);
            });
    });

app.get("/logout", (req, res)=> {
    res.render("home");
})

app.listen(3000, function(req, res){
    console.log("The server is live on port 3000");
});