const { SUPABASE_URL, SUPABASE_KEY } = require('./shared.js');

module.exports = async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    
    try {
        const { postId, username, pfpLetter, content } = req.body; 
        if (!postId || !username || !content) return res.status(400).json({ error: "Missing block data!" });

        const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
            method: "POST",
            headers: { 
                "apikey": SUPABASE_KEY, 
                "Authorization": `Bearer ${SUPABASE_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                post_id: postId, 
                username: username, 
                pfp_letter: pfpLetter || username.charAt(0).toUpperCase(), 
                content: content 
            })
        });

        if (!dbRes.ok) return res.status(500).json({ error: "Failed to build comment circuit." });

        return res.status(201).json({ success: true });
    } catch (err) {
        return res.status(500).send(err.toString());
    }
};
