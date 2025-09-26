// Ex 1 : créer base "info"
use("info")

// Ex 2 : créer collection produits + inserts
db.produits.drop()
db.produits.insertMany([
  {
    nom: "Macbook Pro",
    fabriquant: "Apple",
    prix: 1299.99,
    options: ["Intel Core i5", "Retina Display", "Long life battery"]
  },
  {
    nom: "Macbook Air",
    fabriquant: "Apple",
    prix: 1099.99,
    ultrabook: true,
    options: ["Intel Core i7", "SSD", "Long life battery"]
  },
  {
    nom: "Thinkpad X230",
    fabriquant: "Lenovo",
    prix: 999.99,
    ultrabook: true,
    options: ["Intel Core i5", "SSD", "Long life battery"]
  }
])

// Ex 3 : requêtes de lecture
db.produits.find()                                    // tous les produits
db.produits.find().limit(1)                           // premier produit
db.produits.findOne({ nom: "Thinkpad X230" })         // Thinkpad X230
db.produits.findOne({ nom: "Macbook Air" }, { _id: 1 }) // id du Macbook Air
db.produits.find({ prix: { $gt: 1200 } })             // prix > 1200
db.produits.findOne({ ultrabook: true })              // premier ultrabook
db.produits.findOne({ nom: /Macbook/ })               // nom contient "Macbook"
db.produits.find({ nom: /^Macbook/ })                 // nom commence par "Macbook"

// Ex 4 : suppressions
db.produits.deleteMany({ fabriquant: "Apple" }) // fabricant Apple
const idLenovo = db.produits.findOne({ nom: "Thinkpad X230" }, { _id: 1 })._id // id Lenovo
db.produits.deleteOne({ _id: idLenovo }) // suppression Lenovo

// Exercice 5 : factures
db.factures.drop()
db.factures.insertMany([
  {
    numero: "10012A",
    date: new Date("2013-07-04"),
    client: { nom: "Alexandre Terrasa", courriel: "foobar@example.com" },
    produits: [
      { code: "MACBOOKAIR",   nom: "Macbook Air",        prix: 999.99, quantite: 1 },
      { code: "APPLESUPPORT", nom: "AppleCare 1 an",     prix: 149.99, quantite: 1 }
    ],
    total: 1149.98
  },
  {
    numero: "10013A",
    date: new Date("2013-07-05"),
    client: { nom: "Jacques Berger", courriel: "berger.jacques@uqam.ca" },
    produits: [
      { code: "LENOVOX230",   nom: "Lenovo Thinkpad X230", prix: 899.99, quantite: 1 }
    ],
    total: 899.99
  }
])

db.factures.findOne({ numero: "10013A" }) // facture 10013A

db.factures.updateOne(                     // modifier 10012A
  { numero: "10012A" },
  {
    $set: {
      date: new Date("2013-07-03"),
      "client.courriel": "alex@example.com"
    }
  }
)

db.factures.find({ "produits.code": "LENOVOX230" }) // facture contenant LENOVOX230

db.factures.deleteOne({ numero: "10012A" }) // suppression facture 10012A

// Exercice 6 : films dans base avis 
use("avis")

// --- IMPORT MANUEL  ---
// Copier le fichier movies.json dans le conteneur Mongo :
//   docker cp tp/movies.json my_mongo:/movies.json
// Puis exécuter l'import dans le conteneur :
//   docker exec -it my_mongo \ mongoimport --db=avis --collection=films --file=/movies.json
// -----------------------------------------------------

// tous les titres
db.films.find({}, { _id: 0, title: 1 })

// titres après 2000
db.films.find({ year: { $gt: 2000 } }, { _id: 0, title: 1, year: 1 })

// résumé de Spider-Man
db.films.findOne({ title: "Spider-Man" }, { _id: 0, summary: 1 })

// metteur en scène de Gladiator
db.films.findOne(
  { title: "Gladiator" },
  { _id: 0, "director.first_name": 1, "director.last_name": 1 }
)

// titres avec Kirsten Dunst
db.films.find(
  { "actors.first_name": "Kirsten", "actors.last_name": "Dunst" },
  { _id: 0, title: 1 }
)

// films ayant un résumé
db.films.find(
  { summary: { $exists: true, $ne: null } },
  { _id: 0, title: 1 }
)

// films ni drama ni comédie
db.films.find({ genre: { $nin: ["drama", "Comédie"] } }, { _id: 0, title: 1, genre: 1 })

// titres + acteurs
db.films.find(
  {},
  { _id: 0, title: 1, "actors.first_name": 1, "actors.last_name": 1 }
)

// Clint Eastwood acteur mais pas réalisateur
db.films.find(
  {
    "actors.first_name": "Clint",
    "actors.last_name": "Eastwood",
    "director.first_name": { $ne: "Clint" },
    "director.last_name": { $ne: "Eastwood" }
  },
  { _id: 0, title: 1, "director.first_name": 1, "director.last_name": 1 }
)
