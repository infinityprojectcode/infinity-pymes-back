import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Get data from the table
export const getTotalExpenses = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT SUM(ed.amount) AS total_gastos
    FROM ${db}.expenses e
    JOIN ${db}.expense_details ed ON e.id = ed.expense_id
    WHERE e.state <> 'cancelled';
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getTotalMonthExpenses = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT SUM(ed.amount) AS gastos_mes
    FROM ${db}.expenses e
    JOIN ${db}.expense_details ed ON e.id = ed.expense_id
    WHERE e.state <> 'cancelled'
        AND MONTH(e.date) = MONTH(CURDATE())
        AND YEAR(e.date) = YEAR(CURDATE());
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getTotalOutstandingExpenses = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT SUM(ed.amount) AS gastos_pendientes
    FROM ${db}.expenses e
    JOIN ${db}.expense_details ed ON e.id = ed.expense_id
    WHERE e.state = 'pending';
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getTotalActiveCategories = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT COUNT(id) AS amount FROM ${db}.expense_types;`;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getChartOneExpenses = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT 
        m.mes,
        COALESCE(SUM(ed.amount),0) AS gastos,
        COALESCE(SUM(ie.amount),0) AS ingresos
    FROM (
        SELECT 1 AS mes UNION ALL
        SELECT 2 UNION ALL
        SELECT 3 UNION ALL
        SELECT 4 UNION ALL
        SELECT 5 UNION ALL
        SELECT 6 UNION ALL
        SELECT 7 UNION ALL
        SELECT 8 UNION ALL
        SELECT 9 UNION ALL
        SELECT 10 UNION ALL
        SELECT 11 UNION ALL
        SELECT 12 
    ) m
    LEFT JOIN ${db}.expenses e 
        ON MONTH(e.date) = m.mes AND YEAR(e.date) = YEAR(CURDATE())
    LEFT JOIN ${db}.expense_details ed 
        ON e.id = ed.expense_id
    LEFT JOIN ${db}.income_entries ie 
        ON MONTH(ie.date) = m.mes AND YEAR(ie.date) = YEAR(CURDATE())
    GROUP BY m.mes
    ORDER BY m.mes;
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getChartTwoExpenses = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT et.name AS categoria,
       SUM(ed.amount) AS total_categoria,
       ROUND(SUM(ed.amount) * 100 / 
            (SELECT SUM(ed2.amount) 
             FROM ${db}.expense_details ed2
             JOIN ${db}.expenses e2 ON ed2.expense_id = e2.id
             WHERE e2.state <> 'cancelled'), 2) AS porcentaje
    FROM ${db}.expenses e
    JOIN ${db}.expense_details ed ON e.id = ed.expense_id
    JOIN ${db}.expense_types et ON ed.expense_type_id = et.id
    WHERE e.state <> 'cancelled'
    GROUP BY et.name;
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getRecordsExpenses = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT 
        e.id,
        DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s') AS date,
        e.description,
        et.name AS category,
        s.name AS supplier,
        pm.name AS payment_method,
        ed.amount,
        e.state,
        e.receipt_number AS receipt
    FROM ${db}.expenses e
    JOIN ${db}.expense_details ed ON e.id = ed.expense_id
    JOIN ${db}.expense_types et ON ed.expense_type_id = et.id
    LEFT JOIN ${db}.suppliers s ON e.supplier_id = s.id
    LEFT JOIN ${db}.payment_methods pm ON e.payment_method_id = pm.id
    ORDER BY e.created_at DESC;
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

export const getExpenseTypes = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT id, name FROM ${db}.expense_types;
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Save data to the table
export const saveExpense = async (req, res) => {
    const {
        business_id,
        fund_id,
        user_id,
        supplier_id,
        payment_method,
        description,
        state,
        expense_type_id,
        amount
    } = req.body;

    // Validación de datos obligatorios
    if (
        !business_id || !fund_id || !user_id || !supplier_id ||
        !payment_method || !description || !state ||
        !expense_type_id || !amount
    ) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;

    try {
        await conn.beginTransaction();

        // 1. Insert en expenses (sin receipt_number aún)
        const [expenseResult] = await conn.query(
            `INSERT INTO ${db}.expenses 
             (business_id, fund_id, user_id, supplier_id, payment_method_id, description, state, date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [business_id, fund_id, user_id, supplier_id, payment_method, description, state]
        );

        const expenseId = expenseResult.insertId;

        // 2. Generar receipt_number dinámico
        const receipt_number = `REC-${String(expenseId).padStart(3, "0")}`;

        // 3. Actualizar registro con el receipt_number
        await conn.query(
            `UPDATE ${db}.expenses SET receipt_number = ? WHERE id = ?`,
            [receipt_number, expenseId]
        );

        // 4. Insert en expense_details (usando el mismo description)
        await conn.query(
            `INSERT INTO ${db}.expense_details 
             (expense_id, expense_type_id, amount, description) 
             VALUES (?, ?, ?, ?)`,
            [expenseId, expense_type_id, amount, description]
        );

        await conn.commit();

        return res.json(responseQueries.success({
            message: "Gasto registrado con éxito",
            expense_id: expenseId,
            receipt_number
        }));

    } catch (error) {
        await conn.rollback();
        return res.json(responseQueries.error({ message: error.message }));
    }
};


// Update table data
export const updateOperationalExpenses = async (req, res) => {
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
            `UPDATE ${db}.OperationalExpenses SET column1 = ?, column2 = ? WHERE id = ?`,
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
export const deleteOperationalExpenses = async (req, res) => {
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
            DELETE FROM ${db}.OperationalExpenses WHERE id = ?;
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