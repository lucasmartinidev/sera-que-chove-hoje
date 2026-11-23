---
version: 1
slug: "frontend-src-views-weatherdashboardview-tsx"
primary_target: "frontend/src/views/WeatherDashboardView.tsx"
related_targets: ["frontend/src/index.css","frontend/src/components/weather/CurrentWeatherCard.tsx","frontend/src/components/weather/HourlyForecast.tsx"]
---

## Scope and mode

Weather dashboard screen in the existing web app, now carrying a full-bleed reactive identity that replaces the previous neutral panel. Mode: Operate.

## Audience and job

People checking a selected city's current weather and rain likelihood before an activity or commute, including people comparing two cities in sequence and people with color-vision deficiency, low vision, motion sensitivity, or keyboard and screen-reader navigation. They search manually first, optionally request browser location, and must recognize city, condition, current temperature, and rain chance inside the first fold within about three seconds, then scan the next six hours without leaving the screen.

## Content and states

Keep the approved title "Será que chove hoje?" and concise PT-BR copy. The first view prioritizes city search, current conditions with the temperature band label, and precipitation probability; the six-hour forecast follows, with humidity, wind, and pressure as secondary metrics. Support loading, ambiguous search results, empty results, service errors, location permission states, and unit changes — every state wears the identity. With no loaded query, missing temperature, unknown condition, or an error, the atmosphere stays neutral and never implies weather that is not there. Switching units changes values only, never the color band.

## Direction and memorable moment

Pinned by the user in `tasks/prd-identidade-futurista-reativa/prd.md`: a futuristic, striking, animated atmospheric background that reacts to the queried city's condition family and day/night, with high-contrast colors driven by a static absolute temperature scale whose bands always carry a visible text label. This replaces the conventional weather-dashboard canon; Weather.com, AccuWeather, and Google Weather stay craft and usability references only, never assets to copy.

Memorable moment: on submitting a city the sky of the interface transforms — atmosphere, light, and color become that place's weather, so the rain answer lands before the numbers are read; switching cities makes the difference between places visible in a smooth transition rather than a page reload.

## Constraints

Consume weather data only through the existing backend services: no new variables, no browser calls to maps, imagery, or external assets, no network requests for the background, no degradation of the 3 s p95 query. Content sits on surfaces that hold WCAG 2.2 AA contrast measured against the real rendered background (4.5:1 text, 3:1 large text and essential UI/graphics) across every condition × temperature band × day/night × state combination. Color is never the only channel: band labels, numeric values, icons, and text descriptions keep temperature and condition distinguishable in grayscale and under color-vision deficiency, with lightness varying alongside hue. No flashing above three times per second, including thunderstorm light.

Honor prefers-reduced-motion with an equally informative static composition and near-instant city transitions; keep forced-colors and high-contrast modes legible with the decorative background suppressed or simplified. The background is decorative: hidden from assistive technology and never blocking interaction, scrolling, focus, or text selection. City transitions complete within 600 ms, the screen is interactive before any background animation ends, and animated density drops on small screens for battery and legibility, with text legible at 200% zoom. Preserve keyboard operation, accessible announcements, current behaviors, and the passing frontend, backend, and E2E suites. Do not add maps, alternate themes or a theme picker, persistent favorites, fabricated weather claims, logos, or proprietary brand assets.

## Implemented visual decisions

The Operate surface uses opaque, token-driven content surfaces with a system-font stack and no external assets. The root injects exact hex CSS variables from `resolveTheme`: condition and day/night select the surface and sky gradient; temperature selects the absolute accent/deep pair; status and focus use separate semantic colors. The background is layered CSS-only atmosphere: sky crossfade, temperature glow, condition particles, thunder flash, and clear-night stars. Motion is compositor-only, reduced motion removes animation and transitions, and forced colors suppresses the decorative background. The complete temperature × condition × period contrast matrix is covered by TU-50.

The first-fold reading path is city → condition → temperature with visible band label → rain probability, followed by secondary metrics and six-hour forecast. The same labels, icons, numeric values, and descriptions remain available without relying on color.
