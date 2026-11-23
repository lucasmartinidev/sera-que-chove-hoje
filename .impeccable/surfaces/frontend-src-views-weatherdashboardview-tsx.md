---
version: 1
slug: "frontend-src-views-weatherdashboardview-tsx"
primary_target: "frontend/src/views/WeatherDashboardView.tsx"
related_targets: []
---

## Scope and mode

Weather dashboard screen in the existing web app. Mode: Operate.

## Audience and job

People checking a selected city's current weather and rain likelihood before an activity or commute. They should be able to search manually first, optionally request browser location, and scan the next six hours without leaving the screen.

## Content and states

Keep the approved title "Será que chove hoje?" and concise PT-BR copy. The first view prioritizes city search, current conditions, and precipitation probability; the six-hour forecast follows, with humidity, wind, and pressure as secondary metrics. Support loading, ambiguous search results, empty results, service errors, location permission states, and unit changes.

## Direction and memorable moment

Use the conventional weather-dashboard canon selected by the user, with Weather.com, AccuWeather, and Google Weather as craft references rather than visual assets to copy. The memorable moment is reading current conditions and rain probability at one glance, then scanning the next six hourly forecasts.

## Constraints

Consume weather data only through the existing backend services. Preserve keyboard operation, accessible announcements, contrast, and mobile usability. Do not add maps, persistent favorites, fabricated weather claims, logos, or proprietary brand assets.

## Unresolved decisions

None within this task's scope.
