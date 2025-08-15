import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Get data from the table
// NOTA: El id del where se cambia dependiendo de que usuario es quien consulta, por el momento es 1 pero debe cambiarse a una variable dinámica
export const getBilling = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;

    const query = `
    SELECT
        b.id AS billing_id,
        CONCAT('FAC-', YEAR(NOW()), '-', LPAD(b.id, 3, '0')) AS code,
        c.name AS customer_name,
        DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') AS billing_date,
        DATE_FORMAT(b.expiration_at, '%Y-%m-%d %H:%i:%s') AS billing_expiration,
        SUM(bd.quantity) as total_consumption,
        SUM(bd.subtotal) as total_price,
        sb.name_state
    FROM ${db}.billing b
    JOIN ${db}.customers c ON b.customer_id  = c.id
    JOIN ${db}.state_billing sb ON b.state_billing_id = sb.id
    JOIN ${db}.billing_detail bd ON b.id = bd.billing_id
    WHERE b.business_id = 1
    GROUP BY b.id, c.name, b.created_at , b.expiration_at, sb.name_state
    ORDER BY b.id ASC;
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Save data to the table
// NOTA: Agregar la variable de business_id cuando exista login
export const saveBilling = async (req, res) => {
    const { customer_id, product_price, expiration_at, quantity, product_id } = req.body;

    if (!customer_id || !product_price || !expiration_at || !quantity || !product_id) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const subtotal = quantity * product_price

    const conn = await getConnection();
    const db = variablesDB.database;

    // business_id, customer_id, total, state_billing_id, expiration_at, quantity, product_id, subtotal

    const insert = await conn.query(
        `CALL ${db}.insert_billing_and_detail(?, ?, ?, ?, ?, ?, ?, ?);`,
        [1, customer_id, quantity, 2, expiration_at, quantity, product_id, subtotal]
    );

    if (!insert) return res.json(responseQueries.error({ message: "Error al guardar los datos" }));

    return res.json(responseQueries.success({ message: "Datos guardados con éxito" }));
};

// Update table data
export const updateBilling = async (req, res) => {
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
            `UPDATE ${db}.billing SET column1 = ?, column2 = ? WHERE id = ?`,
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
export const deleteBilling = async (req, res) => {
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
            DELETE FROM ${db}.billing WHERE id = ?;
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