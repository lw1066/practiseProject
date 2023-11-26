const express = require('express');
const path = require('path');

const db   = require('./data/database');
const storeRoutes = require('./routes/store.js');
const authRoutes = require('./routes/auth.js');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session');
const nodeMail = require("nodemailer");
require('dotenv').config();

const MongoDBStore = mongodbStore(session);

const app = express();




const sessionStore = new MongoDBStore({
    uri: 'mongodb+srv://user1:-pl,mko0@rest-test.sl9i8zv.mongodb.net/?retryWrites=true&w=majority',
    databaseName: 'project-practise',
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/item-images', express.static(path.join(__dirname, 'item-images')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: 'hush-hush',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
}));

app.use(async function(req, res, next){
    const user = req.session.user;
    const isAuth = req.session.isAuthenticated;
    
    if (!user || !isAuth) {
        return next();
    }
    
    const userData = await db.getDb().collection('users').findOne({_id:user.id});
    const isAdmin = userData.isAdmin;
    
    res.locals.isAuth = isAuth;
    res.locals.isAdmin = isAdmin;
    
    next()
});


app.use(storeRoutes);
app.use(authRoutes);

app.use(function(error, req, res, next) {
    res.render('500');
});

db.connectToDatabase().then(function () {
    app.listen(3000);
});