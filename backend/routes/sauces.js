const express = require('express');
const auth = require ('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer_config')



const saucesCtrl = require ('../controllers/sauces');


//route post pour crée sauces
router.post('/',auth,multer, saucesCtrl.createSauces);
  
//route pour modifier un sauces
router.put('/:id',auth,multer, saucesCtrl.modifySauces)
  
//route get pour rechercher une seul sauces
router.get('/:id',auth, saucesCtrl.searchOneSauces);

//route pour supprimer une sauces
router.delete('/:id',auth, saucesCtrl.deleteSauces);

//route get pour rechercher toutes les sauces
router.get('/',auth, saucesCtrl.searchAllSauces)

//route pour ajouter et supprimer un like
router.post('/:id/like', auth, saucesCtrl.likeSauces)

module.exports = router;