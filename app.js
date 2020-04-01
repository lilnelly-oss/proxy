require('dotenv').config()
var url = require('url');
var querystring = require('querystring');
var express = require('express');
var unblocker = require('unblocker');
var Transform = require('stream').Transform;
var app = express();
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
var unblockerConfig = {prefix: '/p/'};
app.set("view engine", "ejs")
app.use(unblocker(unblockerConfig));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname + "/public"))
var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
var today = new Date();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
console.log(utc)
console.log(today)
console.log(time)
var users = {
    guest1username: process.env.guest1username, 
    guest1password: process.env.guest1password
}




db.defaults({ submittedsites: [], verifiedworkingsites: [], emailsorusername: [], verifiedusers: []})  
.write()

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/views/home.html")
})

app.get('/test', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
app.get("/no-js", function(req, res) {
    var site = querystring.parse(url.parse(req.url).query).url;
    res.redirect(unblockerConfig.prefix + site);
});

app.get('/add-sites', (req, res) => {
    res.sendFile(__dirname + "/views/add.html")
})

app.get('/api/request/', (req, res) => {
    res.sendFile(__dirname + "/views/request.html")
})

app.post('/validate-data', (req, res) => {
    var word = {
        url: req.body.url,
        usernameoremail: req.body.username,
        date: utc,
        time: time
    }
    db.get('submittedsites')
    .push({word})
    .write()
    db.get('emailorusername')
    .push({email: req.body.username})
    .write()
})

app.post("/user-request", (req, res) => {
    var user_for_request = {
        email: req.body.email,
        reason: req.body.reason,
        accept: true
    }
    db.get('emailsorusername')
    .push({user_for_request})
    .write()

})

app.get("/api/login/", (req, res) => {
    res.render(__dirname + "/views/login.ejs")
})

app.post('/api/login', (req, res) => {
    var info = {
        users_name: req.body.loginusername,
        password: req.body.loginpassword
    }
    if(info.users_name == users.guest1username && info.password == users.guest1password){
        res.redirect(307, "/api/verified/proxy/success")
    }else{
        res.render(__dirname + "/views/login.ejs")
    }
})

app.post('/api/verified/proxy/success', (req, res) =>{
    res.render(__dirname + '/views/proxypage.ejs', ({url: process.env.URL}))
})

app.use(function(req,res){
    res.status(404).sendFile(__dirname + '/views/404.html');
});

app.listen(3000, () => {
    console.log("Server Started On 3000")
})
module.exports = app;