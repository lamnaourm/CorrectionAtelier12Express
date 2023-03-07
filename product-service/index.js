const express = require('express');
const mongoose = require('mongoose');
const productsRoutes = require('./routes/product');

const app = express();

app.use(express.json());

mongoose
  .connect(`mongodb://localhost:27017/dbproducts`, { useNewUrlParser: true })
  .then(() => console.log("BD : connexion reussie "))
  .catch((error) => console.log('Erreur de connexion' + error));

app.use('/products',productsRoutes);

app.listen(3000, () => {
    console.log('Serveur lance');
})