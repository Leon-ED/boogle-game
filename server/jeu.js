require('dotenv').config();
const CWD = process.env.CWD;



getGrille = function (req, res, next)  {
    const exec = require('child_process').exec;
    const lignes = Math.max(2,req.params.lignes);
    const colonnes = Math.max(2,req.params.colonnes);
    console.log('Recherche de grille de ' + lignes + ' lignes et ' + colonnes + ' colonnes.');
    
    exec('cd '+CWD+'/bin && ./grid_build ../utils/frequences.txt ' + lignes + ' ' + colonnes, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
            
        }
        if (stderr) {
            console.error(stderr);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
            
        }
        return res.status(200).json({
            status: 'success',
            message: 'Recherche réussie.',
            grille: stdout,
            lignes: lignes,
            colonnes: colonnes
        });
        
    });



}


verifMot = function (req, res, next) {
    console.log('Recherche de définitions pour le mot ' + req.body.mot);
    const exec = require('child_process').exec;
    const {mot, grille, lignes, colonnes, langue} = req.body;

    const cmd = 'cd '+CWD+'/bin && ./grid_path ' + mot.toUpperCase() + ' '+ lignes + ' ' + colonnes + ' ' + grille;
    exec(cmd, (err, stdout, stderr) => {
        // check if the program has returned code 0
        if (err) {
            console.error(err);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
 
        }
        if (stderr) {
            console.error(stderr);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
 
        }
 
    });

    const exec2 = require('child_process').exec;
    const cmd2 =  'cd '+CWD+'/bin && ./dictionnary_lookup ../utils/dico_fr.lex ' + mot.toUpperCase();
    exec2(cmd2, (err, stdout, stderr) => {
        // check if the program has returned code 0
        if (err) {
            console.error(err);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
      
        }
        if (stderr) {
            console.error(stderr);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
      
        }
        if(stdout == "0")
            return res.status(200).json({
            status: 'success',
            message: 'Recherche réussie.',
        });
        return res.status(400).json({
            status: 'error',
            message: 'Recherche réussie.',
        });
    });
}


    




module.exports = {
    getGrille: getGrille,
    verifMot: verifMot
}

