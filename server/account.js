const env = require('dotenv').config();
const auth = require('./auth');
const base = require('./base');




function getPicture(req, res, next) {
    const idUser = req.params.idUser;
    const path = process.env.UPLOAD_DIR + idUser + '_picture.png';
    if (!require('fs').existsSync(path)) {
        return res.sendFile(process.env.UPLOAD_DIR + 'default.png');
    }
    return res.sendFile(path);
}

async function getProfile(req, res, next) {
    const idUser = req.params.idUser;
    const conn = await base.getBase();
    const [rows] = await conn.query('SELECT `idUser`, `login`, `photoProfil` FROM `utilisateur` WHERE `idUser` = ?;', [idUser]);
    
    await conn.end();
    if (!rows || rows.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Utilisateur introuvable.'
        });
    }
    return res.status(200).json({
        status: 'success',
        message: 'Utilisateur trouvé.',
        data: rows
    });
}



async function upload(req, res, next) {
    const formidable = require('formidable');
    const form = new formidable.IncomingForm();
    const conn = await base.getBase();

    form.parse(req, async function (err, fields, files) {
        const token = fields.token;
        const user = await auth.returnUserFromToken(token);
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Token invalide.'
            });
            return;
        }
        const fs = require('fs');
        const newName = user.idUser + '_picture.png';
        const newpath = process.env.UPLOAD_DIR + newName;
        fs.copyFile(files.file.filepath, newpath, async function (err) {
            if (err) {
                console.log(err);
                res.status(400).json({
                    status: 'error',
                    message: 'Une erreur est survenue lors de l\'upload du fichier.'
                });
                return;
            }
            await conn.query('UPDATE `utilisateur` SET `photoProfil` = ? WHERE `utilisateur`.`idUser` = ?;', [newName, user.idUser]);
            await conn.end();

            res.status(200).json({
                status: 'success',
                message: 'Upload réussi.'
            });
        }
        );
    });


    // console.log("uploading");
    // const formidable = require('formidable');
    // // const user = await auth.returnUserFromToken(token);
    // // console.log(token);
    // // if (!user) {
    // //     res.status(401).json({
    // //         status: 'error',
    // //         message: 'Token invalide.'
    // //     });
    // //     return;
    // // }
    // // const fileName = env.UPLOAD_DIR  + '.png';

    // const fs = require('fs');
    // const form = new formidable.IncomingForm();
    // //get token from body of form
    // const token = req.body.token;
    // console.log(token);

    // form.parse(req, function (err, fields, files) {
    //     const newpath = process.env.UPLOAD_DIR + user.idUser + '.png';
    //    // save file to disk
    //     fs.copyFile(files.file.filepath, newpath, function (err) {
    //         if (err) {
    //             console.log(err);
    //             res.status(400).json({
    //                 status: 'error',
    //                 message: 'Une erreur est survenue lors de l\'upload du fichier.'
    //             });
    //             return;
    //         }
    //         res.status(200).json({
    //             status: 'success',
    //             message: 'Upload réussi.'
    //         });
    //     }
    //     );

    // });

}



module.exports = {
    upload,
    getPicture,
    getProfile
}
