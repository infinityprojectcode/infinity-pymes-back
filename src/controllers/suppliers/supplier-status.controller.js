import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Get data from the table
export const getSupplierStatus = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT * FROM ${db}.supplier_status`;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}