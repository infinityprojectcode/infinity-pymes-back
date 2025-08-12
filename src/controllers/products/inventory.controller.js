import getConnection from "../../database/connection.mysql.js"
import { variablesDB } from "../../utils/params/const.database.js"
import { responseQueries } from "../../common/enum/queries/response.queries.js"

// Get data from the table

// NOTA: Cambiar el business_id a un signo de pregunta (?) al momento de agregar el inicio de sesión, para que asi sea dinámico, actualmente es fijo por no haber login

export const getInventory = async (req, res) => {
    const conn = await getConnection();
    const db = variablesDB.database;
    const query = `
    SELECT
        i.id AS inventory_id,
        p.name AS product_name,
        cp.name_category AS category,
        p.price,
        i.quantity,
        ss.name_state AS stock_state,
        s.name AS supplier_name
    FROM ${db}.inventory i
    JOIN ${db}.products p ON i.product_id = p.id
    JOIN ${db}.categories_products cp ON p.category_id = cp.id
    JOIN ${db}.state_stock ss ON i.stock_state_id = ss.id
    JOIN ${db}.suppliers s ON p.supplier_id = s.id
    WHERE i.business_id = 1
    ORDER BY i.id ASC;
    `;
    const select = await conn.query(query);
    if (!select) return res.json({
        status: 500,
        message: 'Error obteniendo los datos'
    });
    return res.json(select[0]);
}

// Save data to the table
// NOTA: Cuando se haga el login se deben auto completar desde el front los valores que no son una variable (o sea los que son data quemada en la lista de la consulta)
export const saveInventory = async (req, res) => {
    const { name, category_id, price, quantity } = req.body;

    const getStatus = (stock) => {
        if (quantity == 0) return 3;
        if (quantity <= 5) return 2;
        return 1;
    };

    const stock_state_id = getStatus(quantity)

    if (!name || !category_id || !price || !quantity || !stock_state_id) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    const conn = await getConnection();
    const db = variablesDB.database;

    // business_id, category_id, supplier_id, name, description, price, stock, stock_state_id, quantity, location

    const insert = await conn.query(
        `
        CALL ${db}.insert_product_inventory(
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        );
        `,
        [1, category_id, 1, name, null, price, quantity, stock_state_id, quantity, 'Bodega Central']
    );

    if (!insert) return res.json(responseQueries.error({ message: "Error al guardar los datos" }));

    return res.json(responseQueries.success({ message: "Datos guardados con éxito" }));
};

// Update table data
export const updateInventory = async (req, res) => {
    // Depending on how the ID is obtained, whether by URL or from the body, it is saved in a variable in a different way.

    // From URL
    const { id } = req.params;
    const product_id = id

    // From BODY
    const { category_id, name, price, quantity } = req.body;

    const getStatus = (stock) => {
        if (quantity == 0) return 3;
        if (quantity <= 5) return 2;
        return 1;
    };

    const stock_state_id = getStatus(quantity)

    if (!product_id || !category_id || !name || !price || !quantity || !stock_state_id) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }

    // product_id, category_id, supplier_id, name, description, price, stock, quantity, location, stock_state_id

    try {
        const conn = await getConnection();
        const db = variablesDB.database;

        const update = await conn.query(
            `
            CALL ${db}.update_product_and_inventory( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `,
            [product_id, category_id, 1, name, null, price, quantity, quantity, 'Bodega Central', stock_state_id]
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
export const deleteInventory = async (req, res) => {
    // From URL
    const { id } = req.params;

    // From BODY
    // const { id } = req.body;

    if (!id) {
        return res.json(responseQueries.error({ message: "Datos incompletos" }));
    }
    try {
        const conn = await getConnection();
        const db = variablesDB.database;

        const deleteQuery = `
            CALL ${db}.delete_product_and_inventory(?);
        `;

        const [result] = await conn.query(deleteQuery, [id]);

        if (result[0]?.status === 'NOT_FOUND') {
            return res.json(responseQueries.error({ message: "No se encontró el ID o el ID no es válido o inexistente" }));
        }

        return res.json(responseQueries.success({ message: "Datos eliminados con éxito" }));
    } catch (error) {
        console.error("Error al eliminar los datos: ", error);
        return res.json(responseQueries.error({ message: "Error interno del servidor" }));
    }
}