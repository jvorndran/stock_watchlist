import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";
import DashLayout from "./components/DashLayout";
import StockPage from "./components/StockPage/StockPage";
import LandingPage from "./components/LandingPage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>

          <Route index element={<Public />} />

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
