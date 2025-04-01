/***********************************************
 * server.js
 ***********************************************/

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

//=== 1) CONFIG DE BASE ===//
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

// Configuration de la connexion à PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'mon-postgres.chwcc86weoq6.ca-central-1.rds.amazonaws.com',
  database: 'geoportail',
  password: 'Le27012000,',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

/**
 * Configuration des tables mises à jour
 */
const tablesConfig = {
  "rail": {
    columns: ["id", "geom", "nom"],
    geometryColumn: "geom"
  },
  "batiment": {
    columns: ["id", "geom", "type"],
    geometryColumn: "geom"
  },
  "education": {
    columns: ["id", "geom", "nom"],
    geometryColumn: "geom"
  },
  "finance": {
    columns: ["id", "geom", "nom"],
    geometryColumn: "geom"
  },
  "hydrographie_ligne": {
    columns: ["id", "geom", "nom"],
    geometryColumn: "geom"
  },
  "hydrographie_polygone": {
    columns: ["id", "geom", "nom"],
    geometryColumn: "geom"
  },
  "route": {
    columns: ["id", "geom", "classification", "nom"],
    geometryColumn: "geom"
  },
  "place_publique": {
    columns: ["id", "geom", "nom"],
    geometryColumn: "geom"
  },
  "point_interet": {
    columns: ["id", "geom", "nom"],
    geometryColumn: "geom"
  },
  "sante": {
    columns: ["id", "geom", "nom"],
    geometryColumn: "geom"
  }
};

// Vérifie si la table demandée est valide
function isTableValid(tableName) {
  return tablesConfig.hasOwnProperty(tableName);
}

// Construit dynamiquement la requête INSERT
function buildInsertQuery(tableName, feature) {
  const { columns, geometryColumn } = tablesConfig[tableName];
  const { type, geometry, properties } = feature;
  if (type !== "Feature" || !geometry) {
    throw new Error("Feature GeoJSON invalide.");
  }
  let cols = [];
  let values = [];
  let placeholders = [];
  let idx = 1;

  // Pour chaque colonne, ignorer "id" et la colonne géométrique
  columns.forEach(col => {
    if (col === "id" || col === geometryColumn) return;
    cols.push(col);
    values.push(properties[col] !== undefined ? properties[col] : null);
    placeholders.push(`$${idx}`);
    idx++;
  });

  // Ajout de la géométrie
  cols.push(geometryColumn);
  placeholders.push(`ST_SetSRID(ST_GeomFromGeoJSON($${idx}), 4326)`);
  values.push(JSON.stringify(geometry));

  const query = `INSERT INTO public.${tableName} (${cols.join(", ")})
                 VALUES (${placeholders.join(", ")}) RETURNING id`;
  return { query, values };
}

// Construit dynamiquement la requête UPDATE
function buildUpdateQuery(tableName, feature, id) {
  const { columns, geometryColumn } = tablesConfig[tableName];
  const { type, geometry, properties } = feature;
  if (type !== "Feature" || !geometry) {
    throw new Error("Feature GeoJSON invalide.");
  }
  let setClauses = [];
  let values = [];
  let idx = 1;

  columns.forEach(col => {
    if (col === "id" || col === geometryColumn) return;
    if (properties[col] !== undefined) {
      setClauses.push(`${col} = $${idx}`);
      values.push(properties[col]);
      idx++;
    }
  });

  // Mise à jour de la géométrie
  setClauses.push(`${geometryColumn} = ST_SetSRID(ST_GeomFromGeoJSON($${idx}), 4326)`);
  values.push(JSON.stringify(geometry));

  // Clause WHERE pour l'ID
  const query = `UPDATE public.${tableName} SET ${setClauses.join(", ")} WHERE id = $${idx + 1} RETURNING id`;
  values.push(id);
  return { query, values };
}

//=== Routes REST ===//

// Route de test pour vérifier la connexion à la base
app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Connexion à la base réussie", now: result.rows[0] });
  } catch (err) {
    console.error("Erreur de connexion à la base :", err);
    res.status(500).json({ error: "Erreur de connexion à la base", details: err.message });
  }
});

// GET : Liste tous les enregistrements d'une table
app.get('/api/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  if (!isTableValid(tableName)) {
    return res.status(400).json({ error: `Table inconnue ou non autorisée : ${tableName}` });
  }
  try {
    const result = await pool.query(`SELECT * FROM public.${tableName} ORDER BY id`);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET /api/:tableName :", err);
    res.status(500).json({ error: err.message });
  }
});

// POST : Insère un nouveau Feature dans la table
app.post('/api/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  if (!isTableValid(tableName)) {
    return res.status(400).json({ error: `Table inconnue ou non autorisée : ${tableName}` });
  }
  const feature = req.body;
  try {
    const { query, values } = buildInsertQuery(tableName, feature);
    const result = await pool.query(query, values);
    res.json({ insertedId: result.rows[0].id });
  } catch (err) {
    console.error("Erreur POST /api/:tableName :", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT : Met à jour un Feature existant par ID
app.put('/api/:tableName/:id', async (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  if (!isTableValid(tableName)) {
    return res.status(400).json({ error: `Table inconnue ou non autorisée : ${tableName}` });
  }
  const feature = req.body;
  try {
    const { query, values } = buildUpdateQuery(tableName, feature, id);
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Aucun enregistrement trouvé avec ID = ${id}` });
    }
    res.json({ updatedId: result.rows[0].id });
  } catch (err) {
    console.error("Erreur PUT /api/:tableName/:id :", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE : Supprime un Feature par ID
app.delete('/api/:tableName/:id', async (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  if (!isTableValid(tableName)) {
    return res.status(400).json({ error: `Table inconnue ou non autorisée : ${tableName}` });
  }
  try {
    const query = `DELETE FROM public.${tableName} WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Aucun enregistrement trouvé avec ID = ${id}` });
    }
    res.json({ deletedId: result.rows[0].id });
  } catch (err) {
    console.error("Erreur DELETE /api/:tableName/:id :", err);
    res.status(500).json({ error: err.message });
  }
});

//=== Lancement du serveur ===//
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
