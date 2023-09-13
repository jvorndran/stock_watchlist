import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";
import DashLayout from "./components/Dashboard/DashLayout";
import StockPage from "./components/StockPage/StockPage";
import LandingPage from "./components/LandingPage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>

          <Route index element={<LandingPage />} />

          <Route path="login" element={<Login />} />

          <Route path="signup" element={<Signup />} />

          <Route path="dash" element={<DashLayout />}></Route>

          <Route path="dash/:stock_ticker" element={<StockPage />} />

            <Route path="landing" element={<LandingPage />} />

        </Route>
      </Routes>
  );
}

export default App;
