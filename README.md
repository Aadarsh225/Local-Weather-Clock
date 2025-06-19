# Local-Weather-Clock



A simple web app that shows the current time, your location’s weather, and a 5-day weather forecast with an interactive map.

Built with **HTML**, **CSS**, **JavaScript**, **Leaflet** (for maps), and **OpenWeatherMap API** for weather data.

---

## Features

- Live digital clock  
- Current weather info: temperature, feels like, humidity, wind speed, and description  
- 5-day weather forecast with daily min/max temps and icons  
- Interactive map showing your location  
- Responsive design with a beautiful fixed background image  

---

## Demo

You can run this app locally by opening `index.html` in your browser.

---

## Getting Started

### 1. Get your OpenWeatherMap API key

Sign up for a free API key at [https://openweathermap.org/api](https://openweathermap.org/api).

### 2. Add your API key

In `script.js`, find the line:

```js
const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE';
