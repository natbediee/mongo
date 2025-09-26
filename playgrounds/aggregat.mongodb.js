use('blog');
db.posts.drop();

db.posts.insertMany([
  {
    createdDate: new Date("2016-01-18"),
    author: "Loutre joyeuse",
    title: "D'accord",
    content: "Mais",
    comments: [
      { date: new Date("2016-01-20"), writer: "Tortue géniale", role: null, msg: "Pas d'accord" }
    ]
  },
  {
    createdDate: new Date("2016-01-18"),
    author: "Bison futé",
    title: "d'accord",
    content: "Ou",
    comments: [
      { date: new Date("2016-01-20"), writer: "Tortue géniale", role: null, msg: "Pas d'accord" },
      { date: new Date("2016-01-21"), writer: "Loutre joyeuse", role: null, msg: "D'accord" }
    ]
  },
  {
    createdDate: new Date("2016-03-18"),
    author: "Loutre joyeuse",
    title: "Pas d'accord",
    content: "Et",
    comments: [
      { date: new Date("2016-03-20"), writer: "Tortue géniale", role: null, msg: "Pas d'accord" },
      { date: new Date("2016-03-21"), writer: "Loutre joyeuse", role: null, msg: "Pas d'accord" }
    ]
  },
  {
    createdDate: new Date("2017-01-18"),
    author: "Tortue géniale",
    title: "Pas d'accord",
    content: "Donc",
    comments: []
  },
  {
    createdDate: new Date("2017-01-18"),
    author: "Loutre joyeuse",
    title: "Pas d'accord",
    content: "Or",
    comments: [
      { date: new Date("2017-01-20"), writer: "Bison futé", role: null, msg: "D'accord" },
      { date: new Date("2017-01-21"), writer: "Tortue géniale", role: null, msg: "Pas d'accord" },
      { date: new Date("2017-01-22"), writer: "Loutre joyeuse", role: null, msg: "Pas d'accord" }
    ]
  }
]);

// ----------------- Index -----------------
// Ex.1 : index sur author (croissant par défaut)
db.posts.createIndex({ author: 1 });

// Ex.2 : index décroissant sur createdDate
db.posts.createIndex({ createdDate: -1 });

// Ex.3 : titre A→Z puis date récente→ancienne
db.posts.createIndex({ title: 1, createdDate: -1 });

// Recherche "Pas d'accord" avec l’index précédent
db.posts.find({ title: "Pas d'accord" }).sort({ title: 1, createdDate: -1 });

// Ex.4 : lister tous les index
db.posts.getIndexes();

// ----------------- Agrégations -----------------
// Ex.1 : nombre de posts par auteur (sans tenir compte des commentaires)
db.posts.aggregate([
  { $group: { _id: "$author", nbPosts: { $sum: 1 } } },
  { $sort: { nbPosts: -1, _id: 1 } }
]);

// Ex.2 : par auteur, lister dates et titres
db.posts.aggregate([
  { $group: {
      _id: "$author",
      posts: { $push: { date: "$createdDate", title: "$title" } }
  }},
  { $sort: { _id: 1 } }
]);

//ex3 nombre de posts par mois (année/mois)
db.posts.aggregate([
  {$group:{_id:{year:{$year:"$createdDate"},month:{$month:"$createdDate"}},nbPosts:{$sum:1}}},
  {$sort:{"_id.year":1,"_id.month":1}}
]);

// Ex.4 : nombre de posts pour "Loutre joyeuse"
db.posts.aggregate([
  { $match: { author: "Loutre joyeuse" } },
  { $count: "nbPosts" }
]);

// Ex.5 : éclater les commentaires (un doc par commentaire)
db.posts.aggregate([
  { $unwind: "$comments" }
]);

// Ex.6 : nombre de commentaires par post
db.posts.aggregate([
  { $project: { _id:0,title: 1, nbComments: { $size: { $ifNull: ["$comments", []] } } } },
  { $sort: { nbComments: -1, title: 1 } }
]);

// Ex.7 : nombre de commentaires par auteur de commentaire
db.posts.aggregate([
  { $unwind: "$comments" },
  { $group: { _id: "$comments.writer", nbComments: { $sum: 1 } } },
  { $sort: { nbComments: -1, _id: 1 } }
]);

// Ex.8 : posts de "Loutre joyeuse" triés par date DESC
db.posts.aggregate([
  { $match: { author: "Loutre joyeuse" } },
  { $set: {
      comments: {
        $sortArray: { input: { $ifNull: ["$comments", []] }, sortBy: { date: 1 } }
      }
  }},
  { $sort: { createdDate: -1 } },
  { $project: { author: 1, title: 1, createdDate: 1, comments: 1 } }
]);