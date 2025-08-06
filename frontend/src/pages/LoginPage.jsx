import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://dapper-starship-88f08b.netlify.app/api';

const Logo = () => <svg className="h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h16.5M4.5 14.25h15M5.25 10.5h13.5M12 3.75l3 3m-3-3l-3 3" /></svg>;

// --- Password Strength Component ---
const PasswordStrengthIndicator = ({ validation }) => {
    const strength = Object.values(validation).filter(Boolean).length;
    const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-yellow-500', 'bg-green-500'];
    const strengthLabels = ['Invalid', 'Weak', 'Weak', 'Medium', 'Medium', 'Strong'];

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                <span className={`text-xs font-bold ${strength > 3 ? 'text-green-600' : 'text-gray-500'}`}>{strengthLabels[strength]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full ${strengthColors[strength]}`}
                    style={{ width: `${(strength / 5) * 100}%`, transition: 'width 0.3s ease-in-out' }}
                ></div>
            </div>
        </div>
    );
};

const ValidationChecklist = ({ validation }) => {
    const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
    const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

    return (
        <ul className="text-xs text-gray-500 space-y-1 mt-2">
            <li className={`flex items-center ${validation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                {validation.minLength ? <CheckIcon /> : <XIcon />}<span className="ml-2">At least 8 characters</span>
            </li>
            <li className={`flex items-center ${validation.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                {validation.hasUpper ? <CheckIcon /> : <XIcon />}<span className="ml-2">At least one uppercase letter</span>
            </li>
            <li className={`flex items-center ${validation.hasLower ? 'text-green-600' : 'text-red-600'}`}>
                {validation.hasLower ? <CheckIcon /> : <XIcon />}<span className="ml-2">At least one lowercase letter</span>
            </li>
            <li className={`flex items-center ${validation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                {validation.hasNumber ? <CheckIcon /> : <XIcon />}<span className="ml-2">At least one number</span>
            </li>
            <li className={`flex items-center ${validation.hasSymbol ? 'text-green-600' : 'text-red-600'}`}>
                {validation.hasSymbol ? <CheckIcon /> : <XIcon />}<span className="ml-2">At least one special character (!@#$%)</span>
            </li>
        </ul>
    );
};


const LoginPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSymbol: false,
    });
    const navigate = useNavigate();

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);

    useEffect(() => {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%]/.test(password);
        setPasswordValidation({ minLength, hasUpper, hasLower, hasNumber, hasSymbol });
    }, [password]);

    const handleResponse = (data, response) => {
        if (response.ok && data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } else {
            setError(data.message || 'An error occurred.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            handleResponse(data, response);
        } catch (err) {
            setError('Could not connect to the server.');
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!isPasswordValid) {
            setError("Password does not meet the requirements.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Sign up successful! Please log in.');
                setIsLoginView(true);
                setUsername('');
                setPassword('');
            } else {
                setError(data.message || 'Sign up failed.');
            }
        } catch (err) {
            setError('Could not connect to the server.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-3 mb-2">
                    <Logo />
                    <h1 className="text-4xl font-bold text-gray-800">Shipment Tracker</h1>
                </div>
                <p className="text-gray-500">Professional logistics management system</p>
            </div>

            <div className="w-full max-w-sm p-8 space-y-4 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-700">{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-sm text-gray-500">{isLoginView ? 'Sign in to your account to continue' : 'Get started by creating a new account'}</p>
                </div>
                <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-gray-600 sr-only">Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-600 sr-only">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    
                    {!isLoginView && (
                        <div className="space-y-2">
                            <PasswordStrengthIndicator validation={passwordValidation} />
                            <ValidationChecklist validation={passwordValidation} />
                        </div>
                    )}

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-600 text-center">{success}</p>}
                    <div>
                        <button 
                            type="submit" 
                            disabled={!isLoginView && !isPasswordValid}
                            className="w-full px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoginView ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setSuccess(''); }} className="text-sm text-blue-600 hover:underline">
                        {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
