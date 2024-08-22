import React, { useState, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import "../ui/Dropdown/Dropdown.css";
import { convertMonthIndexToAbbreviation } from "../../utils";
import Loader from "../ui/Loader/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RepeatCustomersBarChart = () => {
  const [repeatCustomerData, setRepeatCustomerData] = useState([]);
  const [interval, setInterval] = useState("quarterly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://rapidquest-4vwc.onrender.com/api/v1/repeatcustomers?interval=${interval}`
        );
        setRepeatCustomerData(response.data);
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
      repeatCustomerData.map((item) => {
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
    [repeatCustomerData, interval]
  );

  const dataValues = repeatCustomerData.map((item) => item.repeatCustomers);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Repeat Customers",
        data: dataValues,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
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
            return `Repeat Customers: ${tooltipItem.raw}`;
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
        grid: {},
      },
      y: {
        title: {
          display: true,
          text: "Number of Repeat Customers",
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="min-h-500px">
      <h2>Repeat Customers Data</h2>
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
      {loading ? <Loader /> : <Bar data={data} options={options} />}
    </div>
  );
};

export default RepeatCustomersBarChart;
