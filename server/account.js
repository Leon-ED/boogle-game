const env = require('dotenv').config();
const auth = require('./auth');
const base = require('./base');




async function getPicture(req, res, next) {
    const idUser = req.params.idUser;
    const conn = await base.getBase();
    const [rows] = await conn.query('SELECT `photoProfil` FROM `utilisateur` WHERE `idUser` = ?;', [idUser]);
    await conn.end();
    if (!rows || rows.length === 0) {
        return res.sendFile(process.env.UPLOAD_DIR + 'default.png');
    }
   // create img from base64 and return it
   console.log(rows);
    const base64Data = rows.photoProfil.replace(/^data:image\/png;base64,/, "");
    const img = Buffer.from(base64Data, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
    });
    res.end(img);

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
        // max size 5MB
        if (files.file.size > 5 * 1024 * 1024) {
            res.status(400).json({
                status: 'error',
                message: 'Le fichier est trop volumineux.Max 5MB.'
            });
            return;
        }
        // encode file to base64
        const base64 = fs.readFileSync(files.file.filepath, { encoding: 'base64' });
        // delete file from disk
        fs.unlinkSync(files.file.filepath);
        // format base64 to data url
        const dataUrl = 'data:image/png;base64,' + base64;
        await conn.query('UPDATE `utilisateur` SET `photoProfil` = ? WHERE `utilisateur`.`idUser` = ?;', [dataUrl, user.idUser]);
        await conn.end();

        res.status(200).json({
            status: 'success',
            message: 'Upload réussi.'
        });




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
