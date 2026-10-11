const { SUPABASE_URL, SUPABASE_KEY } = require('./shared.js');

module.exports = async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    
    try {
        const { username, password } = req.body; 
        if (!username || !password) return res.status(400).json({ error: "Fill out all boxes!" });

        const cleanUsername = username.trim().toLowerCase();
        const pfpLetter = cleanUsername.charAt(0).toUpperCase();

        const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: "POST",
            headers: { 
                "apikey": SUPABASE_KEY, 
                "Authorization": `Bearer ${SUPABASE_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ username: cleanUsername, password: password, pfp_letter: pfpLetter })
        });

        if (dbRes.status === 409) {
            return res.status(400).json({ error: "Username already taken!" });
        }

        return res.status(201).json({ user: { username: cleanUsername, pfpLetter } });
    } catch (err) {
        return res.status(500).send(err.toString());
    }
};
