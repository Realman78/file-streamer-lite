const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const stream = async (req, urlFromSource, res, range) => {
    try {
        const abortController = new AbortController();
        req.on('error', () => {
            abortController.abort();
        });

        if (req.headers.range) {
            const response = await fetch(urlFromSource, {
                headers: {
                    Range: range || req.headers.range
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

module.exports = stream