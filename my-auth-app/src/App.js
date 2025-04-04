// src/App.js
import React, { useState } from 'react';
import LoginForm from './LoginForm';
// Si tu as d'autres styles personnalisés, importe-les ici
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (data) => {
    setUser(data);
  };

  return (
    <div className="App">
      {user ? (
        <div>
          <h1>Bienvenue, {user.role}</h1>
          {/* Ici, tu peux intégrer un bouton pour retourner à Geoportail 
              ou afficher un message indiquant que l'utilisateur est authentifié */}
        </div>
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
