import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Traer registros principales de mis proveedores

export const getMySuppliers = async (req, res) => {
    const idBussines = req.params.id || 1;
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
        SELECT
            s.id,
            b.name AS name_bussines,
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
        INNER JOIN ${db}.purchase_history ph
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

// Get data from the table
export const getSuppliers = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT * FROM ${db}.Suppliers`;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Save data to the table
export const saveSuppliers = async (req, res) => {
    const { column1, column2 } = req.body;

    if (!column1 || !column2) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;

    const insert = await conn.query(
        `INSERT INTO ${db}.Suppliers (column1, column2) VALUES (?, ?)`,
        [column1, column2]
    );

    if (!insert) return res.json(responseQueries.error({ message: "Error al guardar los datos" }));

    return res.json(responseQueries.success({ message: "Datos guardados con éxito" }));
};

// Update table data
export const updateSuppliers = async (req, res) => {
    // Depending on how the ID is obtained, whether by URL or from the body, it is saved in a variable in a different way.

    // From URL
    // const { id } = req.params;

    // From BODY
    const { id, column1, column2 } = req.body;

    if (!id || !column1 || !column2) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    try {
        const conn = await getConnection();
        const db = variablesDB.database;

        const update = await conn.query(
            `UPDATE ${db}.Suppliers SET column1 = ?, column2 = ? WHERE id = ?`,
            [column1, column2, id]
        );

        if (update.affectedRows === 0) {
            return res.json(responseQueries.error({ message: "No se encontró el ID" }));
        }

        return res.json(responseQueries.success({ message: "Datos actualizados con éxito" }));
    } catch (error) {
        return res.json(responseQueries.error({ message: "Error al actualizar los datos", error }));
    }
};

// Delete data from the table
export const deleteSuppliers = async (req, res) => {
    // From URL
    // const { id } = req.params;

    // From BODY
    const { id } = req.body;

    if (!id) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }
    try {
        const conn = await getConnection();
        const db = variablesDB.database;

        const deleteQuery = `
            DELETE FROM ${db}.Suppliers WHERE id = ?;
        `;

        const [result] = await conn.query(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.json(responseQueries.error({ message: "No se encontró el ID o el ID no es válido o inexistente" }));
        }

        return res.json(responseQueries.success({ message: "Datos eliminados con éxito" }));
    } catch (error) {
        console.error("Error al eliminar los datos: ", error);
        return res.json(responseQueries.error({ message: "Error interno del servidor" }));
    }
}