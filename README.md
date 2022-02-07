![ferryhandy](./public/logo.png)

A easy drag-and-drop file server, intended to make transferring files between computers easier.

## Install

Use npm to install

```
$ git clone https://github.com/wyattfry/ferryhandy
$ cd ./ferryhandy
$ npm install
```

## Run

Use npm to run

```
$ npm start

> ferryhandy@1.0.0 start
> nodemon app.js

[nodemon] 2.0.15
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node app.js`
listening on port 8080
```

Then open http://localhost:8080/ in a browser, drag a file to the page and drop anywhere. Once it's uploaded, three keywords will appear. Type the three keywords in the textbox and press `Enter` and it the file will be downloaded. The server will automatically delete files after a while.

## Configure

The following values can be set via environment variables:

|Variable|Default|Purpose|
|--|--|--|
|PORT|8080|The port on which the server runs|
|MAX_FILE_AGE_MS|30000 (30s)|Uploaded files older than this will be deleted|
|DELETE_JOB_INTERVAL_MS|5000 (5s)|How often to scan for files to delete|
