import React, { useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";

const parseArtistDisplayName = (displayName) => {
  // sometimes the market is provided in parentheses after the artist name, so we split them
  const market = displayName.match(/\((.*?)\)/);
  const artistName = displayName.replace(/\ \((.*?)\)/, "");
  const result = { artistName };
  if (market) result.market = market;
  return result;
};

export default function Event({ event }) {
  const artists = useMemo(
    () => event.performance.map((performance) => performance.artist),
    [event]
  );
  const [artistIndex, setArtistIndex] = useState(0);

  const {
    isLoading,
    isError,
    data: currentArtistSpotify,
  } = useQuery(
    `artistName-${artists[artistIndex].displayName}`,
    async () =>
      (
        await axios.get(".netlify/functions/getArtistByName", {
          params: {
            name: parseArtistDisplayName(artists[artistIndex].displayName)
              .artistName,
          },
        })
      ).data
  );

  const playerHTML = useMemo(() => {
    if ((!isLoading && !currentArtistSpotify) || isError) {
      return (
        <p className="no-music">
          Can't find music on Spotify :( try{" "}
          <a
            href={`https://www.google.com/search?q='${encodeURI(
              artists[artistIndex].displayName
            )}'+band`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google?
          </a>
        </p>
      );
    } else {
      return (
        <div className="iframe-wrapper">
          <div className="iframe-loading">
            <p>Loading music...</p>
          </div>
          {!isLoading && (
            <iframe
              key={currentArtistSpotify.id}
              src={`https://open.spotify.com/embed?uri=spotify:artist:${currentArtistSpotify.id}`}
              width="250"
              height="80"
              frameBorder="0"
              style={{
                gridArea: "1 / 1 / 1 / 1",
              }}
              allowtransparency="true"
              allow="encrypted-media"
              title={`Spotify Player for ${artists[artistIndex].displayName}`}
            />
          )}
        </div>
      );
    }
  }, [artists, artistIndex, currentArtistSpotify, isLoading]);

  return (
    <div id="inset">
      <div className="row">
        <div className="time">
          <p>{event.start.time || "Check listing"}</p>
        </div>
        {artists.length > 1 && (
          <div className="carousel row">
            <button
              id="back"
              disabled={artistIndex === 0}
              className="carousel-button"
              onClick={() => setArtistIndex(artistIndex - 1)}
            ></button>
            <button
              id="forward"
              disabled={artistIndex === artists.length - 1}
              className="carousel-button"
              onClick={() => setArtistIndex(artistIndex + 1)}
            ></button>
          </div>
        )}
      </div>
      <div className="row">
        <div className="artist">
          <p className="artist-name">{artists[artistIndex].displayName}</p>
          <div className="centeredRow">
            <div className="musicPlayer">{playerHTML}</div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="venue">
          <p>{event.venue.displayName}</p>
        </div>
      </div>
      <div className="row">
        <div className="attribution">
          <a href={event.uri} target="_blank" rel="noopener noreferrer">
            Tickets and more by Songkick
          </a>
        </div>
      </div>
    </div>
  );
}
