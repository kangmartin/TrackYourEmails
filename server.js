const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 80;


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
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });


app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({ success: false, message: 'No file uploaded' });
    }


    const trackingId = uuidv4();
    const imageName = file.filename;


    const imageUrl = `http://localhost:${port}/image/${imageName}/${trackingId}`;


    let trackingData = [];
    if (fs.existsSync(trackingDataPath)) {
        trackingData = JSON.parse(fs.readFileSync(trackingDataPath));
    }
    trackingData.push({
        imageName,
        trackingId,
        imageUrl, 
        timestamp: new Date().toISOString()
    });
    fs.writeFileSync(trackingDataPath, JSON.stringify(trackingData, null, 2));


    res.send({ success: true, imageUrl, htmlCode: `<img src="${imageUrl}" alt="Followed image" />` });
});

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
        res.status(404).send('Image not found');
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
    console.log(`Serveur lancé sur http://localhost:${port}`);
});
