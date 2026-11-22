export type OpenMeteoGeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  country_code?: string;
  timezone?: string;
  population?: number;
};

export type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[];
};

export type OpenMeteoCurrent = {
  time: string;
  temperature_2m?: number | null;
  relative_humidity_2m?: number | null;
  apparent_temperature?: number | null;
  is_day: number;
  precipitation?: number | null;
  weather_code: number;
  wind_speed_10m?: number | null;
  wind_direction_10m?: number | null;
  surface_pressure?: number | null;
};

export type OpenMeteoHourly = {
  time: string[];
  temperature_2m?: Array<number | null>;
  weather_code?: Array<number | null>;
  precipitation_probability?: Array<number | null>;
  precipitation?: Array<number | null>;
};

export type OpenMeteoForecast = {
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  timezone?: string;
  utc_offset_seconds?: number;
};
