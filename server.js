// server.js
// where your node app starts

// init project
const express = require("express");
const path = require("path");
const app = express();
const ky = require("ky-universal");

// PWAs and location requests want HTTPS!
function checkHttps(request, response, next) {
  // Check the protocol — if http, redirect to https.
  if (request.get("X-Forwarded-Proto").indexOf("https") != -1) {
    return next();
  } else {
    response.redirect("https://" + request.hostname + request.url);
  }
}

app.get("*", checkHttps);

// Return a date of format 2019-01-01
const dateString = date => {
  return [
    date.getFullYear(),
    ("0" + (date.getMonth() + 1)).slice(-2),
    ("0" + date.getDate()).slice(-2)
  ].join("-");
};

app.get("/api/events", async function(req, res) {
  const { lat, lng } = req.query;
  try {
    const response = await ky.get(
      "https://api.songkick.com/api/3.0/events.json?",
      {
        searchParams: {
          location: `geo:${lat},${lng}`,
          min_date: dateString(new Date()),
          max_date: dateString(new Date()),
          apikey: process.env.SONGKICK_API_KEY,
          type: "Concert"
        }
      }
    );
    const songkickData = await response.json();
    const events = songkickData.resultsPage.results.event;
    if (events) {
      const filteredEvents = events.filter(event => event.status === "ok");
      res.status(200);
      res.json(filteredEvents);
    } else {
      res.status(404);
      res.json("No results");
    }
  } catch (error) {
    console.error(error);
    res.status(500);
    res.json(error);
  }
});

let spotifyAuthToken;
let spotifyAuthTokenExpiryDate;

app.get("/api/artist/by/name", async function(req, res) {
  try {
    if (!spotifyAuthToken || Date.now() > spotifyAuthTokenExpiryDate) {
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
      spotifyAuthToken = parsedResponse.access_token;
      spotifyAuthTokenExpiryDate = parsedResponse.expires_in;
    }

    const { name } = req.query;
    const response = await ky.get("https://api.spotify.com/v1/search", {
      searchParams: {
        q: name,
        type: "artist",
        apikey: process.env.SPOTIFY_API_KEY
      },
      headers: {
        Authorization: `Bearer ${spotifyAuthToken}`
      }
    });
    const spotifyArtistResults = await response.json();
    const firstResult = spotifyArtistResults.artists.items[0];
    if (firstResult) {
      res.status(200);
      res.json(firstResult);
    } else {
      res.status(404);
      res.json("No results");
    }
  } catch (error) {
    console.error(error);
    res.status(500);
    res.json(error);
  }
});

// Express port-switching logic
let port;
console.log("❇️ NODE_ENV is", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  port = process.env.PORT || 3000;
  app.use(express.static(path.join(__dirname, "/build")));
  app.get("*", (request, response) => {
    response.sendFile(path.join(__dirname, "build", "index.html"));
  });
} else {
  port = 3001;
  console.log("⚠️ Not seeing your changes as you develop?");
  console.log(
    "⚠️ Do you need to set 'start': 'npm run development' in package.json?"
  );
}

// Start the listener!
const listener = app.listen(port, () => {
  console.log("❇️ Express server is running on port", listener.address().port);
});
