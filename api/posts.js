const { SUPABASE_URL, SUPABASE_KEY } = require('./shared.js');

module.exports = async (req, res) => {
    try {
        if (req.method === "GET") {
            const { username } = req.query;
            
            // Grabs posts and instantly maps comments sorted by creation timeline
            let url = `${SUPABASE_URL}/rest/v1/posts?select=*,comments(* order by id.asc)&order=id.desc`;
            
            if (username) {
                url = `${SUPABASE_URL}/rest/v1/posts?select=*,comments(* order by id.asc)&username=eq.${encodeURIComponent(username)}&order=id.desc`;
            }

            const dbRes = await fetch(url, { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } });
            const posts = await dbRes.json();

            const mapped = posts.map(p => ({ 
                id: p.id, 
                username: p.username, 
                pfpLetter: p.pfp_letter, 
                content: p.content, 
                fire: p.fire, 
                heart: p.heart,
                comments: p.comments ? p.comments.map(c => ({
                    id: c.id,
                    username: c.username,
                    pfpLetter: c.pfp_letter,
                    content: c.content
                })) : []
            }));
            
            res.setHeader("Cache-Control", "no-cache");
            return res.status(200).json(mapped);
        }

        if (req.method === "POST") {
            const data = req.body;
            
            await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
                method: "POST",
                headers: { 
                    "apikey": SUPABASE_KEY, 
                    "Authorization": `Bearer ${SUPABASE_KEY}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ username: data.username, pfp_letter: data.pfpLetter, content: data.content })
            });

            return res.status(201).json({ success: true });
        }
    } catch (err) {
        return res.status(500).send(err.toString());
    }
};

