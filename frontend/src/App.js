import "./App.css";
import CLVBarGraph from "./components/charts/CLVBarGraph";
import CustomerMap from "./components/charts/CustomerMap";
import NewCustomersBarChart from "./components/charts/NewCustomerBarGraph";
import RepeatCustomersBarChart from "./components/charts/RepeatCustomersBarGraph";
import SalesGrowthLineChart from "./components/charts/SalesGrowthLineChart";
import SalesLineChart from "./components/charts/SalesLineChart";

function App() {
  return (
    <div>
      <SalesLineChart />
      <SalesGrowthLineChart />
      <NewCustomersBarChart />
      <RepeatCustomersBarChart />
      <CustomerMap />
      <CLVBarGraph />
    </div>
  );
}

export default App;
