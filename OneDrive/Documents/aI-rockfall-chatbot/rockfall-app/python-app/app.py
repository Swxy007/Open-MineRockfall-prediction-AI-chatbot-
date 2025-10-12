import os
from datetime import datetime
from urllib.parse import quote
import requests
from flask import Flask, jsonify, render_template, request, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")

OPENWEATHER_KEY = os.getenv("WEATHER_API_KEY")

# --------------- Pages ---------------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/weather")
def weather_page():
    return render_template("weather.html")

# --------------- API: Weather Proxy ---------------

def _format_current_weather(w):
    # Normalize current weather payload
    main = w.get("main", {})
    wind = w.get("wind", {})
    weather = (w.get("weather") or [{}])[0]
    sys = w.get("sys") or {}

    temp_c = main.get("temp")
    temp_f = None if temp_c is None else round((temp_c * 9 / 5) + 32, 1)
    return {
        "location": {
            "name": w.get("name"),
            "country": sys.get("country"),
            "lat": w.get("coord", {}).get("lat"),
            "lon": w.get("coord", {}).get("lon"),
        },
        "current": {
            "tempC": temp_c,
            "tempF": temp_f,
            "humidity": main.get("humidity"),
            "pressure": main.get("pressure"),
            "windKph": None if wind.get("speed") is None else round(wind.get("speed") * 3.6, 1),
            "windDir": wind.get("deg"),
            "description": weather.get("description"),
            "icon": weather.get("icon"),
            "observedAt": w.get("dt"),
        },
    }

def _format_forecast_list(forecast):
    # Use 3-hourly forecast; pick every 8th item (~daily) for a compact view
    items = (forecast or {}).get("list", [])[:40]
    out = []
    for i, it in enumerate(items):
        if i % 8 != 0 and i not in (0, len(items)-1):
            continue
        main = it.get("main", {})
        weather = (it.get("weather") or [{}])[0]
        temp_c = main.get("temp")
        temp_f = None if temp_c is None else round((temp_c * 9 / 5) + 32, 1)
        out.append({
            "dt": it.get("dt"),
            "tempC": temp_c,
            "tempF": temp_f,
            "description": weather.get("description"),
            "icon": weather.get("icon"),
        })
    return out

@app.get("/api/weather")
def get_weather():
    """
    Query params:
      - city=City Name
      - OR lat=...&lon=...
    Returns normalized JSON with location, current, forecast[]
    """
    if not OPENWEATHER_KEY:
        return jsonify({"error": "WEATHER_API_KEY is not set"}), 500

    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    base = "https://api.openweathermap.org/data/2.5"

    try:
        if city:
            q = quote(city)
            current_res = requests.get(f"{base}/weather?q={q}&units=metric&appid={OPENWEATHER_KEY}", timeout=15)
            current_res.raise_for_status()
            current_json = current_res.json()

            forecast_res = requests.get(f"{base}/forecast?q={q}&units=metric&appid={OPENWEATHER_KEY}", timeout=15)
            forecast_res.raise_for_status()
            forecast_json = forecast_res.json()

        elif lat and lon:
            current_res = requests.get(f"{base}/weather?lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_KEY}", timeout=15)
            current_res.raise_for_status()
            current_json = current_res.json()

            forecast_res = requests.get(f"{base}/forecast?lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_KEY}", timeout=15)
            forecast_res.raise_for_status()
            forecast_json = forecast_res.json()
        else:
            return jsonify({"error": "Provide ?city= or ?lat=...&lon=..."}), 400

        payload = _format_current_weather(current_json)
        payload["forecast"] = _format_forecast_list(forecast_json)
        return jsonify(payload)
    except requests.HTTPError as e:
        return jsonify({"error": "Weather API error", "detail": str(e), "body": getattr(e, 'response', None).text if hasattr(e, 'response') else None}), 502
    except Exception as e:
        return jsonify({"error": "Unexpected error", "detail": str(e)}), 500

# --------------- Static helper (optional) ---------------

@app.route("/favicon.ico")
def favicon():
    return send_from_directory(app.static_folder, "favicon.ico", mimetype="image/x-icon")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
