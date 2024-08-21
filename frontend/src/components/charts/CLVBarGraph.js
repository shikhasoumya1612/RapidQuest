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

const TotalLifetimeAmountBarChart = () => {
  const [data, setData] = useState([]);

  const formatCurrencyINR = (amount) => {
    return amount.toLocaleString("en-IN");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://rapidquest-4vwc.onrender.com/api/v1/clvByMonth"
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const labels = useMemo(
    () =>
      data.map((item) => {
        const [year, month] = item._id.split("-");
        return `${convertMonthIndexToAbbreviation(Number(month))} ${year}`;
      }),
    [data]
  );

  const dataValues = data.map((item) => item.totalLifetimeAmount);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Total Lifetime Amount (INR)",
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
            return `Total Lifetime Amount: ₹${formatCurrencyINR(
              tooltipItem.raw
            )}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
        grid: {},
      },
      y: {
        title: {
          display: true,
          text: "Amount (INR)",
        },
        ticks: {
          callback: function (value) {
            return `₹${formatCurrencyINR(value)}`;
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Total Lifetime Amount by Month</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TotalLifetimeAmountBarChart;
