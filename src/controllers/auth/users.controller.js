
import { hashPassword, verifyPassword } from "../../utils/auth/handle-password.js";
import { responseQueries } from "../../common/enum/queries/response.queries.js";
import { variablesDB } from "../../utils/params/const.database.js";
import { generateToken } from "../../utils/token/handle-token.js";
import getConnection from "../../database/connection.mysql.js"
import * as jose from "jose";

// Endpoint de prueba: Generar claves públicas/privadas
export const generateKeyPair = async (req, res) => {
    try {
        // Generar par de claves RSA-OAEP-256
        const { publicKey, privateKey } = await jose.generateKeyPair("RSA-OAEP-256");

        // Exportar la clave pública como JWK
        const publicJwk = await jose.exportJWK(publicKey);

        // Exportar la clave privada como PKCS8 (solo para pruebas, no exponer en prod)
        // const privatePem = await jose.exportPKCS8(privateKey);

        return res.json(
            responseQueries.success({
                message: "Par de claves generado",
                data: {
                    publicKey: publicJwk,  // esta es la que mandarías en el body del login
                    // privateKey: privatePem
                }
            })
        );

    } catch (error) {
        return res.json(
            responseQueries.error({
                message: "Error al generar claves",
                error
            })
        );
    }
};

// Login de usuario
export const loginUser = async (req, res) => {
    const { email, password, publicKey } = req.body;

    if (!email || !password || !publicKey) {
        return res.json(
            responseQueries.error({ message: "Datos incompletos (email/password/publicKey)" })
        );
    }

    try {
        const conn = await getConnection();
        const db = variablesDB.database;

        // Buscar usuario con su rol
        const [users] = await conn.query(
            `SELECT u.id, u.business_id, u.name, u.email, u.password, u.role_id, r.name AS role_name
       FROM ${db}.users u
       INNER JOIN ${db}.roles r ON u.role_id = r.id
       WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.json(responseQueries.error({ message: "Usuario no encontrado" }));
        }

        const user = users[0];

        // Verificar contraseña
        const validPassword = await verifyPassword(password, user.password);
        if (!validPassword) {
            return res.json(responseQueries.error({ message: "Contraseña incorrecta" }));
        }

        // Obtener permisos (JOIN con modules)
        const [permissions] = await conn.query(
            `SELECT m.id, m.name, m.path
       FROM ${db}.module_permissions mp
       INNER JOIN ${db}.modules m ON mp.module_id = m.id
       WHERE mp.role_id = ?`,
            [user.role_id]
        );

        const allowedModules = permissions.map(p => ({
            id: p.id,
            name: p.name,
            path: p.path,
        }));

        // Generar token con información básica
        const accessToken = await generateToken(
            {
                id: user.id,
                business_id: user.business_id,
                email: user.email,
                role_id: user.role_id,
            },
            "8h"
        );

        // 1) Importar la JWK pública enviada por el front
        let clientKey;
        try {
            clientKey = await jose.importJWK(publicKey, 'RSA-OAEP-256');
        } catch (e) {
            return res.json(responseQueries.error({ message: "Clave pública inválida" }));
        }

        // 2) Armar el payload sensible
        const userPayload = {
            user: {
                id: user.id,
                business_id: user.business_id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                role_name: user.role_name,
            },
            permissions: allowedModules,
            // Puedes incluir aquí cualquier otro metadato que quieras cifrar
            ts: Date.now(),
        };

        // 3) Cifrar en formato JWE compacto
        const encoder = new TextEncoder();
        const jwe = await new jose.CompactEncrypt(
            encoder.encode(JSON.stringify(userPayload))
        )
            .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
            .encrypt(clientKey);   // ✅ usa la CryptoKey importada

        // Respuesta: token en claro + blob cifrado
        return res.json(
            responseQueries.success({
                message: "Login exitoso",
                data: {
                    accessToken,
                    dataToken: jwe,
                },
            })
        );
    } catch (error) {
        console.error("Error en login:", error);
        return res.json(
            responseQueries.error({ message: "Error al iniciar sesión", error })
        );
    }
};


// Registrar usuario
export const registerUser = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;

    const { username, email, password, business } = req.body;

    if (!username || !email || !password || !business) {
        return res.json(
            responseQueries.error({ message: "Datos incompletos" })
        );
    }

    try {
        // Iniciar transacción
        await conn.beginTransaction();

        // Insertar negocio
        const [insertBusiness] = await conn.query(
            `INSERT INTO ${db}.businesses (name, description, created_at)
             VALUES(?, ?, CURRENT_TIMESTAMP)`,
            [business, ""]
        );
        const businessId = insertBusiness.insertId;

        // Verificar si existe el rol "Administrador"
        const [existingRole] = await conn.query(
            `SELECT id FROM ${db}.roles WHERE name = ? LIMIT 1`,
            ["Administrador"]
        );

        let roleId;
        if (existingRole.length > 0) {
            roleId = existingRole[0].id;
        } else {
            const [insertRole] = await conn.query(
                `INSERT INTO ${db}.roles (name, description)
                 VALUES (?, ?)`,
                ["Administrador", "Rol con acceso total al sistema"]
            );
            roleId = insertRole.insertId;
        }

        // Encriptar contraseña
        const hashedPassword = await hashPassword({ password });

        // Insertar usuario con role_id
        await conn.query(
            `INSERT INTO ${db}.users
             (business_id, role_id, name, email, password, created_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [businessId, roleId, username, email, hashedPassword]
        );

        // Confirmar transacción
        await conn.commit();

        return res.json(
            responseQueries.success({
                message: "Usuario registrado correctamente",
            })
        );
    } catch (error) {
        // Revertir transacción en caso de error
        if (conn) await conn.rollback();
        console.error("Error al registrar usuario:", error);
        return res.json(
            responseQueries.error({
                message: "Error al registrar usuario",
                error,
            })
        );
    }
};
