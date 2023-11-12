const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
const dataFile = 'trackData.json';

app.use(express.static('public'));
app.use(express.json());

// Fonction pour formater la date
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
}

// Route pour générer un nouveau pixel
app.get('/generate-pixel', (req, res) => {
  const id = uuidv4();
  res.send({ id });
});

// Route pour tracker les ouvertures de mail
app.get('/track/:id', (req, res) => {
  const pixelId = req.params.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = new Date();

  const pixelData = {
    date: formatDate(now),
    ip,
  };

  let data = {};
  if (fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile));
  }
  if (!data[pixelId]) {
    data[pixelId] = [];
  }
  data[pixelId].push(pixelData);
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2)); // Format for readability

  // Envoyer un pixel transparent
  const pixel = Buffer.from([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
    0x01, 0x00, 0x80, 0xff, 0x00, 0xff, 0xff, 0xff,
    0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
    0x01, 0x00, 0x3b
  ]);

  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
  });
  res.end(pixel);
});

// Route pour obtenir les données de suivi
app.get('/get-tracking-data/:id', (req, res) => {
  const id = req.params.id;
  let data = {};
  if (fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile));
  }
  res.send(data[id] || []);
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
