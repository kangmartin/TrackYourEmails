const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

const trackingDataPath = path.join(__dirname, 'trackingData.json');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});


const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Seuls les fichiers image sont autorisés!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });


app.use(express.static(path.join(__dirname, 'public')));

// Route pour uploader un fichier
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({ success: false, message: 'Pas de fichier uploadé' });
    }


    const trackingId = uuidv4();
    const imageName = file.filename;


    const imageUrl = `${baseUrl}/image/${file.filename}/${trackingId}`;


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


    res.send({ success: true, imageUrl, htmlCode: `<img src="${imageUrl}" alt="Followed image" />` });
});

// Route pour servir l'image et enregistrer les données de suivi
app.get('/image/:imageName/:trackingId', (req, res) => {
    const imageName = req.params.imageName;
    const trackingId = req.params.trackingId;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;


    let trackingData = [];
    if (fs.existsSync(trackingDataPath)) {
        trackingData = JSON.parse(fs.readFileSync(trackingDataPath));
    }


    trackingData.push({
        imageName,
        trackingId,
        ipAddress,
        timestamp: new Date().toISOString()
    });

    fs.writeFileSync(trackingDataPath, JSON.stringify(trackingData, null, 2));


    const imagePath = path.join(__dirname, 'public', imageName);
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).send('Données de suivi non trouvées');
    }
});



app.get('/tracking-data', (req, res) => {
    if (fs.existsSync(trackingDataPath)) {
        const trackingData = JSON.parse(fs.readFileSync(trackingDataPath));
        res.json(trackingData);
    } else {
        res.json([]);
    }
});


app.listen(port, () => {
    console.log(`Serveur lancé sur le port ${port}`);
});
