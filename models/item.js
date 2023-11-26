const db = require('../data/database')

class Item {
    constructor(title, description, genre, imagePath, resources, lockedResources, id) {
        this.title = title;
        this.description = description;
        this.genre = genre
        this.imagePath = imagePath;
        this.resources = resources;
        this.lockedResources = lockedResources
        this.id = id;
    }

   async save() {
           
        await db.getDb().collection('items').insertOne({
            title: this.title,
            description: this.description,
            genre: this.genre,
            imagePath: this.imagePath,
            resources: this.resources,
            lockedResource:this.lockedResources
        });
    }

}

class News {
    constructor(title, news, imagePath, id) {
        this.title = title;
        this.news = news;
        this.imagePath = imagePath;
        this.id = id;
    }

   async save() {
        await db.getDb().collection('news').insertOne({
            title: this.title,
            news: this.news,
            imagePath: this.imagePath
        });
    }
}

module.exports = {Item: Item, News: News};