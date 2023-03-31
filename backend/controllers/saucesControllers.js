//récupération du modèle 'sauce'
const Sauce = require('../models/sauceModels');
//Module 'file system' permet de gérer les téléchargements et modifications d'images
const fs = require('fs');

//Création d'une nouvelle sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    console.log(req.body)
    delete sauceObject._id;
     const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        //Modifie l'URL de l'image 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename
            }`,
    });
    sauce.likes = 0;
    sauce.dislikes = 0;
    sauce
        .save()

        .then(() => {
            res.status(201).json({ message: 'Sauce enregistrée !' });
        })

        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Modifier une sauce
exports.modifySauce = (req, res, next) => {
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                     if (sauce.userId != req.auth.userId) {
                    res.status(403).json({ message: 'Unauthorized request' });
                    if (!sauce) {
                        res.status(404).json({ error: 'Sauce inexistante' });
                    }
                } else {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        const sauceObject = {
                            ...JSON.parse(req.body.sauce),
                            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                        }
                        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                            .then(() => {
                                res.status(200).json({
                                    message: 'Sauce modifiée !'
                                });
                            })
                            .catch(error => res.status(400).json({ error }));
                    });
                }
            })

            .catch(error => res.status(500).json({ error }));
    } else {
        const sauceObject = { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
            .catch(error => res.status(400).json({ error }));
    }
};


//Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Unauthorized request' });
                if (!sauce) {
                    res.status(404).json({ error: 'Sauce inexistante' });
                }
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: 'Sauce supprimée !'
                            });
                        })
                        .catch((error) => res.status(404).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

//Récupère une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
};

//Récupère toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(400).json({ error }));
};

//Like ou Dislike d'une sauce
exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (req.body.like === 1) {
                if ((sauce.usersLiked.includes(req.body.userId)) || (sauce.usersDisliked.includes(req.body.userId))) {
                    res.status(402).json({ error: 'Sauce déja liké ou disliké' });
                }
                else {
                    Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
                        .then((sauce) => res.status(200).json({ message: 'Like ajouté !' }))
                        .catch(error => res.status(400).json({ error }))
                }
            }
            else if (req.body.like === -1) {
                if ((sauce.usersLiked.includes(req.body.userId)) || (sauce.usersDisliked.includes(req.body.userId))) {
                    res.status(403).json({ error: 'Sauce déja liké ou disliké' });
                } else {
                    Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } })
                        .then((sauce) => res.status(200).json({ message: 'Dislike ajouté !' }))
                        .catch(error => res.status(400).json({ error }));
                }
            }
            else if ((req.body.like == 0) || (req.body.like == -0)) {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                        .then((sauce) => { res.status(200).json({ message: 'Like supprimé !' }) })
                        .catch(error => res.status(400).json({ error }));
                }
                if (sauce.usersDisliked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                        .then((sauce) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
                        .catch(error => res.status(400).json({ error }));
                }
            }
        })
        .catch(error => res.status(400).json({ error }));
}


