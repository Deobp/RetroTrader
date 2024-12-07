import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import Navigation from "./components/Navigation/Navigation";
import Chart from "./components/Chart";
import Register from "./components/Register";
import Login from "./components/Login";
function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="app">
      <Navigation />
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* rotected Routes */}
        <Route
          path="/"
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



