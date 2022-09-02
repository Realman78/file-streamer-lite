const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require("fs")
const mime = require("mime-types")
/**
 * Stream from url (or file path) to res.
 * @param req The Express request object (optional if working with file path).
 * @param {string} urlFromSource url from source.
 * @param res The Express request object.
 */
const stream = async (req, urlFromSource, res) => {
    if (!isValidHttpUrl(urlFromSource)) {
        try {
            const range = req.headers.range;
            const videoSize = fs.statSync(urlFromSource).size;
    
            const chunkSize = 1 * 1e+6;
            const start = Number(range.replace(/\D/g, ''));
            const end = Math.min(start + chunkSize, videoSize - 1);
    
            const contentLength = end - start + 1;
    
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": mime.lookup(urlFromSource.replace(/^.*[\\\/]/, ''))
            }
            res.writeHead(206, headers);
    
            const stream = fs.createReadStream(urlFromSource, { start, end })
            stream.pipe(res);
        }catch(e) {
            console.log(e)
        }
        return
    }
    try {
        const abortController = new AbortController();
        req.on('error', () => {
            abortController.abort();
        });

        if (req.headers.range) {
            const response = await fetch(urlFromSource, {
                headers: {
                    Range: req.headers.range
                },
                signal: abortController.signal
            })
            res.setHeader('accept-ranges', response.headers.get('accept-ranges'));
            res.setHeader('Content-Length', response.headers.get('content-length'));
            res.setHeader('Content-Type', response.headers.get('content-type'));
            res.setHeader('Content-Range', response.headers.get('content-range'));
            res.status(206)
            if (response.body)
                response.body.pipe(res)
            else res.status(204).send("No content")
            return
        }
        const response = await fetch(urlFromSource, {
            signal: abortController.signal,
        });
        res.setHeader('accept-ranges', response.headers.get('accept-ranges'));
        res.setHeader('Content-Length', response.headers.get('content-length'));
        res.setHeader('Content-Type', response.headers.get('content-type'));
        if (response.body)
            response.body.pipe(res)
        else res.status(204).send("No content")
    } catch (e) {
        console.log(e)
    }
}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

module.exports = stream