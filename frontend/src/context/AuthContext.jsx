import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }

                const isTokenValid = isTokenNotExpired(token);
                if (!isTokenValid) {
                    // logout();
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:5001/api/users/me', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: 'include',
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    // logout();
                }
            } catch (error) {
                console.error('Error checking authentication status', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const isTokenNotExpired = (token) => {
        try {
            if (!token || typeof token !== 'string' || token.split('.').length < 3) {
                console.error('Invalid token format');
                return false;
            }

            const payloadBase64 = token.split('.')[1];
            
            const base64 = payloadBase64
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            
            const paddedBase64 = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
            
            const payload = JSON.parse(window.atob(paddedBase64));
            
            const currentTime = Math.floor(Date.now() / 1000);
            //5 min buffer
            return payload.exp > (currentTime + (5 * 60));
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    };

    const login = (token) => {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}