import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Get data from the table
export const getScheduleAppointments = async (req, res) => {
    const { business_id, user_id, date } = req.query;

    if (!business_id || !user_id) {
        return res.json(responseQueries.error({ message: "ID perdido, necesitas el ID para hacer la consulta" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT 
        sa.id, 
        sa.title, 
        CONCAT(c.name, ' ', c.lastname) AS customer, 
        DATE_FORMAT(sa.date, '%Y-%m-%d') AS date, 
        DATE_FORMAT(sa.time, '%H:%i') AS time, 
        sa.status, 
        sa.duration, 
        sa.notes
    FROM ${db}.schedule_appointments sa
    JOIN ${db}.customers c ON sa.customer_id = c.id 
    WHERE sa.business_id = ?
        AND sa.user_id = ?
        AND (? IS NULL OR sa.date = ?)
    ORDER BY sa.created_at DESC;
    `;

    const params = [business_id, user_id, date || null, date || null];

    const select = await conn.query(query, params);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getAppointmentsToday = async (req, res) => {
    const { business_id, user_id } = req.query;

    if (!business_id || !user_id) {
        return res.json(responseQueries.error({ message: "ID perdido, necesitas el ID para hacer la consulta" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT COUNT(*) AS total_appointments_today
    FROM ${db}.schedule_appointments sa
    WHERE sa.business_id = ?
        AND sa.user_id = ?
        AND sa.date = CURDATE();
  `;
    const select = await conn.query(query, [business_id, user_id]);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Save data to the table
export const saveScheduleAppointments = async (req, res) => {
    const { title, customer_id, date, time, status, duration, notes, business_id, user_id } = req.body;

    if (!title || !customer_id || !date || !time || !status || !duration || notes === undefined || notes === null || !business_id || !user_id) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;

    const insert = await conn.query(
        `INSERT INTO ${db}.schedule_appointments
        (title, customer_id, date, time, status, duration, notes, business_id, user_id)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [title, customer_id, date, time, status, duration, notes, business_id, user_id]
    );

    if (!insert) return res.json(responseQueries.error({ message: "Error al guardar los datos" }));

    return res.json(responseQueries.success({ message: "Datos guardados con éxito" }));
};

// Update table data
export const updateScheduleAppointments = async (req, res) => {
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
            `UPDATE ${db}.schedule_appointments SET column1 = ?, column2 = ? WHERE id = ?`,
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
export const deleteScheduleAppointments = async (req, res) => {
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
            DELETE FROM ${db}.schedule_appointments WHERE id = ?;
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