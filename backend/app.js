//Require
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');


//Sécurité
require('dotenv').config();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize'); //Empeche injection
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); //Limite les demandes
const hpp = require('hpp'); //Contre les attaques des paramètres HTTP
require('dotenv').config();


//Connection MongoDB
mongoose.connect('mongodb+srv://Bearserk_1:azerty123@cluster0.awnokbo.mongodb.net/test',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));



// Déclaration des routes
const userRoutes = require('./routes/userRoutes');
const sauceRoutes = require('./routes/sauceRoutes');


// Création d'express
app.use(express.json());



//_______Sécurité
app.use(helmet());

//Contrôle du débit du trafic envoyé ou reçu 
const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 100, //requete max /
});
app.use(limiter);
app.use(mongoSanitize());
app.use(morgan('combined'));
app.use(hpp());


//Définition des en-têtes CORS 
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'same_site');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    next();
});




app.use('/images', express.static(path.join(__dirname, 'images')));


app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;
