import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const sites = {
    GitHub: {
        url: (u) => `https://github.com/${u}`,
        errorStatus: 404
    },
    Reddit: {
        url: (u) => `https://www.reddit.com/user/${u}/about.json`,
        errorStatus: 404
    },
    Twitter_X: {
        url: (u) => `https://twitter.com/${u}`,
        errorStatus: 404
    },
    TikTok: {
        url: (u) => `https://www.tiktok.com/@${u}`,
        errorStatus: 404
    }
};

app.post('/api/check', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Nincs megadva felhasználónév!' });

    const results = {};

    const checks = Object.keys(sites).map(async (platformName) => {
        const site = sites[platformName];
        const targetUrl = site.url(username);

        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                redirect: 'follow'
            });

            if (response.status !== site.errorStatus) {
                results[platformName] = { exists: true, url: targetUrl };
            } else {
                results[platformName] = { exists: false };
            }
        } catch (error) {
            results[platformName] = { exists: false, error: 'Blocked/Timeout' };
        }
    });

    await Promise.all(checks);
    res.json(results);
});

// Fontos: a Render által osztott portot használja, vagy helyi tesztnél a 3000-et
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT} porton!`));