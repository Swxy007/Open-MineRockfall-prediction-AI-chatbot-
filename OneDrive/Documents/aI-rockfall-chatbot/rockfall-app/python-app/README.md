# Rockfall Prediction System (Flask)

A standalone Python/Flask implementation of the AI-Based Rockfall Prediction and Alert System.

- Translucent background using the provided mine image (Source URL)
- Dashboard with status, controls, simulated sensor feed, and assistant UI
- Weather page with city search or geolocation
- Secure server-side weather proxy to OpenWeather

## Setup

1) Create a virtual environment and install:
   pip install -r python-app/requirements.txt

2) Set environment variable:
   export WEATHER_API_KEY="your_openweather_api_key"

3) Run:
   python python-app/app.py

Open http://localhost:5000
