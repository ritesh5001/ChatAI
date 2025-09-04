import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/theme.css';

const Register = () => {
    const [ form, setForm ] = useState({ email: '', firstname: '', lastname: '', password: '' });
    const [ submitting, setSubmitting ] = useState(false);
    const navigate = useNavigate();


    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [ name ]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        console.log(form);

        axios.post("http://localhost:3000/api/auth/register", {
            email: form.email,
            fullName: {
                firstName: form.firstname,
                lastName: form.lastname
            },
            password: form.password
        }, {
            withCredentials: true
        }).then((res) => {
            console.log(res);
            navigate("/");
        }).catch((err) => {
            console.error(err);
            alert('Registration failed (placeholder)');
        })

        try {
            // Placeholder: integrate real registration logic / API call.

        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="center-min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="auth-card" role="main" aria-labelledby="register-heading" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', padding: 'var(--space-6) var(--space-5)', maxWidth: 400, width: '100%' }}>
                <header className="auth-header" style={{ marginBottom: 'var(--space-4)' }}>
                    <h1 id="register-heading" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-lg)' }}>Create account</h1>
                    <p className="auth-sub" style={{ color: 'var(--color-text-muted)' }}>Join us and start exploring.</p>
                </header>
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group" style={{ marginBottom: 'var(--space-4)' }}>
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }} />
                    </div>
                    <div className="grid-2" style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <div className="field-group" style={{ flex: 1 }}>
                            <label htmlFor="firstname">First name</label>
                            <input id="firstname" name="firstname" placeholder="Jane" value={form.firstname} onChange={handleChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }} />
                        </div>
                        <div className="field-group" style={{ flex: 1 }}>
                            <label htmlFor="lastname">Last name</label>
                            <input id="lastname" name="lastname" placeholder="Doe" value={form.lastname} onChange={handleChange} required style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }} />
                        </div>
                    </div>
                    <div className="field-group" style={{ marginBottom: 'var(--space-4)' }}>
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Create a password" value={form.password} onChange={handleChange} required minLength={6} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }} />
                    </div>
                    <button type="submit" className="primary-btn" disabled={submitting} style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '0.75em 2em', fontWeight: 'var(--font-weight-medium)', border: 'none', marginTop: 'var(--space-3)' }}>
                        {submitting ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
                <p className="auth-alt" style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </div>
    );
};

export default Register;

