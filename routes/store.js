const mongodb = require('mongodb');
const express = require('express');
const multer = require('multer');
const db = require('../data/database');
const chunk = require('../public/scripts/prepareDataObject')
const importModels = require('../models/item');
const News = importModels.News;
const Item = importModels.Item;
const { title } = require('process');
const fs = require('fs');
const nodeMail = require("nodemailer");

const storageConfig = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'item-images');
    },
    filename: function(req, file, cb) {
        const newFileName = Date.now() + '-' + file.originalname;
        cb(null, newFileName);
    },
});

const upload = multer({ storage: storageConfig});
const router = express.Router();

router.get('/', async function (req, res) {
    const items = await db.getDb().collection('items').find().toArray();
    const news = await db.getDb().collection('news').find().toArray();
    res.render('welcome', {items: items, news:news});
});

router.get('/items', async function (req, res) {

    if (!res.locals.isAuth) {
        return res.status(401).render('401');
    }  
    
    if (!res.locals.isAdmin) {
        return res.status(403).render('403');
    }
    const items = await db.getDb().collection('items').find().toArray();
    res.render('items',{items: items});
});

router.post('/items', upload.single('image'), async function (req, res) {
    const uploadedImageFile = req.file ;
    const itemData = req.body;
    
    const resources = itemData.resources.split('\n');
    const trimmedResources =  resources.map(resource => {return resource.trim()});
    const chunkedResources = chunk.chunk(trimmedResources, 2);
    const resourcesObject = Object.fromEntries(chunkedResources)
    
    const lockedResources = itemData.lockedResources.split('\n');
    const trimmedLockedResources =  lockedResources.map(lockedResource => {return lockedResource.trim()});
    const chunkedLockedResources = chunk.chunk(trimmedLockedResources, 2);
    const lockedResourcesObject = Object.fromEntries(chunkedLockedResources)

    const item = new Item(itemData.title, itemData.description, itemData.genre, uploadedImageFile.path, resourcesObject, lockedResourcesObject);

    await item.save()

    res.redirect('/');
});

router.post('/items/:id/delete', async function (req, res) {
    const deleteItemId = new mongodb.ObjectId(req.params.id);
    const imageToDelete = await db.getDb().collection('items').findOne({_id: deleteItemId}, {imagePath: 1, _id: 0});
    fs.unlinkSync(imageToDelete.imagePath);
    const result = await db.getDb().collection('items').deleteOne({_id: deleteItemId});
    console.log(result)
    res.redirect('/items');
});

router.get('/items/:id/edit', async function (req, res) {
    const editItemId = new mongodb.ObjectId(req.params.id);
    const editItem = await db.getDb().collection('items').findOne({_id: editItemId});
    req.session.editItem = editItem;
    res.render('edit-item-form', {item: editItem}); 
})

router.post('/edit-item/:id', upload.single('image'), async function(req,res) {
    const editItemId = new mongodb.ObjectId(req.params.id);
    const uploadedImageFile = req.file ;
    const itemData = req.body;
    let resourceObject = {};
    let lockedResourcesObject = {};

    if (itemData.resources) {
        const resources = itemData.resources.split('\n');
        const trimmedResources =  resources.map(resource => {return resource.trim()});
        const chunkedResources = chunk.chunk(trimmedResources, 2);
        resourcesObject = Object.fromEntries(chunkedResources)
    }

    if (itemData.lockedResources) {
        const lockedResources = itemData.lockedResources.split('\n');
        const trimmedLockedResources =  lockedResources.map(lockedResource => {return lockedResource.trim()});
        const chunkedLockedResources = chunk.chunk(trimmedLockedResources, 2);
        lockedResourcesObject = Object.fromEntries(chunkedLockedResources);  
    };

    if (!uploadedImageFile) {
        const updateData = {
            title: itemData.title,
            description: itemData.description,
            genre: itemData.genre,
            resources: resourcesObject,
            lockedResources: lockedResourcesObject
        };
        await db.getDb().collection('items').updateOne({_id: editItemId}, {$set : updateData})
    } 
    else {
        await db.getDb().collection('items').updateOne({_id: editItemId}, {$set : {
            title: itemData.title,
            description: itemData.description,
            genre: itemData.genre,
            imagePath: uploadedImageFile.path,
            resources: resourcesObject,
            lockedResources: lockedResourcesObject
        }
        });
        const imagePathToDelete = req.session.editItem.imagePath;
        fs.unlinkSync(imagePathToDelete);
    }

    res.redirect('/items');
});

