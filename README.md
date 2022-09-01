
# file-streamer-lite

An npm package used for streaming files from a remote URL to your client.

Example usages: Video streaming, audio streaming.

## Install

    npm install streamer-express-lite

## Demo

**Client side: index.html**

    <video id="videoPlayer" width="650" controls autoplay>
        <source src="/video" type="video/mp4"/>
    </video>

**Server side: index.js**

    const express = require('express')
    const stream = require("streamer-express-lite")
    const app = express()
    const url = 'https://file-examples.com/storage/febff38cc26310eb29aeb82/2017/04/file_example_MP4_1280_10MG.mp4';

    app.get('/', (req, res) => {
        res.sendFile(__dirname + "/index.html")
    })

    app.get('/video', async (req, res) => {
        stream(req, url, res)
    })

    app.listen(3000, () => {
        console.log("Server is up and running on port 3000")
    })

Your video should be playing now.


Support for TypeScript coming soon.


## Author

[@Realman78](https://github.com/Realman78)

