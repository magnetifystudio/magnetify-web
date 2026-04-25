"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function SalesLineChart({
  labels, data
}: { labels: string[]; data: number[] }) {
  return (
    <div style={{ height: 100, position: "relative" }}>
      <Line
        data={{
          labels,
          datasets: [{
            data,
            borderColor: "#FEDE00",
            backgroundColor: "rgba(254,222,0,0.06)", // 0.08 se 0.06 update kiya
            borderWidth: 1,                          // 1.5 se 1 update kiya (Thin & Sophisticated)
            pointRadius: 0,                         // Dots hataye (Clean line)
            pointHoverRadius: 3,                    // Hover pe dots dikhenge
            pointBackgroundColor: "#FEDE00",
            tension: 0.4,
            fill: true,
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: { 
              callbacks: { 
                label: c => `₹${Number(c.raw).toLocaleString('en-IN')}` 
              } 
            }
          },
          scales: {
            x: { 
              grid: { color: "rgba(255,255,255,0.04)" },
              ticks: { color: "rgba(255,255,255,0.3)", font: { size: 9 } },
              border: { display: false }
            },
            y: { 
              grid: { color: "rgba(255,255,255,0.04)" },
              ticks: { 
                color: "rgba(255,255,255,0.3)", 
                font: { size: 9 },
                callback: v => v === 0 ? "0" : `₹${Number(v)/1000}k`
              },
              border: { display: false }, 
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
}