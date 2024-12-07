import { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, confirmEmail, password, confirmPassword } = formData;

        if (!username || !email || !password || !confirmEmail || !confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (email !== confirmEmail) {
            setError('Emails do not match.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setError('');

        try {
            const response = await axios.post(
                'http://localhost:5001/api/users/register',
                { username, email, password },
                { withCredentials: true }
            );
            setSuccess(response.data.message || 'Registration successful!');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
            setSuccess('');
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label>Username*</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email*</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Email*</label>
                    <input
                        type="email"
                        name="confirmEmail"
                        value={formData.confirmEmail}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password*</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password*</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="register-btn">
                    Register
                </button>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
            </form>
        </div>
    );
};

export default Register;
