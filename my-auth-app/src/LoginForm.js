import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ pour envoyer le cookie
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data);

        const urlParams = new URLSearchParams(window.location.search);
        const fromEdit = urlParams.get('from') === 'edit';

        if (window.opener) {
          if (fromEdit) {
            window.opener.postMessage('auth-success-edit', '*');
          } else {
            window.opener.location.reload();
          }
          window.close();
        } else {
          window.location.href = 'https://organic-trout-g4rr47j5p4xph54j-8000.app.github.dev';
        }
      } else {
        setError(data.error || 'Nom d’utilisateur ou mot de passe incorrect');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau : impossible de contacter le serveur');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Se connecter</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">Connexion</button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;

console.log("🧪 window.opener :", window.opener);
