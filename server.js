const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;

// Chemin vers le fichier de données de suivi
const trackingDataPath = path.join(__dirname, 'trackingData.json');

// Configuration de Multer avec stockage personnalisé
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

// Filtre pour s'assurer que seules les images sont uploadées
const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Seuls les fichiers image sont autorisés!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

// Sert les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route pour uploader un fichier
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({ success: false, message: 'Pas de fichier uploadé' });
    }

    // Générer un identifiant unique pour l'image
    const trackingId = uuidv4();
    const imageName = file.filename;

    // Construire l'URL pour l'image uploadée avec le trackingId
    const imageUrl = `http://localhost:${port}/image/${imageName}/${trackingId}`;

    // Ajouter l'entrée de suivi dans le fichier de suivi
    let trackingData = [];
    if (fs.existsSync(trackingDataPath)) {
        trackingData = JSON.parse(fs.readFileSync(trackingDataPath));
    }
    trackingData.push({
        imageName,
        trackingId,
        imageUrl, // Ajout de l'URL de l'image
        timestamp: new Date().toISOString()
    });
    fs.writeFileSync(trackingDataPath, JSON.stringify(trackingData, null, 2));

    // Envoyer la réponse avec l'URL et le trackingId
    res.send({ success: true, imageUrl, htmlCode: `<img src="${imageUrl}" alt="Image Suivie" />` });
});
// Route pour servir l'image et enregistrer les données de suivi
app.get('/image/:imageName/:trackingId', (req, res) => {
    const imageName = req.params.imageName;
    const trackingId = req.params.trackingId;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

    // Lecture des données de suivi existantes
    let trackingData = [];
    if (fs.existsSync(trackingDataPath)) {
        trackingData = JSON.parse(fs.readFileSync(trackingDataPath));
    }

    // Ajouter une nouvelle entrée de suivi pour chaque accès
    trackingData.push({
        imageName,
        trackingId,
        ipAddress,
        timestamp: new Date().toISOString()
    });

    // Écriture des données de suivi mises à jour
    fs.writeFileSync(trackingDataPath, JSON.stringify(trackingData, null, 2));

    // Servir l'image
    const imagePath = path.join(__dirname, 'public', imageName);
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).send('Image non trouvée');
    }
});


// Route pour afficher les données de suivi
app.get('/tracking-data', (req, res) => {
    if (fs.existsSync(trackingDataPath)) {
        const trackingData = JSON.parse(fs.readFileSync(trackingDataPath));
        res.json(trackingData);
    } else {
        res.json([]);
    }
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
});
