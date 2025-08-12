import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Traer registros principales de mis proveedores

export const getMyOrders = async (req, res) => {
  const idBussines = req.params.id || 1;
  const conn = await getConnection();
  const db = variablesDB.database;
  const query = `
    SELECT
      CONCAT(po.code, '-', YEAR(CURDATE()), '-', po.id) AS number_order,
      s.name name_supplier,
      s.created_at,
      po.order_date,
      po.total,
      pos.name state_name
    FROM ${db}.purchase_orders po
    INNER JOIN ${db}.suppliers s
      ON s.id = po.supplier_id
    LEFT JOIN ${db}.purchase_order_status pos
      ON pos.id = po.status_id
    WHERE po.business_id = ${idBussines }
    ORDER BY po.order_date DESC;
  `;
  const select = await conn.query(query);
  if (!select) return res.json({
    status: 500,
    message: 'Error obteniendo los datos'
  });
  return res.json(select[0]);
}
