// 1) Imports
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');

// 2) App
const app = express();
app.set('trust proxy', 1); // 🔥 Indispensable pour GitHub Codespaces avec HTTPS
const port = process.env.PORT || 3000;

// 3) Middleware CORS dynamique (avant routes !)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || '*');
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 4) Middleware
app.use(express.json());
app.use(session({
  secret: 'unSecretAleatoire',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none'
  }
}));

// 5) Connexion PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'mon-postgres.chwcc86weoq6.ca-central-1.rds.amazonaws.com',
  database: 'geoportail',
  password: 'Le27012000,',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// 6) Tables config
const tablesConfig = {
  "rail": { columns: ["id", "geom", "nom"], geometryColumn: "geom" },
  "batiment": { columns: ["id", "geom", "type"], geometryColumn: "geom" },
  "education": { columns: ["id", "geom", "nom"], geometryColumn: "geom" },
  "finance": { columns: ["id", "geom", "nom"], geometryColumn: "geom" },
  "hydrographie_ligne": { columns: ["id", "geom", "nom"], geometryColumn: "geom" },
  "hydrographie_polygone": { columns: ["id", "geom", "nom"], geometryColumn: "geom" },
  "route": { columns: ["id", "geom", "classification", "nom"], geometryColumn: "geom" },
  "place_publique": { columns: ["id", "geom", "nom"], geometryColumn: "geom" },
  "point_interet": { columns: ["id", "geom", "nom"], geometryColumn: "geom" },
  "sante": { columns: ["id", "geom", "nom"], geometryColumn: "geom" }
};
const isTableValid = (table) => tablesConfig.hasOwnProperty(table);

// 7) Requêtes SQL dynamiques
function buildInsertQuery(table, feature) {
  const { columns, geometryColumn } = tablesConfig[table];
  const { type, geometry, properties } = feature;
  if (type !== "Feature" || !geometry) throw new Error("GeoJSON invalide");
  const cols = [], values = [], placeholders = [];
  let idx = 1;

  columns.forEach(col => {
    if (col !== 'id' && col !== geometryColumn) {
      cols.push(col);
      values.push(properties[col] ?? null);
      placeholders.push(`$${idx++}`);
    }
  });

  cols.push(geometryColumn);
  placeholders.push(`ST_SetSRID(ST_GeomFromGeoJSON($${idx}), 4326)`);
  values.push(JSON.stringify(geometry));

  const query = `INSERT INTO public.${table} (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING id`;
  return { query, values };
}

function buildUpdateQuery(table, feature, id) {
  const { columns, geometryColumn } = tablesConfig[table];
  const { type, geometry, properties } = feature;
  if (type !== "Feature" || !geometry) throw new Error("GeoJSON invalide");
  const setClauses = [], values = [];
  let idx = 1;

  columns.forEach(col => {
    if (col !== 'id' && col !== geometryColumn && properties[col] !== undefined) {
      setClauses.push(`${col} = $${idx}`);
      values.push(properties[col]);
      idx++;
    }
  });

  setClauses.push(`${geometryColumn} = ST_SetSRID(ST_GeomFromGeoJSON($${idx}), 4326)`);
  values.push(JSON.stringify(geometry));
  values.push(id);

  const query = `UPDATE public.${table} SET ${setClauses.join(',')} WHERE id = $${idx + 1} RETURNING id`;
  return { query, values };
}

// 8) Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session?.user) return next();
  return res.status(401).json({ error: 'Non authentifié' });
};

// 9) Routes principales
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM public.users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Mot de passe invalide' });

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ success: true, role: user.role });
  } catch (err) {
    console.error("Erreur /login :", err);
    res.status(500).json({ error: err.message });
  }
});



app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Erreur de déconnexion" });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// ✅ Nouvelle route pour vérifier l'auth
app.get('/check-auth', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});




app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Connexion OK", now: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:table', async (req, res) => {
  const table = req.params.table;
  if (!isTableValid(table)) return res.status(400).json({ error: "Table invalide" });
  try {
    const result = await pool.query(`SELECT * FROM public.${table} ORDER BY id`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/:table', isAuthenticated, async (req, res) => {
  const table = req.params.table;
  if (!isTableValid(table)) return res.status(400).json({ error: "Table invalide" });
  try {
    const { query, values } = buildInsertQuery(table, req.body);
    const result = await pool.query(query, values);
    res.json({ insertedId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/:table/:id', isAuthenticated, async (req, res) => {
  const { table, id } = req.params;
  if (!isTableValid(table)) return res.status(400).json({ error: "Table invalide" });
  try {
    const { query, values } = buildUpdateQuery(table, req.body, id);
    const result = await pool.query(query, values);
    if (result.rowCount === 0) return res.status(404).json({ error: "ID introuvable" });
    res.json({ updatedId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/:table/:id', isAuthenticated, async (req, res) => {
  const { table, id } = req.params;
  if (!isTableValid(table)) return res.status(400).json({ error: "Table invalide" });
  try {
    const result = await pool.query(`DELETE FROM public.${table} WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "ID introuvable" });
    res.json({ deletedId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback test route
app.get('/', (req, res) => {
  res.send("Serveur backend en cours d'exécution ✅");
});

// Démarrage serveur
app.listen(port, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${port}`);
});