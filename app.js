const express = require('express');
const rateLimit = require('express-rate-limit')
const morgan = require('morgan');
const upload = require('express-fileupload');
const randomWords = require('random-words');
const humanReadable = require('@tsmx/human-readable');
const path = require('path');
const fs = require('fs');

// set port from environment variable, or 8080
const PORT = process.env.PORT || 8080;
const MAX_FILE_AGE_MS = process.env.MAX_FILE_AGE_MS || 10 * 60 * 1000;
const DELETE_JOB_INTERVAL_MS = process.env.DELETE_JOB_INTERVAL_MS || 5 * 1000;
const MAX_FILE_SIZE = 500 * 1000000;
const app = express();

console.log('Max file size allowed:', humanReadable.fromBytes(MAX_FILE_SIZE));

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 1, // Limit each IP to 100 requests per `window` (here, per 1 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use('/upload', apiLimiter)

// middleware
app.use(morgan('dev'));
app.use((req, res, next) => {
    const length = parseInt(req.header('content-length'), 10);
    if (length > MAX_FILE_SIZE) {
        res.status(400);
        res.statusText = `File size ${humanReadable.fromBytes(length)} exceeds max allowed ${humanReadable.fromBytes(MAX_FILE_SIZE)}`;
    } else {
        next();
    }
});
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // this is to handle URL encoded data
app.use(upload());
app.use(express.static(path.join(__dirname, 'public'))); // enable static files pointing to the folder "public"


// routes
app.get('/download/:keywords', (request, response) => {
    const keywords = `${request.params.keywords}.`
        .trim()
        .toLocaleLowerCase()
        .substring(0, 50)
        .split(' ')
        .join('.');

    // TODO validate
    const filedir = path.join(__dirname, 'files');
    fs.readdir(filedir, (readdirerr, files) => {
        if (readdirerr) {
            console.error('failed to read directory', readdirerr);
            response.statusText = JSON.stringify(readdirerr);
            response.status(500);
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
        const filepath = path.join(__dirname, 'files', filename);
        response.download(filepath, originalName, (downloaderr) => {
            response.statusText = downloaderr
            response.status(500);
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
        const targetpath = path.join(__dirname, 'files', filename);
        file.mv(targetpath)
            .then(() => response.json(rwords));
    }
});

try {
    fs.mkdirSync('files', {});
} catch (error) {
    if (error.code !== 'EEXIST') {
        console.error(error);
    }
}

app.listen(PORT, () => console.log(`listening on port ${PORT}`));

// delete old files
function deleteOldFiles() {
    const filedir = path.join(__dirname, 'files');
    fs.readdir(filedir, (readdirerr, files) => {
        if (readdirerr) {
            console.error('failed to read directory', readdirerr);
            return;
        }
        for (let i = 0; i < files.length; i += 1) {
            const file = path.join(__dirname, 'files', files[i]);
            fs.stat(file, (staterr, stats) => {
                if (staterr) {
                    console.error('failed to get status of file', file, staterr);
                    return;
                }
                const { birthtime } = stats;
                const age = Date.now() - birthtime;
                if (age > MAX_FILE_AGE_MS) {
                    fs.unlink(file, (unlinkerr) => {
                        if (unlinkerr) {
                            console.error('failed to delete file', file, unlinkerr);
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
