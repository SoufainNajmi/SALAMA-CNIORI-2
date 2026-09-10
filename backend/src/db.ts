/** Pool de connexions MySQL — voir docker-compose.yml (salama-mysql, port 3308). */
import mysql from "mysql2/promise";

import { config } from "./config";

export const db = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
});
