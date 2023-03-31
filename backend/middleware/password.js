const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();


passwordSchema
    .is().min(8) //longeur mini : 8
    .has().uppercase()// au moins une majuscule
    .has().lowercase()// au moins une minuscule
    .has().digits()//au moins un chiffre
    .has().not().spaces()//pas d'espace


module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        next();
    }else{
        return res.status(400).json({error : `le mot de passe n'est pas assez fort`})
    }
}