import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Get data from the table
export const getBillingDetail = async (req, res) => {
    const { billing_id } = req.query;

    if (!billing_id) {
        return res.json(responseQueries.error({ message: "ID perdido, necesitas el ID para hacer la consulta" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT
        bd.id,
        bd.billing_id,
        bd.quantity,
        p.name AS product_name,
        p.price  AS product_price,
        bd.subtotal
    FROM ${db}.billing_detail bd
    JOIN ${db}.products p ON bd.product_id = p.id
    WHERE bd.billing_id = ?
    ORDER BY bd.id ASC;
    `;
    const select = await conn.query(query, [billing_id]);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Save data to the table
export const saveBillingDetail = async (req, res) => {
    const { column1, column2 } = req.body;

    if (!column1 || !column2) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;

    const insert = await conn.query(
        `INSERT INTO ${db}.billing_detail (column1, column2) VALUES (?, ?)`,
        [column1, column2]
    );

    if (!insert) return res.json(responseQueries.error({ message: "Error al guardar los datos" }));

    return res.json(responseQueries.success({ message: "Datos guardados con éxito" }));
};

// Update table data
export const updateBillingDetail = async (req, res) => {
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
            `UPDATE ${db}.billing_detail SET column1 = ?, column2 = ? WHERE id = ?`,
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
export const deleteBillingDetail = async (req, res) => {
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
            DELETE FROM ${db}.billing_detail WHERE id = ?;
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