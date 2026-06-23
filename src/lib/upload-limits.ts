// Audio is parsed for metadata in the browser and never uploaded to the
// server, so this is only a client-side sanity cap (and a soft server guard),
// not Vercel's ~4.5 MB request-body limit.
export const MAX_UPLOAD_MB = 50
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
