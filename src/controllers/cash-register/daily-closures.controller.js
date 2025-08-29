import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Get data from the table
export const getDailyClosures = async (req, res) => {
    const { business_id } = req.query;

    if (!business_id) {
        return res.json(responseQueries.error({ message: "ID perdido, necesitas el ID para hacer la consulta" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT 
      DATE(dc.closure_date) AS closure_date,
      LAG(dc.closing_amount, 1, 0) OVER (PARTITION BY dc.business_id ORDER BY dc.closure_date) AS opening_balance,
      b.income_day,
      e.expenses_day,
      (
        LAG(dc.closing_amount, 1, 0) OVER (PARTITION BY dc.business_id ORDER BY dc.closure_date)
        + COALESCE(b.income_day,0)
        - COALESCE(e.expenses_day,0)
      ) AS total_expected,
      dc.closing_amount,
      (
        dc.closing_amount - (
          LAG(dc.closing_amount, 1, 0) OVER (PARTITION BY dc.business_id ORDER BY dc.closure_date)
          + COALESCE(b.income_day,0)
          - COALESCE(e.expenses_day,0)
        )
      ) AS difference,
      u.name AS closed_by_user
    FROM ${db}.daily_closures dc
    LEFT JOIN (
      SELECT DATE(b.created_at) AS fecha, SUM(bd.subtotal) AS income_day
      FROM ${db}.billing b
      JOIN ${db}.billing_detail bd 
        ON b.id = bd.billing_id
      WHERE b.business_id = ?
        AND b.state_billing_id = 1
      GROUP BY DATE(b.created_at)
    ) b ON DATE(dc.closure_date) = b.fecha
    LEFT JOIN (
      SELECT DATE(e.date) AS fecha, SUM(ed.amount) AS expenses_day
      FROM ${db}.expenses e
      JOIN ${db}.expense_details ed 
        ON e.id = ed.expense_id
      WHERE e.business_id = ?
        AND e.state <> 'cancelled'
      GROUP BY DATE(e.date)
    ) e ON DATE(dc.closure_date) = e.fecha
    LEFT JOIN ${db}.users u
      ON dc.closed_by = u.id
    WHERE dc.business_id = ?
    ORDER BY closure_date DESC;
    `;
    const select = await conn.query(query, [business_id, business_id, business_id]);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Save data to the table
export const saveDailyClosures = async (req, res) => {
    const { business_id, closing_amount, notes, closed_by } = req.body;

    if (!business_id || !closing_amount || notes === undefined || notes === null || !closed_by) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;

    const insert = await conn.query(
        `INSERT INTO ${db}.daily_closures
        (business_id, closing_amount, notes, closed_by)
        VALUES(?, ?, ?, ?);`,
        [business_id, closing_amount, notes, closed_by]
    );

    if (!insert) return res.json(responseQueries.error({ message: "Error al guardar los datos" }));

    return res.json(responseQueries.success({ message: "Datos guardados con éxito" }));
};

// Update table data
export const updateDailyClosures = async (req, res) => {
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
            `UPDATE ${db}.DailyClosures SET column1 = ?, column2 = ? WHERE id = ?`,
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
export const deleteDailyClosures = async (req, res) => {
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
            DELETE FROM ${db}.DailyClosures WHERE id = ?;
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