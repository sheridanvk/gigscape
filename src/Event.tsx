import React, { useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { ArtistType, EventType } from "./types";
import { Player } from "./Player";

const parseArtistDisplayName = (
  displayName: string
): { artistName: string; market?: string } => {
  // sometimes the market is provided in parentheses after the artist name, so we split them
  const market = displayName.match(/\((.*?)\)/)?.[0];
  const artistName = displayName.replace(/ \((.*?)\)/, "");
  const result = { artistName } as { artistName: string; market?: string };
  if (market) result.market = market;
  return result;
};

type EventOptions = {
  event: EventType;
};

export default function Event({ event }: EventOptions): JSX.Element {
  const artists = useMemo(
    () => event.performance.map((performance) => performance.artist),
    [event]
  );
  const [artistIndex, setArtistIndex] = useState(0);

  const {
    isLoading,
    data: currentArtistSpotify,
  }: {
    isLoading: boolean;
    isError: boolean;
    data: { id: string } | undefined;
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

  const artistPlayerData: ArtistType = {
    name: artists[artistIndex].displayName,
    spotifyId: currentArtistSpotify?.id,
  };

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
            <div className="musicPlayer">
              <div className="iframe-wrapper">
                {isLoading ? (
                  <div className="iframe-loading">
                    <p>Loading music...</p>
                  </div>
                ) : (
                  <Player artist={artistPlayerData} />
                )}
              </div>
            </div>
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
