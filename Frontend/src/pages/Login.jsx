import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/theme.css';


const Login = () => {
    const [ form, setForm ] = useState({ email: '', password: '' });
    const [ submitting, setSubmitting ] = useState(false);
    const navigate = useNavigate();
    

    function handleChange(e) {
        const {name,value} = e.target;
        setForm({...form,[name]:value});
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);


        console.log(form);

        axios.post("http://localhost:3000/api/auth/login", {
            email: form.email,
            password: form.password
        },
            {
                withCredentials: true
            }
        ).then((res) => {
            console.log(res);
            navigate("/");
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            setSubmitting(false);
        });

    }

    return (
        <div className="center-min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="auth-card" role="main" aria-labelledby="login-heading" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', padding: 'var(--space-6) var(--space-5)', maxWidth: 400, width: '100%' }}>
                <header className="auth-header" style={{ marginBottom: 'var(--space-4)' }}>
                    <h1 id="login-heading" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-lg)' }}>Sign in</h1>
                    <p className="auth-sub" style={{ color: 'var(--color-text-muted)' }}>Welcome back. We've missed you.</p>
                </header>
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group" style={{ marginBottom: 'var(--space-4)' }}>
                        <label htmlFor="login-email">Email</label>
                        <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" onChange={handleChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }} />
                    </div>
                    <div className="field-group" style={{ marginBottom: 'var(--space-4)' }}>
                        <label htmlFor="login-password">Password</label>
                        <input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="Your password" onChange={handleChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }} />
                    </div>
                    <button type="submit" className="primary-btn" disabled={submitting} style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '0.75em 2em', fontWeight: 'var(--font-weight-medium)', border: 'none', marginTop: 'var(--space-3)' }}>
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <p className="auth-alt" style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Need an account? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
};

export default Login;

