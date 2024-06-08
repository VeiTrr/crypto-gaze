import React, {useEffect, useState} from 'react';
import './Welcome.scss';
import eyeOpen from '/eye-open.svg';
import eyeClose from '/eye.svg';
import {useNavigate} from "react-router-dom";
import axios from "axios";

function Welcome() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [activeButton, setActiveButton] = useState('signIn');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const submitForm = async (e) => {
        if (e) e.preventDefault();
        if (activeButton === 'signUp' && password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const userData = {username, password};
        const endpoint = activeButton === 'signUp' ? '/api/auth/register' : '/api/auth/login';

        try {
            const response = await axios.post(endpoint, userData);
            if (response.data?.accessToken && response.data?.refreshToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                navigate('/home');
            } else {
                console.log(response.data);
                alert('Error: ' + response.data.message);
            }
        } catch (error) {
            console.log(error);
            alert('Error: ' + error.message);
            if (error.response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }
    };

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (accessToken && refreshToken) {
            navigate('/home');
        }
    }, []);

    const switchButton = (button) => {
        setActiveButton(button);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="welcome-page">
            <div className="auth-section">
                <h2>Вход / Регистрация</h2>
                <form onSubmit={submitForm} className="login-form">
                    <div className="input-field">
                        <img src="/login.svg" alt="Email Icon" className="input-icon"/>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                               placeholder="Login" required className="login-box"/>
                    </div>
                    <div className="input-field">
                        <img src="/password.svg" alt="Password Icon" className="input-icon"/>
                        <input type={showPassword ? "text" : "password"} value={password}
                               onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
                               className="password-box"/>
                        <img src={showPassword ? eyeOpen : eyeClose} alt="Show Password Icon"
                             className="show-password-icon" onClick={toggleShowPassword}/>
                    </div>
                    {activeButton === 'signUp' && (
                        <div className="input-field">
                            <img src="/password.svg" alt="Confirm Password Icon" className="input-icon"/>
                            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                                   onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password"
                                   required
                                   className="password-box"/>
                            <img src={showConfirmPassword ? eyeOpen : eyeClose} alt="Show Confirm Password Icon"
                                 className="show-password-icon" onClick={toggleShowConfirmPassword}/>
                        </div>
                    )}
                    <div className="buttons-container">
                        <button type="button"
                                className={activeButton === 'signIn' ? 'active-button' : 'inactive-button'}
                                onClick={() => {
                                    if (activeButton === 'signUp') {
                                        switchButton('signIn');
                                    } else {
                                        submitForm();
                                    }
                                }}>
                            Войти
                        </button>
                        <button type="button"
                                className={activeButton === 'signUp' ? 'active-button' : 'inactive-button'}
                                onClick={() => switchButton('signUp')}>
                            Зарегистрироваться
                        </button>
                        {activeButton === 'signUp' && (
                            <button type="submit" className="inactive-button">Подтвердить</button>
                        )}
                    </div>
                </form>
            </div>
            <div className="project-section">
                <h1>CryptoGaze</h1>
                <p>Краткое описание проекта в одно предложение</p>
            </div>
        </div>
    );
}

export default Welcome;