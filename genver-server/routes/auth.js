const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { username, email, password, orgName } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    try {
        // Check if this email is already taken
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'An account with that email already exists.' });
        }

        // Hash the password — NEVER store plain-text passwords.
        // The "10" is the salt rounds — how much computational work
        // goes into the hash. Higher = more secure but slower.
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert the new user
        const userResult = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username, email, passwordHash]
        );
        const userId = userResult.rows[0].id;

        // Create an organization owned by this new user
        const orgResult = await pool.query(
            'INSERT INTO organizations (name, owner_user_id) VALUES ($1, $2) RETURNING id',
            [orgName || `${username}'s Organization`, userId]
        );
        const orgId = orgResult.rows[0].id;

        
        const token = jwt.sign(
            { userId, orgId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, user: { id: userId, username, email }, orgId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong creating your account.' });
    }
});

module.exports = router;