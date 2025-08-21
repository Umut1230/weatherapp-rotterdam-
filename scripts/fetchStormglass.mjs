import 'dotenv/config';
import fs from "fs";
import fetch from "node-fetch";

// Read number of days from command line argument
const daysArgIndex = process.argv.indexOf("--days");
const totalDays = daysArgIndex !== -1 ? Number(process.argv[daysArgIndex + 1]) : 10;

// Stormglass API setup
const API_KEY = process.env.STORMGLASS_API_KEY;
const LAT = 51.9225;  // Rotterdam latitude
const LON = 4.47917;  // Rotterdam longitude
const BASE_URL = "https://api.stormglass.io/v2/weather/point";

if (!API_KEY) {
  console.error("⚠️  Please set STORMGLASS_API_KEY in your .env file");
  process.exit(1);
}

async function fetchChunk(startDate, endDate) {
  const url = `${BASE_URL}?lat=${LAT}&lng=${LON}&params=airTemperature,windSpeed,pressure,waveHeight&start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
  const res = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  const data = await res.json();
  return data.hours || [];
}

// Fetch 1-day hourly data
async function fetchOneDay() {
  try {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 1);

    console.log(`Fetching 1-day hourly data...`);
    const hours = await fetchChunk(start, end);

    if (!hours || hours.length === 0) throw new Error("No data from Stormglass");

    fs.writeFileSync("public/data-1day.json", JSON.stringify({ hours }, null, 2));
    console.log(`✅ 1-day data saved (${hours.length} hours)`);
  } catch (err) {
    console.error("❌ Failed to fetch 1-day data, using local fallback:", err);
    try {
      const fallback = fs.readFileSync("data-1day.json", "utf-8");
      fs.writeFileSync("public/data-1day.json", fallback);
      console.log(`✅ Loaded 1-day fallback data`);
    } catch (fallbackErr) {
      console.error("❌ Failed to load 1-day fallback:", fallbackErr);
    }
  }
}

// Fetch 10-day daily data
async function fetchTenDay() {
  try {
    let days = [];
    for (let i = 0; i < totalDays; i++) {
      const start = new Date();
      start.setDate(start.getDate() + i);
      const end = new Date();
      end.setDate(end.getDate() + i + 1);

      console.log(`Fetching day ${i + 1} data...`);
      const hours = await fetchChunk(start, end);

      if (!hours || hours.length === 0) {
        throw new Error(`No data from Stormglass for day ${i + 1}`);
      }

      // Calculate daily averages
      const tempAvg = hours.reduce((sum, h) => sum + (h.airTemperature?.noaa ?? 0), 0) / hours.length;
      const windAvg = hours.reduce((sum, h) => sum + (h.windSpeed?.noaa ?? 0), 0) / hours.length;
      const pressureAvg = hours.reduce((sum, h) => sum + (h.pressure?.noaa ?? 0), 0) / hours.length;
      const waveAvg = hours.reduce((sum, h) => sum + (h.waveHeight?.noaa ?? 0), 0) / hours.length;

      days.push({
        date: start.toISOString().split("T")[0],
        tempAvg: Number(tempAvg.toFixed(1)),
        windAvg: Number(windAvg.toFixed(1)),
        pressureAvg: Number(pressureAvg.toFixed(1)),
        waveAvg: Number(waveAvg.toFixed(2)),
      });
    }

    fs.writeFileSync("public/data-10day.json", JSON.stringify({ days }, null, 2));
    console.log(`✅ 10-day data saved`);
  } catch (err) {
    console.error("❌ Failed to fetch 10-day data, using local fallback:", err);
    try {
      const fallback = fs.readFileSync("data-10day.json", "utf-8");
      fs.writeFileSync("public/data-10day.json", fallback);
      console.log(`✅ Loaded 10-day fallback data`);
    } catch (fallbackErr) {
      console.error("❌ Failed to load 10-day fallback:", fallbackErr);
    }
  }
}

async function run() {
  await fetchOneDay();
  await fetchTenDay();
}

run();
