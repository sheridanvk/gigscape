import React, { useEffect, useMemo, useState } from "react";
import ky from "ky/umd";

export default function Event({ event }) {
  const artists = useMemo(
    () => event.performance.map(performance => performance.artist),
    [event]
  );
  const [artistIndex, setArtistIndex] = useState(0);
  const [spotifyInfoLoaded, setSpotifyInfoLoaded] = useState(false);
  const [currentArtistSpotify, setCurrentArtistSpotify] = useState(null);

  useEffect(() => {
    async function getSpotifyInfo(artistName) {
      setSpotifyInfoLoaded(false);
      try {
        const spotifyInfo = await ky
          .get("https://gigscape.glitch.me/api/artist/by/name", {
            searchParams: { name: artistName }
          })
          .json();
        setCurrentArtistSpotify(spotifyInfo);
      } catch (error) {
        setCurrentArtistSpotify(undefined);
      }
      setSpotifyInfoLoaded(true);
    }
    getSpotifyInfo(artists[artistIndex].displayName);
  }, [artistIndex, artists]);

  const playerHTML = useMemo(() => {
    if (spotifyInfoLoaded && !currentArtistSpotify) {
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
          {spotifyInfoLoaded && (
            <iframe
              key={currentArtistSpotify.id}
              src={`https://open.spotify.com/embed?uri=spotify:artist:${currentArtistSpotify.id}`}
              width="250"
              height="80"
              frameBorder="0"
              style={{
                gridArea: "1 / 1 / 1 / 1"
              }}
              allowtransparency="true"
              allow="encrypted-media"
              title={`Spotify Player for ${artists[artistIndex].displayName}`}
            />
          )}
        </div>
      );
    }
  }, [artists, artistIndex, currentArtistSpotify, spotifyInfoLoaded]);

  return (
    <div id="inset">
      <div className="row">
        <div className="time">
          <p>{event.start.time || 'Check listing'}</p>
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
