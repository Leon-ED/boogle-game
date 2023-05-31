const env = require('dotenv').config();
const auth = require('./auth');
const base = require('./base');




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
        const newpath = process.env.UPLOAD_DIR + user.idUser + '_picture.png';
        fs.copyFile(files.file.filepath, newpath, function (err) {
            if (err) {
                console.log(err);
                res.status(400).json({
                    status: 'error',
                    message: 'Une erreur est survenue lors de l\'upload du fichier.'
                });
                return;
            }
            conn.query(conn, 'UPDATE user SET photoProfil = ? WHERE idUser = ?', [newpath, user.idUser]);
            conn.end();

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
    upload
}
