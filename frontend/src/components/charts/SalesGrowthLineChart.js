import React, { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { convertMonthIndexToAbbreviation } from "../../utils";
import "../ui/Dropdown/Dropdown.css";
import Loader from "../ui/Loader/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const formatPercentage = (value) => value.toFixed(2) + "%";

const SalesGrowthLineChart = () => {
  const [growthData, setGrowthData] = useState([]);
  const [interval, setInterval] = useState("quarterly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://rapidquest-4vwc.onrender.com/api/v1/salesgrowth?interval=${interval}`
        );
        setGrowthData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [interval]);

  const labels = useMemo(
    () =>
      growthData.map((item) => {
        switch (interval) {
          case "daily":
            return `${convertMonthIndexToAbbreviation(item._id.month)} ${
              item._id.day
            }, ${item._id.year}`;

          case "monthly":
            return `${convertMonthIndexToAbbreviation(item._id.month)}, ${
              item._id.year
            }`;

          case "quarterly":
            return `Q${item._id.quarter} ${item._id.year}`;

          case "yearly":
            return `${item._id.year}`;

          default:
            return `${item._id.year}`;
        }
      }),
    [growthData, interval]
  );

  const growthValues = growthData.map((item) => item.growthRate);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Growth Rate (%)",
        data: growthValues,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Growth Rate: ${formatPercentage(tooltipItem.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time Period",
        },
      },
      y: {
        title: {
          display: true,
          text: "Growth Rate",
        },
        ticks: {
          callback: function (value) {
            return formatPercentage(value);
          },
        },
      },
    },
  };

  return (
    <div className="min-h-500px">
      <h2>Sales Growth Rate</h2>
      <div className="dropdown-container">
        <label htmlFor="interval" className="dropdown-label">
          Select Interval:{" "}
        </label>
        <select
          id="interval"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="dropdown-select"
        >
          <option value="yearly">Yearly</option>
          <option value="quarterly">Quarterly</option>
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
        </select>
      </div>

      {loading ? <Loader /> : <Line data={data} options={options} />}
    </div>
  );
};

export default SalesGrowthLineChart;
