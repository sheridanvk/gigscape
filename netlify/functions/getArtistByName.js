const axios = require("axios");

exports.handler = async function (event, context) {
    try {
        if (!process.env.SPOTIFY_AUTH_TOKEN || Date.now() > process.env.SPOTIFY_AUTH_TOKEN_EXPIRY_DATE) {
            const { data: response } = await axios.post(
                "https://accounts.spotify.com/api/token",
                new URLSearchParams({ grant_type: "client_credentials" }),
                {
                    headers: {
                        Authorization: `Basic ${new Buffer(
                            process.env.SPOTIFY_CLIENT_ID +
                            ":" +
                            process.env.SPOTIFY_CLIENT_SECRET
                        ).toString("base64")}`,
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );
            process.env.SPOTIFY_AUTH_TOKEN = response.access_token;
            process.env.SPOTIFY_AUTH_TOKEN_EXPIRY_DATE = response.expires_in;
        }

        const { name } = event.queryStringParameters;
        const { data: spotifyArtistResults } = await axios.get("https://api.spotify.com/v1/search", {
            params: {
                q: name,
                type: "artist",
                apikey: process.env.SPOTIFY_API_KEY
            },
        }, {
            headers: {
                Authorization: `Bearer ${process.env.SPOTIFY_AUTH_TOKEN}`
            }
        });
        const firstResult = spotifyArtistResults.artists.items[0];
        if (firstResult) {
            return {
                statusCode: 200,
                body: JSON.stringify(firstResult)
            }
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify("No results")
            }
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        }
    }
}