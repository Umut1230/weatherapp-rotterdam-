// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function App() {
  const [oneDayData, setOneDayData] = useState([]);
  const [tenDayData, setTenDayData] = useState([]);
  const [view, setView] = useState("1day");

  // Load local JSON files from /public
  useEffect(() => {
    fetch("/data-1day.json")
      .then(res => res.json())
      .then(data => setOneDayData(data.hours || []))
      .catch(console.error);

    fetch("/data-10day.json")
      .then(res => res.json())
      .then(data => setTenDayData(data.days || []))
      .catch(console.error);
  }, []);

  // Prepare chart-friendly data
  const prepareChartData = (data, type) =>
    data.map(item => {
      const timeLabel =
        type === "1day"
          ? new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : new Date(item.date).toLocaleDateString([], { weekday: "short", day: "numeric" });
      return {
        time: timeLabel,
        temperature: item.airTemperature?.noaa ?? item.tempAvg ?? null,
        wind: item.windSpeed?.noaa ?? item.windAvg ?? null,
        pressure: item.pressure?.noaa ?? item.pressureAvg ?? null,
        waveHeight: item.waveHeight?.noaa ?? item.waveAvg ?? null,
      };
    });

  const chartData = view === "1day" ? prepareChartData(oneDayData, "1day") : prepareChartData(tenDayData, "10day");

  const buttonStyle = active => ({
    padding: "0.6rem 1.6rem",
    marginRight: "0.5rem",
    borderRadius: "50px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    background: active
      ? "linear-gradient(135deg, #6C63FF, #3B3BFF)"
      : "linear-gradient(145deg, #f0f0f3, #cacaca)",
    color: active ? "#fff" : "#555",
    boxShadow: active
      ? "0 8px 20px rgba(108,99,255,0.4)"
      : "5px 5px 15px #c1c1c1, -5px -5px 15px #ffffff",
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "'Inter', sans-serif", maxWidth: "1100px", margin: "auto", minHeight: "100vh", background: "linear-gradient(to right, #e0eafc, #cfdef3)" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#3B3BFF", fontWeight: 700, fontSize: "2.2rem" }}>
        Rotterdam Weather Forecast
      </h1>

      {/* View buttons */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <button onClick={() => setView("1day")} style={buttonStyle(view === "1day")}>1 Day</button>
        <button onClick={() => setView("10day")} style={buttonStyle(view === "10day")}>10 Days</button>
      </div>

      {/* Data Table */}
      <div style={{ marginBottom: "2rem", padding: "1rem", borderRadius: "20px", background: "#f0f4f8", boxShadow: "8px 8px 20px #d1d9e6, -8px -8px 20px #ffffff", maxHeight: "350px", overflowY: "auto" }}>
        <div style={{ display: "grid", gap: "0.8rem" }}>
          {(view === "1day" ? oneDayData : tenDayData).map((item, i) => {
            const temp = item.airTemperature?.noaa ?? item.tempAvg ?? 0;
            const wind = item.windSpeed?.noaa ?? item.windAvg ?? 0;
            const pressure = item.pressure?.noaa ?? item.pressureAvg ?? 0;
            const waves = item.waveHeight?.noaa ?? item.waveAvg ?? 0;

            const tempWidth = Math.min(temp * 2.5, 100);
            const windWidth = Math.min(wind * 10, 100);
            const pressureWidth = Math.min((pressure - 950) / 2, 100);
            const wavesWidth = Math.min(waves * 20, 100);

            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "180px repeat(4, 1fr)", alignItems: "center", padding: "0.7rem 1rem", borderRadius: "15px", background: i % 2 === 0 ? "#f8f9fb" : "#ffffff", boxShadow: "4px 4px 15px #d1d9e6, -4px -4px 15px #ffffff" }}>
                <div style={{ fontWeight: 600, color: "#3B3BFF" }}>
                  {view === "1day"
                    ? new Date(item.time).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
                    : new Date(item.date).toLocaleDateString([], { weekday: "short", day: "numeric" })}
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: "0.5rem", fontWeight: 500 }}>{temp}°C</div>
                  <div style={{ height: "10px", background: "#FF6B6B", width: `${tempWidth}%`, borderRadius: "5px" }} />
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: "0.5rem", fontWeight: 500 }}>{wind} m/s</div>
                  <div style={{ height: "10px", background: "#4D96FF", width: `${windWidth}%`, borderRadius: "5px" }} />
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: "0.5rem", fontWeight: 500 }}>{pressure} hPa</div>
                  <div style={{ height: "10px", background: "#2ECC71", width: `${pressureWidth}%`, borderRadius: "5px" }} />
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: "0.5rem", fontWeight: 500 }}>{waves} m</div>
                  <div style={{ height: "10px", background: "#FFC300", width: `${wavesWidth}%`, borderRadius: "5px" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gap: "2rem" }}>
        <div style={{ background: "#f0f4f8", borderRadius: "20px", padding: "1.5rem", boxShadow: "8px 8px 20px #d1d9e6, -8px -8px 20px #ffffff" }}>
          <h2 style={{ marginBottom: "1rem", color: "#3B3BFF" }}>Temperature & Wind</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="time" tick={{ fill: "#555" }} />
              <YAxis tick={{ fill: "#555" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#FF6B6B" name="Temp °C" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="wind" stroke="#4D96FF" name="Wind m/s" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#f0f4f8", borderRadius: "20px", padding: "1.5rem", boxShadow: "8px 8px 20px #d1d9e6, -8px -8px 20px #ffffff" }}>
          <h2 style={{ marginBottom: "1rem", color: "#3B3BFF" }}>Pressure & Waves</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="time" tick={{ fill: "#555" }} />
              <YAxis tick={{ fill: "#555" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="pressure" fill="#2ECC71" name="Pressure hPa" />
              <Bar dataKey="waveHeight" fill="#FFC300" name="Waves m" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
