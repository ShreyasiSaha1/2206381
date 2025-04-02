require('dotenv').config(); 
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const testServer = process.env.TEST_SERVER;

let accessToken = "";
let tokenExpiry = 0;

const fetchToken = async () => {
    try {
        const data = {
            email: process.env.EMAIL,
            name: process.env.NAME,
            rollNo: process.env.ROLL_NO,
            accessCode: process.env.ACCESS_CODE,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        };
        const response = await axios.post(`${testServer}/auth`, data);
        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + 3600 * 1000; // Assuming token validity is 1 hour
        console.log("Access Token Fetched Successfully");
    } catch (error) {
        console.error("Error while obtaining access token:", error.response?.data || error.message);
    }
};

// Middleware to ensure valid access token
const authMiddleware = async (req, res, next) => {
    if (!accessToken || Date.now() >= tokenExpiry) {
        await fetchToken();
    }
    if (!accessToken) {
        return res.status(401).json({ error: "Unable to fetch authentication token" });
    }
    req.headers["Authorization"] = `Bearer ${accessToken}`;
    next();
};

// Fetch top users
app.get('/users', authMiddleware, async (req, res) => {
    try {
        const usersResponse = await axios.get(`${testServer}/users`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const postsResponse = await axios.get(`${testServer}/posts`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const users = usersResponse.data;
        const posts = postsResponse.data;

        const userPostCount = {};
        posts.forEach(post => {
            userPostCount[post.userId] = (userPostCount[post.userId] || 0) + 1;
        });

        const topUsers = Object.entries(userPostCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([userId]) => users.find(user => user.id == userId));

        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// Fetch top/latest posts
app.get('/posts', authMiddleware, async (req, res) => {
    try {
        const { type = 'latest' } = req.query;
        const postsResponse = await axios.get(`${testServer}/posts`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const commentsResponse = await axios.get(`${testServer}/comments`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const posts = postsResponse.data;
        const comments = commentsResponse.data;

        if (type === 'popular') {
            const postCommentCount = {};
            comments.forEach(comment => {
                postCommentCount[comment.postId] = (postCommentCount[comment.postId] || 0) + 1;
            });

            const maxComments = Math.max(...Object.values(postCommentCount), 0);
            const popularPosts = posts.filter(post => (postCommentCount[post.id] || 0) === maxComments);
            res.json(popularPosts);
        } else if (type === 'latest') {
            const latestPosts = posts.sort((a, b) => b.id - a.id).slice(0, 5);
            res.json(latestPosts);
        } else {
            res.status(400).json({ error: "Invalid type parameter. Use 'latest' or 'popular'." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// Fetch comments for a specific post
app.get('/posts/:postid/comments', authMiddleware, async (req, res) => {
    try {
        const { postid } = req.params;
        const commentsResponse = await axios.get(`${testServer}/posts/${postid}/comments`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        res.json(commentsResponse.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
