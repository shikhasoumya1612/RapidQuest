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
import Loader from "../ui/Loader/Loader";
import "../ui/Dropdown/Dropdown.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const SalesLineChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [interval, setInterval] = useState("yearly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://rapidquest-4vwc.onrender.com/api/v1/sales?interval=${interval}`
        );
        setSalesData(response.data);
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
      salesData.map((item) => {
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
    [salesData, interval]
  );

  const dataValues = salesData.map((item) => item.totalSales);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Total Sales",
        data: dataValues,
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
            return `Sales: ${currencyFormatter.format(tooltipItem.raw)}`;
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
          text: "Total Sales",
        },
        ticks: {
          callback: function (value) {
            return currencyFormatter.format(value);
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Sales Data</h2>
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

export default SalesLineChart;
