import React from "react";
import { ArtistType } from "./types";

function Player({ artist }: { artist: ArtistType }): JSX.Element {
  if (!artist.spotifyId) {
    return (
      <p className="no-music">
        Can&apos;t find music on Spotify :( try{" "}
        <a
          href={`https://www.google.com/search?q='${encodeURI(
            artist.name
          )}'+band`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google?
        </a>
      </p>
    );
  }
  return (
    <iframe
      key={artist.spotifyId}
      src={`https://open.spotify.com/embed?uri=spotify:artist:${artist.spotifyId}`}
      width="250"
      height="80"
      frameBorder="0"
      style={{
        gridArea: "1 / 1 / 1 / 1",
      }}
      allow="encrypted-media"
      title={`Spotify Player for ${artist.name}`}
    />
  );
}

export { Player };
