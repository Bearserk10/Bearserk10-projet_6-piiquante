const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();


passwordSchema
    .is().min(8) //longeur mini : 8
    .has().uppercase()// au moins une majuscule
    .has().lowercase()// au moins une minuscule
    .has().digits()//au moins un chiffre
    .has().not().spaces()//pas d'espace


module.exports = passwordSchema;