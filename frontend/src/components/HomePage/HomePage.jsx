import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to Candlestick Chart Viewer</h1>
        <p className={styles.description}>
          {isAuthenticated
            ? `Hello, ${user?.username || "Trader"}! Ready to dive into the charts?`
            : "Explore candlestick charts and manage your trading data effortlessly."}
        </p>
      </header>

      <div className={styles.buttonGroup}>
        {isAuthenticated ? (
          <>
            <button
              onClick={() => navigate("/chart")}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Go to Chart
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              Register
            </button>
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Built with ❤️ using React and Tailwind CSS.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
