import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function ProtectedComponent() {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <div>You need to log in to access this content.</div>;
    }

    return <div>Welcome to the protected content!</div>;
}

export default ProtectedComponent;