export type LatLngType = {
  lat: number;
  lng: number;
};

export type EventType = {
  location: LatLngType;
  performance: [{ artist: { displayName: string } }];
  start: { time: string };
  venue: { displayName: string };
  uri: string;
};
