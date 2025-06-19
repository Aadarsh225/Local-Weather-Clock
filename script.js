// Clock update function
function updateClock() {
  const clockElem = document.getElementById('clock');
  const now = new Date();
  const hours = String(now.getHours()).padStart(2,'0');
  const minutes = String(now.getMinutes()).padStart(2,'0');
  const seconds = String(now.getSeconds()).padStart(2,'0');
  clockElem.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateClock, 1000);
updateClock();

const locationElem = document.getElementById('location');
const tempElem = document.getElementById('temperature');
const feelsLikeElem = document.getElementById('feels-like');
const humidityElem = document.getElementById('humidity');
const windElem = document.getElementById('wind');
const descElem = document.getElementById('description');
const forecastContainer = document.getElementById('forecast');
const getForecastBtn = document.getElementById('get-forecast-btn');

let map;
let marker;

function initMap(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    marker = L.marker([lat, lon]).addTo(map);
  } else {
    map.setView([lat, lon], 13);
    marker.setLatLng([lat, lon]);
  }
}


// Replace 'YOUR_API_KEY_HERE' with your OpenWeatherMap API key.
// Get one for free at: https://openweathermap.org/api
const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE';

function fetchWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        locationElem.textContent = 'Weather data not found';
        tempElem.textContent = '';
        feelsLikeElem.textContent = '';
        humidityElem.textContent = '';
        windElem.textContent = '';
        descElem.textContent = '';
        return;
      }
      locationElem.textContent = `${data.name}, ${data.sys.country}`;
      tempElem.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
      feelsLikeElem.textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
      humidityElem.textContent = `Humidity: ${data.main.humidity}%`;
      windElem.textContent = `Wind: ${Math.round(data.wind.speed)} m/s`;
      descElem.textContent = data.weather[0].description
        .charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    })
    .catch(() => {
      locationElem.textContent = 'Failed to fetch weather';
      tempElem.textContent = '';
      feelsLikeElem.textContent = '';
      humidityElem.textContent = '';
      windElem.textContent = '';
      descElem.textContent = '';
    });
}

// Reverse geocoding to get more accurate & detailed location name
function reverseGeocode(lat, lon) {
  // Using free Nominatim API - be kind to the service, no heavy requests!
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.address) {
        // Construct a friendly address string
        const { city, town, village, county, state, country } = data.address;
        return city || town || village || county || state || country || 'Unknown location';
      }
      return 'Unknown location';
    })
    .catch(() => 'Unknown location');
}

function fetchForecast(lat, lon) {
  forecastContainer.innerHTML = '';

  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== '200') {
        forecastContainer.textContent = 'Failed to fetch forecast';
        return;
      }

      const dailyData = {};

      data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(item);
      });

      const dates = Object.keys(dailyData).slice(0, 5);

      dates.forEach(date => {
        const dayData = dailyData[date];

        let minTemp = Infinity;
        let maxTemp = -Infinity;
        let icon = '';

        dayData.forEach(d => {
          if (d.main.temp_min < minTemp) minTemp = d.main.temp_min;
          if (d.main.temp_max > maxTemp) maxTemp = d.main.temp_max;
        });

        const middayForecast = dayData.find(d => d.dt_txt.includes('12:00:00')) || dayData[0];
        icon = middayForecast.weather[0].icon;

        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString(undefined, options);

        const dayDiv = document.createElement('div');
        dayDiv.className = 'forecast-day';
        dayDiv.innerHTML = `
          <div><strong>${formattedDate}</strong></div>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" />
          <div>Min: ${Math.round(minTemp)}°C</div>
          <div>Max: ${Math.round(maxTemp)}°C</div>
        `;

        forecastContainer.appendChild(dayDiv);
      });
    })
    .catch(() => {
      forecastContainer.textContent = 'Failed to fetch forecast';
    });
}

function requestLocationAndUpdate() {
  if (!navigator.geolocation) {
    locationElem.textContent = 'Geolocation not supported';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      initMap(lat, lon);

      // Use reverse geocode to get better location display
      const friendlyLocation = await reverseGeocode(lat, lon).catch(() => null);
      locationElem.textContent = friendlyLocation || 'Location unknown';

      fetchWeather(lat, lon);
      fetchForecast(lat, lon);
    },
    () => {
      locationElem.textContent = 'Permission denied or location unavailable';
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

getForecastBtn.addEventListener('click', () => {
  locationElem.textContent = 'Fetching location...';
  tempElem.textContent = '';
  feelsLikeElem.textContent = '';
  humidityElem.textContent = '';
  windElem.textContent = '';
  descElem.textContent = '';
  forecastContainer.innerHTML = '';
  requestLocationAndUpdate();
});
