import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { routes } from "./src/routes/routes.js"
import getConnection from "./src/database/connection.mysql.js"
dotenv.config();

const PORT = process.env.PORT || 3000;
// const API_URL = procces.env.API_URL || "/infinity-pymes/server/v1";

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const allowedOrigins = process.env.NODE_ENV === "production" ? ["https://infinitypymes.com"] : ["http://localhost:1600", "http://localhost:5173", "http://localhost:5174"]

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("No permitido por CORS"))
        }
    },
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true
};

app.use(cors(corsOptions))
app.use("/infinity-pymes/server/v1", routes());

// API Working
app.get("/", (req, res) => {
    res.json("Working")
})

app.listen(PORT, async () => {
    // Conectarse a la base de datos
    const connDb = await getConnection();
    if (!connDb) {
        console.log("\n╔══════════════════════════════════════════════╗");
        console.log("║     ⚠️  ERROR: Fallo al conectar DB  ⚠️     ║");
        console.log("╠══════════════════════════════════════════════╣");
        console.log("║ No se pudo establecer conexión con la base   ║");
        console.log("║ de datos. Verifique la configuración y el    ║");
        console.log("║ estado del servidor.                         ║");
        console.log("╚══════════════════════════════════════════════╝\n");
        process.exit(1); // Opcional: detener el servidor si no se conecta
    } else {
        console.log("\n╔════════════════════════════════════════════════════════╗");
        console.log("║                DB conectada correctamente              ║");
        console.log("╠════════════════════════════════════════════════════════╣");
        console.log("║    Servicio iniciado en:                               ║");
        console.log("║                                                        ║");
        console.log(`║    http://localhost:${PORT}/infinity-pymes/server/v1      ║`);
        console.log("╚════════════════════════════════════════════════════════╝\n");
    }
});
