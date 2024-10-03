const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS sebagai template engine
app.set('view engine', 'ejs');

// Set folder static untuk file CSS dan JS
app.use(express.static('css'));
app.use(express.static('js'));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Setup untuk menyimpan file yang di-upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Menyimpan file di folder 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Menggunakan nama asli file yang di-upload
  }
});

const upload = multer({ storage: storage });

// Halaman Upload
app.get('/', (req, res) => {
  res.render('index');
});

// Meng-handle file yang di-upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.send('Please upload a file');
  }

  // Ambil nama file dan type
  const fileData = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    timestamp: new Date().toISOString()
  };

  // Baca file JSON yang ada
  const jsonFilePath = 'fileData.json';
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    let jsonArray = [];
    if (!err) {
      jsonArray = JSON.parse(data);
    }

    // Tambahkan data file baru
    jsonArray.push(fileData);

    // Simpan kembali ke file JSON
    fs.writeFile(jsonFilePath, JSON.stringify(jsonArray, null, 2), (err) => {
      if (err) {
        console.error('Error writing to JSON file', err);
      }
    });
  });

  // Redirect ke halaman uploads.ejs dengan nama file
  res.redirect(`/uploads?filename=${encodeURIComponent(req.file.originalname)}`);
});

// Halaman untuk menampilkan file yang di-upload
app.get('/uploads', (req, res) => {
  const fileName = req.query.filename;
  res.render('uploads', { fileName });
});

// Port untuk menjalankan server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
