

getGrille = function (req, res, next)  {
    console.log('Recherche de grille de taille ' + req.params.longueur + 'x' + req.params.largeur);
    const exec = require('child_process').exec;
    const lignes = req.params.lignes;
    const colonnes = req.params.colonnes;
    exec('cd /usr/src/app/bin && ./grid_build ../utils/frequences.txt ' + lignes + ' ' + colonnes, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
            return;
        }
        if (stderr) {
            console.error(stderr);
            res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'Recherche réussie.',
            grille: stdout
        });
    });



}




module.exports = {
    getGrille: getGrille
}

