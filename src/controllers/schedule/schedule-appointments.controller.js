import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Get data from the table
export const getScheduleAppointments = async (req, res) => {
    const { business_id, user_id } = req.query;

    if (!business_id || !user_id) {
        return res.json(responseQueries.error({ message: "ID perdido, necesitas el ID para hacer la consulta" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT 
        id, 
        title, 
        client, 
        DATE_FORMAT(date, '%Y-%m-%d') AS date, 
        DATE_FORMAT(time, '%H:%i') AS time, 
        status, 
        duration, 
        notes
    FROM ${db}.schedule_appointments
    WHERE business_id = ?
        AND user_id = ?
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
    const { column1, column2 } = req.body;

    if (!column1 || !column2) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;

    const insert = await conn.query(
        `INSERT INTO ${db}.schedule_appointments (column1, column2) VALUES (?, ?)`,
        [column1, column2]
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