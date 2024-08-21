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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const NewCustomersBarChart = () => {
  const [customerData, setCustomerData] = useState([]);
  const [interval, setInterval] = useState("quarterly");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://rapidquest-4vwc.onrender.com/api/v1/newcustomers?interval=${interval}`
        );
        setCustomerData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [interval]);

  const labels = useMemo(
    () =>
      customerData.map((item) => {
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
    [customerData, interval]
  );

  const dataValues = customerData.map((item) => item.count);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "New Customers",
        data: dataValues,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
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
            return `New Customers: ${tooltipItem.raw}`;
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
          text: "Number of New Customers",
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
    <div>
      <h2>New Customers Data</h2>
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
      <Bar data={data} options={options} />
    </div>
  );
};

export default NewCustomersBarChart;
