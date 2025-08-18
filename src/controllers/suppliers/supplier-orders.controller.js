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
      DATE_FORMAT(po.created_at, '%Y-%m-%d') created_at,
	    DATE_FORMAT(po.order_date, '%Y-%m-%d') order_date,
      po.total,
      pos.name state_name
    FROM ${db}.purchase_orders po
    INNER JOIN ${db}.suppliers s
      ON s.id = po.supplier_id
    LEFT JOIN ${db}.purchase_order_status pos
      ON pos.id = po.status_id
    WHERE po.business_id = ${idBussines}
    ORDER BY po.order_date DESC;
  `;
  const select = await conn.query(query);
  if (!select) return res.json({
    status: 500,
    message: 'Error obteniendo los datos'
  });
  return res.json(select[0]);
}

// Guardar orden de compra
export const saveSupplierOrdes = async (req, res) => {
  const {
    business_id,
    code,
    supplier_id,
    status_id,
    subtotal,
    tax,
    total,
    date_delivery,
    products,
  } = req.body;

  if (
    !business_id ||
    !code ||
    !supplier_id ||
    !status_id ||
    !subtotal ||
    !tax ||
    !total ||
    !date_delivery ||
    !products ||
    products.length === 0
  ) {
    return res.json(responseQueries.error({ message: "Datos incompletos" }));
  }

  let conn;
  try {
    conn = await getConnection();
    const db = variablesDB.database;

    await conn.beginTransaction();

    // Insertar cabecera de orden
    const queryOrder = `
      INSERT INTO ${db}.purchase_orders 
        (business_id, code, supplier_id, order_date, date_delivery, subtotal, tax, total, status_id, created_at)
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, NOW())
    `;
    const valuesOrder = [
      business_id,
      code,
      supplier_id,
      date_delivery,
      subtotal,
      tax,
      total,
      status_id,
    ];
    const [orderResult] = await conn.query(queryOrder, valuesOrder);

    const orderId = orderResult.insertId;

    // Insertar productos (detalle)
    const queryItems = `
      INSERT INTO ${db}.purchase_order_items 
        (purchase_order_id, product_id, quantity, unit_price, total)
      VALUES ?
    `;

    const valuesItems = products.map((p) => [
      orderId,
      p.product_id,
      p.quantity,
      p.price,
      p.quantity * p.price,
    ]);

    await conn.query(queryItems, [valuesItems]);

    await conn.commit();

    return res.json(
      responseQueries.success({ message: "Orden de compra guardada correctamente" })
    );
  } catch (error) {
    if (conn) await conn.rollback();
    return res.json(
      responseQueries.error({ message: "Error al guardar la orden de compra", error })
    );
  }
};
