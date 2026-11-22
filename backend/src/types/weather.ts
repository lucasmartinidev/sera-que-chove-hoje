export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type WeatherLocation = Coordinates & {
  timezone: string | null;
  utcOffsetSeconds: number | null;
};

export type CurrentWeather = {
  time: string;
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  relativeHumidity: number | null;
  precipitationProbability: number | null;
  precipitationMm: number | null;
  weatherCode: number;
  windSpeedKmh: number | null;
  windDirectionDeg: number | null;
  surfacePressureHpa: number | null;
  isDay: boolean;
};

export type HourForecast = {
  time: string;
  temperatureC: number | null;
  weatherCode: number | null;
  precipitationProbability: number | null;
  precipitationMm: number | null;
};

export type WeatherUnits = {
  temperature: 'celsius';
  windSpeed: 'kmh';
  precipitation: 'mm';
  pressure: 'hpa';
};

export type WeatherData = {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourForecast[];
  units: WeatherUnits;
};