router.get('/buy', function (req, res) {
    res.render('buy');
});

router.get('/news', async function (req, res) {
    const news = await db.getDb().collection('news').find().toArray()
    res.render('news', {news:news});
});

router.post('/news', upload.single('image'), async function (req, res) {
    const uploadedImageFile = req.file ;
    const newsData = req.body;
    console.log(newsData)
    if (!req.file) {
        const news = new News(newsData.title, newsData.news);
        await news.save();
        res.redirect('/news');
        return
    }
   
    const news = new News(newsData.title, newsData.news, uploadedImageFile.path);

    await news.save()

    res.redirect('/news');
});

router.post('/news/:id/delete', async function(req, res) {
    const editNewsId = new mongodb.ObjectId(req.params.id);
    const editNews = await db.getDb().collection('news').findOne({_id: editNewsId}, {imagePath:1});
    if (editNews.imagePath) {
        fs.unlinkSync(editNews.imagePath);
    };
    await db.getDb().collection('news').deleteOne({_id:editNewsId});
    res.redirect('/news')
});

router.get('/news/:id/edit', async function(req,res) {
    const editNewsId = new mongodb.ObjectId(req.params.id);
    const editNews = await db.getDb().collection('news').findOne({_id: editNewsId});
    req.session.editnews = editNews
    
    res.render('edit-news', {newsItem: editNews})

})

router.post('/edit-news/:id', upload.single('image'), async function(req, res) {
    const editNewsId = new mongodb.ObjectId(req.params.id);
    const uploadedImageFile = req.file ;
    const newsItem = req.body;
    
    
    if (!uploadedImageFile) {
        const updateData = {
            title: newsItem.title,
            news: newsItem.news
        };
        console.log(updateData)
        await db.getDb().collection('news').updateOne({_id: editNewsId}, {$set : updateData})
    } else {
        await db.getDb().collection('news').updateOne({_id: editNewsId}, {$set : {title: newsItem.title, news: newsItem.news, imagePath: uploadedImageFile.path}})
        const imagePathToDelete = req.session.editnews.imagePath;
        if (imagePathToDelete) {
        fs.unlinkSync(imagePathToDelete);
        req.session.editnews = null
        };
    };

    res.redirect('/news');
});

router.get('/contact' , function(req,res) {
    res.render('contact');
});

// email app for contact form
router.post("/contact", async (req, res, next) => {
    const name= req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    
    try {
        await mainMailContact(name, email, message);
        console.log(name)
      
      res.redirect('/contactsuccess');
    } catch (error) {
      res.send("Message Could not be Sent");
    }
});

async function mainMailContact(name, email, message) {
    console.log('here we are');
    const transporter = await nodeMail.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PW,
        },
    });
    const mailOption = {
      from: 'testy1066@gmail.com',
      to: 'lewis_webster@hotmail.com',
      subject: `Contact from ${name}`,
      text:  
        `   Email :  ${email}
        
        Name:  ${name}
        
        ${message}`,
    };
console.log(mailOption)

    try {
      await transporter.sendMail(mailOption);
      return Promise.resolve('/contactsuccess');
    } catch (error) {
      return Promise.reject(error);
    }
  }
//contact email end

// email app for sample form
router.post("/samples", async (req, res, next) => {
    const name= req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    const org = req.body.org;
    const address = req.body.address
    
    try {
        await mainMail(name, org, email, message, address);
        console.log(name)
      
      res.redirect('/contactsuccess');
    } catch (error) {
      res.send("Message Could not be Sent");
    }
});

async function mainMail(name, org, email, message, address) {
    console.log('here we are');
    const transporter = await nodeMail.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PW,
        },
    });
    const mailOption = {
      from: 'testy1066@gmail.com',
      to: 'lewis_webster@hotmail.com',
      subject: `Contact from ${name}`,
      text:  
      `Email :  ${email}

      Name:  ${name}
      
      organisation:  ${org}
      
      address:
      ${address}
      
      message:
      ${message}`,
    };
console.log(mailOption)

    try {
      await transporter.sendMail(mailOption);
      return Promise.resolve('/contactsuccess');
    } catch (error) {
      return Promise.reject(error);
    }
  }
//sample email end

router.get('/resources' , async function(req, res){
    const items = await db.getDb().collection('items').find().toArray();
    res.render('resources', {items:items});
});

router.get('/samples', function(req,res) {
    res.render('samples');
});

router.get('/about', function (req, res) {
    res.render('about');
});

router.get('/contactsuccess' , function(req, res) {
    res.render('contactsuccess');
});

module.exports = router;