import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

export const getDayIncomeMovements = async (req, res) => {
    const { business_id } = req.query;

    if (!business_id) {
        return res.json(responseQueries.error({ message: "ID perdido, necesitas el ID para hacer la consulta" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT
        SUM(bd.subtotal) as income_today
    FROM ${db}.billing b
    JOIN ${db}.billing_detail bd ON b.id = bd.billing_id
    WHERE b.business_id = 1
    AND b.state_billing_id = 1
    AND DATE(b.created_at) = CURDATE()
    GROUP BY b.id, b.created_at , b.expiration_at
    ORDER BY b.id ASC;
  `;
    const select = await conn.query(query, [business_id]);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Get data from the table
export const getDayMovements = async (req, res) => {
    const { business_id } = req.query;

    if (!business_id) {
        return res.json(responseQueries.error({ message: "ID perdido, necesitas el ID para hacer la consulta" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT SUM(ed.amount) AS gastos_dia
    FROM ${db}.expenses e
    JOIN ${db}.expense_details ed 
        ON e.id = ed.expense_id
    WHERE e.state <> 'cancelled'
        AND e.business_id = ?
        AND DATE(e.date) = CURDATE();
  `;
    const select = await conn.query(query, [business_id]);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getMovementsRecords = async (req, res) => {
    const { business_id } = req.query;

    if (!business_id) {
        return res.json(responseQueries.error({ message: "ID perdido, necesitas el ID para hacer la consulta" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT 
        DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') AS date,
        'Ingreso' AS type_movement,
        CONCAT('Venta a ', c.name, ' ', c.lastname) AS description,
        'Ventas' AS category,
        'Efectivo' AS payment_method,
        SUM(bd.subtotal) AS amount,
        CONCAT('FAC-', YEAR(NOW()), '-', LPAD(b.id, 3, '0')) AS reference
    FROM ${db}.billing b
    JOIN ${db}.customers c ON b.customer_id = c.id
    JOIN ${db}.billing_detail bd ON b.id = bd.billing_id
    WHERE b.business_id = ?
    GROUP BY b.id, b.created_at, c.name, c.lastname
    UNION ALL
    SELECT 
        DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s') AS date,
        'Egreso' AS type_movement,
        e.description AS description,
        et.name AS category,
        pm.name AS payment_method,
        ed.amount AS amount,
        e.receipt_number AS reference
    FROM ${db}.expenses e
    JOIN ${db}.expense_details ed ON e.id = ed.expense_id
    JOIN ${db}.expense_types et ON ed.expense_type_id = et.id
    LEFT JOIN ${db}.payment_methods pm ON e.payment_method_id = pm.id
    WHERE e.business_id = ?
    ORDER BY date DESC;
  `;
    const select = await conn.query(query, [business_id, business_id]);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Save data to the table
export const saveCashMovements = async (req, res) => {
    const { column1, column2 } = req.body;

    if (!column1 || !column2) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;

    const insert = await conn.query(
        `INSERT INTO ${db}.CashMovements (column1, column2) VALUES (?, ?)`,
        [column1, column2]
    );

    if (!insert) return res.json(responseQueries.error({ message: "Error al guardar los datos" }));

    return res.json(responseQueries.success({ message: "Datos guardados con éxito" }));
};

// Update table data
export const updateCashMovements = async (req, res) => {
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
            `UPDATE ${db}.CashMovements SET column1 = ?, column2 = ? WHERE id = ?`,
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
export const deleteCashMovements = async (req, res) => {
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
            DELETE FROM ${db}.CashMovements WHERE id = ?;
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