// Downloads every URL into an ArrayBuffer, reporting the combined bytes received so far.
// ponytail: byte counter instead of a percentage, because Content-Length is missing or compressed behind a CDN.
export async function fetchAll(urls, onBytes) {
    let received = 0;
    return Promise.all(
        urls.map(async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
            const chunks = [];
            for (const reader = res.body.getReader(); ; ) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                onBytes((received += value.length));
            }
            return new Blob(chunks).arrayBuffer();
        })
    );
}
