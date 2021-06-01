import { Handler } from "@netlify/functions";
import axios from "axios";

const handler: Handler = async (event, _context) => {
  try {
    if (
      !process.env.SPOTIFY_AUTH_TOKEN ||
      new Date() > new Date(process.env.SPOTIFY_AUTH_TOKEN_EXPIRY_DATE as string)
    ) {
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
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      process.env.SPOTIFY_AUTH_TOKEN = response.access_token;
      const now = new Date();
      now.setTime(now.getTime() + response.expires_in * 1000);
      process.env.SPOTIFY_AUTH_TOKEN_EXPIRY_DATE = String(now);
    }

    const { name } = event.queryStringParameters as {name: string};
    const { data: spotifyArtistResults } = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        params: {
          q: name,
          type: "artist",
        },
        headers: {
          Authorization: `Bearer ${process.env.SPOTIFY_AUTH_TOKEN}`,
        },
      }
    );
    const firstResult = spotifyArtistResults.artists.items[0];
    if (firstResult) {
      return {
        statusCode: 200,
        body: JSON.stringify(firstResult),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify("No results"),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

export { handler };
