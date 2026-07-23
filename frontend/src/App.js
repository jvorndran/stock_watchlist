import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";
import DashLayout from "./components/Dashboard/DashLayout";
import StockPage from "./components/StockPage/StockPage";
import StockCompare from "./components/StockCompare/StockCompare";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>

          <Route path="" element={<Login />} />

          <Route path="signup" element={<Signup />} />

          <Route path="dash" element={<DashLayout />}></Route>

          <Route path="dash/compare" element={<StockCompare />} />

          <Route path="dash/:stock_ticker" element={<StockPage />} />

        </Route>
      </Routes>
  );
}
export default App;
