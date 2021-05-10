const ky = require("ky-universal");

exports.handler = async function (event, context) {
    try {
        if (!process.env.SPOTIFY_AUTH_TOKEN || Date.now() > process.env.SPOTIFY_AUTH_TOKEN_EXPIRY_DATE) {
            const response = await ky.post("https://accounts.spotify.com/api/token", {
                body: new URLSearchParams({ grant_type: "client_credentials" }),
                headers: {
                    Authorization: `Basic ${new Buffer(
                        process.env.SPOTIFY_CLIENT_ID +
                        ":" +
                        process.env.SPOTIFY_CLIENT_SECRET
                    ).toString("base64")}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
            const parsedResponse = await response.json();
            process.env.SPOTIFY_AUTH_TOKEN = parsedResponse.access_token;
            process.env.SPOTIFY_AUTH_TOKEN_EXPIRY_DATE = parsedResponse.expires_in;
        }

        const { name } = event.queryStringParameters;
        const response = await ky.get("https://api.spotify.com/v1/search", {
            searchParams: {
                q: name,
                type: "artist",
                apikey: process.env.SPOTIFY_API_KEY
            },
            headers: {
                Authorization: `Bearer ${process.env.SPOTIFY_AUTH_TOKEN}`
            }
        });
        const spotifyArtistResults = await response.json();
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