const sauces = require('../models/sauces');
const fs = require('fs')

exports.createSauces = (req, res, next) =>{
    const saucesObject = JSON.parse(req.body.sauces);
    delete saucesObject._id;
    delete saucesObject._userId;
    const sauces = new sauces({
      ...saucesObject,
      userId : req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauces.like = 0;
    sauces.dislikes = 0;
    sauces.save()
    .then(() => { res.status(201).json({ message: 'image enregistré'})})
    .catch(error => {res.status(400).json({ error })})
  };

exports.modifySauces = (req, res, next) =>{
    const saucesObject = req.file ? {
      ...JSON.parse(req.body.sauces),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete saucesObject._userId;
    sauces.findOne({_id: req.params.id})
    .then((sauces) =>{
      if (sauces.userId != req.auth.userId){
        res.status(401).json({ message: 'Non-autorisé'})
      } else{
        sauces.updateOne({_id: req.params.id}, {...saucesObject, _id: req.params.id})
        .then(() => res.status(200).json({ message: 'Objet modifié'}))
        .catch(error => res.status(401).json({ error }))
      }
    })
    .catch((error) => {res.status(400).json({ error })})
  };

exports.searchOneSauces = (req,res,next) =>{
    sauces.findOne({ _id: req.params.id })
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(404).json({error}));
  };

exports.deleteSauces = (req, res, next) =>{
    sauces.findOne({ _id: req.params.id})
    .then(sauces =>{
        if (sauces.userId != req.auth.userId){
          res.status(401).json({message: 'Non-autorisé'})
        }else{
          const filename =thing.imageUrl.split('/image/')[1];
          fs.unlink(`images/${filename}`, () =>{
            sauces.deleteOne({_id: req.params.id})
            .then(() => { res.status(200).json({ message: 'Objet supprimé'})})
            .catch( error => res.status(401).json({ error }));
          })
        }
    })
    .catch(error => {res.status(500).json({ error })})
  };

exports.searchAllSauces = (req, res, next) =>{
    sauces.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
    next();
  };

  exports.likeSauces = (req, res, next) => {
    sauces.findOne({ _id: req.params.id })
        .then(sauces => {
            if (req.body.like === 1) {
                if ((sauces.usersLiked.includes(req.body.userId)) || (sauces.usersDisliked.includes(req.body.userId))) {
                    res.status(401).json({ error: 'Sauces déja liké ou disliké' });
                }
                else {
                    sauces.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
                        .then((Sauces) => res.status(200).json({ message: 'Like ajouté !' }))
                        .catch(error => res.status(400).json({ error }))
                }
            }
            else if (req.body.like === -1) {
                if ((sauces.usersLiked.includes(req.body.userId)) || (sauces.usersDisliked.includes(req.body.userId))) {
                    res.status(401).json({ error: 'Sauces déja liké ou disliké' });
                } else { 
                    Sauces.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } })
                        .then((Sauces) => res.status(200).json({ message: 'Dislike ajouté !' }))
                        .catch(error => res.status(400).json({ error }));
                }
            }
            else if ((req.body.like == 0) || (req.body.like == -0)) {
                if (sauces.usersLiked.includes(req.body.userId)) {
                    Sauces.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                        .then((Sauces) => { res.status(200).json({ message: 'Like supprimé !' }) })
                        .catch(error => res.status(400).json({ error }));
                }
                if (sauces.usersDisliked.includes(req.body.userId)) {
                    Sauces.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                        .then((Sauces) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
                        .catch(error => res.status(400).json({ error }));
                }
            }
        })
        .catch(error => res.status(400).json({ error }));
}
