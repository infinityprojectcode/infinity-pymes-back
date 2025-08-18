import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Traer proveedores de mi negocio
export const getMySuppliersFilter = async (req, res) => {
    const idBussines = req.params.id;
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
        SELECT s.id, s.name FROM ${db}.suppliers s
        WHERE s.business_id = ${idBussines}
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}


// Traer registros principales de mis proveedores
export const getMySuppliers = async (req, res) => {
    const idBussines = req.params.id;
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
        SELECT
            s.id,
            s.name AS name_bussines,
            sc.name AS contact_name,
            sc2.name AS category,
            ss.name status_name,
            s.payment_terms,
            SUM(ph.price) AS total_price
        FROM suppliers s
        INNER JOIN ${db}.businesses b
            ON b.id = s.business_id
        LEFT JOIN ${db}.supplier_contacts sc
            ON sc.supplier_id = s.id
        LEFT JOIN ${db}.supplier_categories sc2
            ON sc2.id = s.category_id
        LEFT JOIN ${db}.purchase_history ph
            ON ph.business_id = s.business_id
            AND ph.supplier_id = s.id
        RIGHT JOIN supplier_status ss
	        ON ss.id = s.status_id
        WHERE b.id = ${idBussines}
        GROUP BY
            s.id,
            b.name,
            sc.name,
            sc2.name,
            ss.name,
            s.status_id,
            s.payment_terms;
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Crear proveedor
export const saveSuppliers = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    await conn.beginTransaction();

    try {
        const {
            business_id,
            name,
            tax_id,
            address,
            phone,
            email,
            website,
            payment_terms,
            payment_method,
            currency,
            status_id,
            category_id,
            contact_name,
            contact_title,
            contact_email,
            contact_phone
        } = req.body;

        if (
            !business_id || !name || !tax_id || !contact_name || !contact_email
        ) {
            return res.json(responseQueries.error({ message: "Datos incompletos" }));
        }

        // Insertar en suppliers
        const supplierInsert = await conn.query(
            `INSERT INTO ${db}.suppliers
            (business_id, name, tax_id, address, phone, email, website, payment_terms, payment_method, currency, status_id, category_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                business_id, name, tax_id, address, phone, email, website,
                payment_terms, payment_method, currency, status_id, category_id
            ]
        );

        if (!supplierInsert || !supplierInsert[0].insertId) {
            await conn.rollback();
            return res.json(responseQueries.error({ message: "Error al guardar el proveedor" }));
        }

        const supplierId = supplierInsert[0].insertId;

        // Insertar contacto asociado
        const contactInsert = await conn.query(
            `INSERT INTO ${db}.supplier_contacts
            (supplier_id, name, title, email, phone)
            VALUES (?, ?, ?, ?, ?)`,
            [supplierId, contact_name, contact_title, contact_email, contact_phone]
        );

        if (!contactInsert) {
            await conn.rollback();
            return res.json(responseQueries.error({ message: "Error al guardar el contacto" }));
        }

        // Confirmar transacción
        await conn.commit();
        return res.json(responseQueries.success({ message: "Proveedor y contacto guardados con éxito" }));
    } catch (error) {
        await conn.rollback();
        return res.json(responseQueries.error({ message: "Error interno del servidor" }));
    }
};