const env = require('dotenv').config();
const formidable = require('formidable');
const fs = require('fs');
const auth = require('./auth');
const base = require('./base');

/**
 * Récupère la photo de profil d'un utilisateur,
 * si elle n'est pas dans la BDD, on retourne une image par défaut.
 * Sinon on récupère l'encodable base64 de l'image,
 * on la convertit en buffer et on l'envoie au client, prête à être affichée
 */
async function getPicture(req, res) {
  const { idUser } = req.params;
  const conn = await base.getBase();
  const [rows] = await conn.query('SELECT `photoProfil` FROM `utilisateur` WHERE `idUser` = ?;', [idUser]);
  await conn.end();
  if (!rows || rows.length === 0 || rows.photoProfil == null) {
    return res.sendFile(`${process.env.UPLOAD_DIR}default.png`);
  }
  const base64Data = rows.photoProfil.replace(/^data:image\/png;base64,/, '');
  const img = Buffer.from(base64Data, 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length,
  });
  return res.end(img);
}

/**
 * Récupère les informations publiques d'un utilisateur :
 * - idUser
 * - login (en BDD), qui est le pseudo
 * - photoProfil (en BDD), qui est le code base64 de la photo de profil
 */
async function getProfile(req, res) {
  const { idUser } = req.params;
  const conn = await base.getBase();
  const [rows] = await conn.query('SELECT `idUser`, `pseudoUser`, `photoProfil`, `email` FROM `utilisateur` WHERE `idUser` = ?;', [idUser]);

  await conn.end();
  if (!rows || rows.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Utilisateur introuvable.',
    });
  }
  return res.status(200).json({
    status: 'success',
    message: 'Utilisateur trouvé.',
    data: rows,
  });
}

/**
 * Upload la photo de profil d'un utilisateur.
 * On reçoit un fichier, on le convertit en base64, on le stocke dans la BDD.
 * On ne stocke pas le fichier sur le disque.
 *
 * */
async function upload(req, res) {
  const form = new formidable.IncomingForm();
  const conn = await base.getBase();

  form.parse(req, async (err, fields, files) => {
    const { token } = fields;
    const user = await auth.returnUserFromToken(token);
    // Utilisateur pas connecté, on refuse l'upload
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Token invalide.',
      });
      return;
    }
    if (files.file.size > env.MAX_UPLOAD_SIZE * 1024 * 1024) {
      res.status(400).json({
        status: 'error',
        message: `Le fichier est trop volumineux.Max ${env.MAX_UPLOAD_SIZE}Mo.`,
      });
      return;
    }
    // On lit le fichier en base64
    const base64 = fs.readFileSync(files.file.filepath, { encoding: 'base64' });
    // On supprime le fichier temporaire
    fs.unlinkSync(files.file.filepath);
    // On met à jour la BDD
    const dataUrl = `data:image/png;base64,${base64}`;
    await conn.query('UPDATE `utilisateur` SET `photoProfil` = ? WHERE `utilisateur`.`idUser` = ?;', [dataUrl, user.idUser]);
    await conn.end();

    res.status(200).json({
      status: 'success',
      message: 'Upload réussi.',
    });
  });
}

module.exports = {
  upload,
  getPicture,
  getProfile,
};
