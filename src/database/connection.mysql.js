import connectionMysql from "../config/database.js"

let poll = null

const getConnection = async () => {
    try {
        if (pool) return pool; // Reuse the existing connection

        pool = await connectionMysql(); // It only runs once
        const ping = await pool.ping();
        if (!ping) {
            pool = null;
            return false;
        }
        return pool;
    } catch (error) {
        console.error("\n╔══════════════════════════════════════════════╗");
        console.error("║     ⚠️  ERROR: Fallo al conectar DB  ⚠️     ║");
        console.error("╚══════════════════════════════════════════════╝\n");
        console.log("╠══════════════════════════════════════════════╣");
        console.error(`║                    ${error}                     ║`);
        console.log("╚══════════════════════════════════════════════╝");
        pool = null;
        return false;
    }
};

export default getConnection;