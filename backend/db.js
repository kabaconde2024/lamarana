const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Configuration du pool de connexions adaptée pour TiDB Cloud
const poolConfig = {
  host: process.env.DB_HOST || "gateway01.eu-central-1.prod.aws.tidbcloud.com",
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || "3hFCBD1oLkmKmbk.root",
  password: process.env.DB_PASSWORD || "2v2wgmmYECyaCAlg",
  database: process.env.DB_NAME || "test",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // MODIFICATION TERMINALE : Utilisation du certificat SSL physique
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "isrgrootx1.pem")),
    rejectUnauthorized: true // Plus sécurisé avec le certificat fourni
  }
};

const pool = mysql.createPool(poolConfig);

// Tester la connexion au démarrage
pool.getConnection()
  .then(connection => {
    console.log(`✅ Connexion à la base de données réussie: ${poolConfig.database}@${poolConfig.host}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    console.error('Vérifiez que le fichier isrgrootx1.pem est bien présent dans le dossier backend.');
  });

/**
 * Exécute une requête SQL avec gestion d'erreurs améliorée
 */
async function query(sql, params = {}) {
  const startTime = Date.now();
  
  try {
    const [rows] = await pool.execute(sql, params);
    
    // Log des requêtes lentes (> 1 seconde)
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`[DB] Requête lente (${duration}ms):`, sql.substring(0, 100));
    }
    
    return rows;
  } catch (err) {
    // Log détaillé de l'erreur
    console.error("[DB] Erreur de requête:", {
      message: err.message,
      code: err.code,
      sqlState: err.sqlState,
      sql: sql.substring(0, 200),
      params: Object.keys(params).length > 0 ? Object.keys(params) : 'aucun',
    });
    
    throw err;
  }
}

/**
 * Teste si la base de données est accessible
 */
async function testConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('[DB] Test de connexion échoué:', err.message);
    return false;
  }
}

/**
 * Ferme proprement le pool de connexions
 */
async function closePool() {
  try {
    await pool.end();
    console.log('[DB] Pool de connexions fermé');
  } catch (err) {
    console.error('[DB] Erreur lors de la fermeture du pool:', err.message);
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  closePool,
};