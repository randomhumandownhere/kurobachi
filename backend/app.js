import express from 'express';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PROJECT_JWKS = createRemoteJWKSet(
    new URL(`https://${process.env.SUPABASE_ID}.supabase.co/auth/v1/.well-known/jwks.json`)
)

async function verifyProjectJWT(jwt) {
    return jwtVerify(jwt, PROJECT_JWKS)
}

const supabase = createClient(`https://${process.env.SUPABASE_ID}.supabase.co`, process.env.SUPABASE_KEY)

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { payload } = await verifyProjectJWT(token);

        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: err });
    }
}

app.get('/list', authMiddleware, async (req, res) => {
    const { data, error } = await supabase
        .from('tracker')
        .select('url')
        .eq('user_id', req.user.sub)

    if (error) console.error('err:', error);
    
    const urlCounts = {}

    for (const row of data) {
        const url = row.url
        if (!url) continue

        if (!urlCounts[url]) {
            urlCounts[url] = 1
        } else {
            urlCounts[url] += 1
        }
    }
    console.log(urlCounts);
    res.json({ message: 'success', data: urlCounts });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
