const express = require('express');
const morgan = require('morgan');
const upload = require('express-fileupload');
const randomWords = require('random-words');
const path = require('path');
const fs = require('fs');

// set port from environment variable, or 8080
const PORT = process.env.PORT || 8080;
const MAX_FILE_AGE_MS = process.env.MAX_FILE_AGE_MS || 30 * 1000;
const DELETE_JOB_INTERVAL_MS = process.env.DELETE_JOB_INTERVAL_MS || 5 * 1000;

const app = express();

// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // this is to handle URL encoded data
app.use(upload());
app.use(express.static(path.join(__dirname, 'public'))); // enable static files pointing to the folder "public"

// routes
app.get('/download/:keywords', (request, response) => {
  const keywords = `${request.params.keywords}.`;
  // TODO validate
  const filedir = `${process.cwd()}/files/`;
  fs.readdir(filedir, (readdirerr, files) => {
    if (readdirerr) {
      response.status(500, readdirerr);
      response.end();
      return;
    }
    const filename = files.filter((x) => x.startsWith(keywords))[0];
    if (!filename) {
      response.statusCode = 404;
      response.end();
      return;
    }
    const originalName = filename.split('.').slice(3).join('.'); // remove keywords prefix to get original filename
    response.download(`${__dirname}/files/${filename}`, originalName, (downloaderr) => {
      response.status(500, downloaderr);
      response.end();
    });
  });
});

// HTTP POST
// upload files to server
app.post('/upload', (request, response) => {
  if (request.files) {
    const { file } = request.files;
    const rwords = randomWords(3).join('.');
    const filename = `${rwords}.${file.name}`;
    file.mv(`./files/${filename}`)
      .then(() => response.json(rwords));
  }
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));

// delete old files
function deleteOldFiles() {
  const filedir = `${process.cwd()}/files/`;
  fs.readdir(filedir, (readdirerr, files) => {
    if (readdirerr) {
      console.error('failed to read directory');
      return;
    }
    for (let i = 0; i < files.length; i += 1) {
      const file = `${process.cwd()}/files/${files[i]}`;
      fs.stat(file, (staterr, stats) => {
        const { birthtime } = stats;
        const age = Date.now() - birthtime;
        if (age > MAX_FILE_AGE_MS) {
          fs.unlink(file, (unlinkerr) => {
            if (unlinkerr) {
              console.error('failed to delete file', file);
              return;
            }
            console.log('Deleted', file);
          });
        }
      });
    }
  });
}

setInterval(deleteOldFiles, DELETE_JOB_INTERVAL_MS);
