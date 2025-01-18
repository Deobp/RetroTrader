import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import Chart from "./components/Chart";
import Register from "./components/Register";
import Login from "./components/Login";
import HomePage from "./components/HomePage";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/chart"
          element={
            isAuthenticated ? (
              <div className="flex flex-col gap-4 p-4">
                <div className="chart-container">
                  <Chart />
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
