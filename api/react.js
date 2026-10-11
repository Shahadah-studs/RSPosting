const { SUPABASE_URL, SUPABASE_KEY } = require('./shared.js');

module.exports = async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    
    try {
        const { postId, type } = req.body;

        const getRes = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
            headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
        });
        const posts = await getRes.json();
        if (!posts.length) return res.status(404).send("Not Found");

        const currentCount = posts[0][type] || 0;

        await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
            method: "PATCH",
            headers: { 
                "apikey": SUPABASE_KEY, 
                "Authorization": `Bearer ${SUPABASE_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ [type]: currentCount + 1 })
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).send(err.toString());
    }
};
