import { Link } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext } from '../../context/AuthContext';

const Navigation = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <nav className="navbar">
            <ul className="navbar-list">
                {isAuthenticated ? (
                    <>
                        <li>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navigation;