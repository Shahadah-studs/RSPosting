const { SUPABASE_URL, SUPABASE_KEY } = require('./shared.js');

module.exports = async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    
    try {
        const { username, password } = req.body; 
        const cleanUsername = username.trim().toLowerCase();

        const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${cleanUsername}`, {
            headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
        });
        const users = await dbRes.json();

        if (!users.length || users[0].password !== password) {
            return res.status(401).json({ error: "Wrong username or password selection!" });
        }

        return res.status(200).json({ user: { username: users[0].username, pfpLetter: users[0].pfp_letter } });
    } catch (err) {
        return res.status(500).send(err.toString());
    }
};
