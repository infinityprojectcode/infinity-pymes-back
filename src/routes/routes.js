import express from "express";

// Middlewares
import { AuthorizationVerify } from "../middleware/authorization.js"
import { ConnectionVerify } from "../middleware/connection.js"

// ----------- Controllers -----------

// Auth
import { getModulePermissions, saveModulePermissions, updateModulePermissions, deleteModulePermissions } from "../controllers/auth/module-permissions.controller.js"
import { getRoles, saveRoles, updateRoles, deleteRoles } from "../controllers/auth/roles.controller.js"
import { getUserRoles, saveUserRoles, updateUserRoles, deleteUserRoles } from "../controllers/auth/user-roles.controller.js"
import { registerUser, loginUser, generateKeyPair } from "../controllers/auth/users.controller.js"

// Backups
import { getBackups, saveBackups, updateBackups, deleteBackups } from "../controllers/backups/backups.controller.js"

// Billing
import { getBillingDetail, saveBillingDetail, updateBillingDetail, deleteBillingDetail } from "../controllers/billing/billing-detail.controller.js"
import { getBillingPayments, saveBillingPayments, updateBillingPayments, deleteBillingPayments } from "../controllers/billing/billing-payments.controller.js"
import { getBilling, saveBilling, updateBilling, deleteBilling } from "../controllers/billing/billing.controller.js"
import { getStateBilling, saveStateBilling, updateStateBilling, deleteStateBilling } from "../controllers/billing/state-billing.controller.js"

// Budgets
import { getBudgets, saveBudgets, updateBudgets, deleteBudgets } from "../controllers/budgets/budgets.controller.js"

// Businesses
import { getBusinesses, saveBusinesses, updateBusinesses, deleteBusinesses } from "../controllers/businesses/businesses.controller.js"

// Cash Register
import { getCashCounts, saveCashCounts, updateCashCounts, deleteCashCounts } from "../controllers/cash-register/cash-counts.controller.js"
import { getCashMovements, saveCashMovements, updateCashMovements, deleteCashMovements } from "../controllers/cash-register/cash-movements.controller.js"
import { getDailyClosures, saveDailyClosures, updateDailyClosures, deleteDailyClosures } from "../controllers/cash-register/daily-closures.controller.js"

// CDI
import { getCdi, saveCdi, updateCdi, deleteCdi } from "../controllers/cdi/cdi.controller.js"

// Config
import { getConfigurations, saveConfigurations, updateConfigurations, deleteConfigurations } from "../controllers/config/configurations.controller.js"
import { getPanelConfig, savePanelConfig, updatePanelConfig, deletePanelConfig } from "../controllers/config/panel-config.controller.js"

// Customers
import { getCustomerStats, saveCustomerStats, updateCustomerStats, deleteCustomerStats } from "../controllers/customers/customer-stats.controller.js"
import { getCustomers, saveCustomers, updateCustomers, deleteCustomers } from "../controllers/customers/customers.controller.js"

// Events
import { getEvents, saveEvents, updateEvents, deleteEvents } from "../controllers/events/events.controller.js"

// Expenses
import { getFunds, saveFunds, updateFunds, deleteFunds } from "../controllers/expenses/funds.controller.js"
import { getTotalExpenses, getTotalMonthExpenses, getTotalOutstandingExpenses, getTotalActiveCategories, getChartOneExpenses, getChartTwoExpenses, getRecordsExpenses, getExpenseTypes, saveExpense, updateOperationalExpenses, deleteOperationalExpenses } from "../controllers/expenses/operational-expenses.controller.js"

// Payments
import { getPaymentMethods, savePaymentMethods, updatePaymentMethods, deletePaymentMethods } from "../controllers/payments/payment-methods.controller.js"
import { getTransactions, saveTransactions, updateTransactions, deleteTransactions } from "../controllers/payments/transactions.controller.js"

// Products
import { getCategoriesProducts, saveCategoriesProducts, updateCategoriesProducts, deleteCategoriesProducts } from "../controllers/products/categories-products.controller.js"
import { getCategories, saveCategories, updateCategories, deleteCategories } from "../controllers/products/categories.controller.js"
import { getInventory, saveInventory, updateInventory, deleteInventory } from "../controllers/products/inventory.controller.js"
import { getProducts, saveProducts, updateProducts, deleteProducts } from "../controllers/products/products.controller.js"
import { getStateStock, saveStateStock, updateStateStock, deleteStateStock } from "../controllers/products/state-stock.controller.js"

// Purchases
import { getPurchaseHistory, savePurchaseHistory, updatePurchaseHistory, deletePurchaseHistory } from "../controllers/purchases/purchase-history.controller.js"
import { getPurchaseOrderItems, savePurchaseOrderItems, updatePurchaseOrderItems, deletePurchaseOrderItems } from "../controllers/purchases/purchase-order-items.controller.js"
import { getPurchaseOrderStatus, savePurchaseOrderStatus, updatePurchaseOrderStatus, deletePurchaseOrderStatus } from "../controllers/purchases/purchase-order-status.controller.js"
import { getPurchaseOrders, savePurchaseOrders, updatePurchaseOrders, deletePurchaseOrders } from "../controllers/purchases/purchase-orders.controller.js"
import { getPurchaseReceipts, savePurchaseReceipts, updatePurchaseReceipts, deletePurchaseReceipts } from "../controllers/purchases/purchase-receipts.controller.js"

// Reports
import { getReportsExported, saveReportsExported, updateReportsExported, deleteReportsExported } from "../controllers/reports/reports-exported.controller.js"

// Suppliers
import { getSupplierCategories, saveSupplierCategories, updateSupplierCategories, deleteSupplierCategories } from "../controllers/suppliers/supplier-categories.controller.js"
import { getSupplierContacts, saveSupplierContacts, updateSupplierContacts, deleteSupplierContacts } from "../controllers/suppliers/supplier-contacts.controller.js"
import { getMySuppliers, saveSuppliers, getMySuppliersFilter, getSuppliers } from "../controllers/suppliers/suppliers.controller.js"
import { getMyOrders, saveSupplierOrdes } from "../controllers/suppliers/supplier-orders.controller.js";
import { getSupplierStatus } from "../controllers/suppliers/supplier-status.controller.js"

// Database
import { getConnect } from "../database/connection.controller.js"

const router = express();

export const routes = () => {

    // --------------- Auth ---------------

    // Module Permissions
    router.get("/auth/g/module-permissions", AuthorizationVerify, getModulePermissions)
    router.post("/auth/i/module-permissions", AuthorizationVerify, saveModulePermissions)
    router.put("/auth/u/module-permissions", AuthorizationVerify, updateModulePermissions)
    router.delete("/auth/d/module-permissions", AuthorizationVerify, deleteModulePermissions)

    // Roles
    router.get("/auth/g/roles", AuthorizationVerify, getRoles)
    router.post("/auth/i/roles", AuthorizationVerify, saveRoles)
    router.put("/auth/u/roles", AuthorizationVerify, updateRoles)
    router.delete("/auth/d/roles", AuthorizationVerify, deleteRoles)

    // User Roles
    router.get("/auth/g/user-roles", AuthorizationVerify, getUserRoles)
    router.post("/auth/i/user-roles", AuthorizationVerify, saveUserRoles)
    router.put("/auth/u/user-roles", AuthorizationVerify, updateUserRoles)
    router.delete("/auth/d/user-roles", AuthorizationVerify, deleteUserRoles)

    // Users
    router.post("/auth/i/registers/users", AuthorizationVerify, registerUser)
    router.post("/auth/i/login/users", AuthorizationVerify, loginUser)
    router.get("/auth/g/generate", AuthorizationVerify, generateKeyPair)

    // --------------- Backups ---------------

    // Backups
    router.get("/backups/g/backups", AuthorizationVerify, getBackups)
    router.post("/backups/i/backups", AuthorizationVerify, saveBackups)
    router.put("/backups/u/backups", AuthorizationVerify, updateBackups)
    router.delete("/backups/d/backups", AuthorizationVerify, deleteBackups)

    // --------------- Billing ---------------

    // Billing Detail
    router.get("/billing/g/billing-detail", AuthorizationVerify, getBillingDetail)
    router.post("/billing/i/billing-detail", AuthorizationVerify, saveBillingDetail)
    router.put("/billing/u/billing-detail", AuthorizationVerify, updateBillingDetail)
    router.delete("/billing/d/billing-detail", AuthorizationVerify, deleteBillingDetail)

    // Billing Payments
    router.get("/billing/g/billing-payments", AuthorizationVerify, getBillingPayments)
    router.post("/billing/i/billing-payments", AuthorizationVerify, saveBillingPayments)
    router.put("/billing/u/billing-payments", AuthorizationVerify, updateBillingPayments)
    router.delete("/billing/d/billing-payments", AuthorizationVerify, deleteBillingPayments)

    // Billing
    router.get("/billing/g/billing", AuthorizationVerify, getBilling)
    router.post("/billing/i/billing", AuthorizationVerify, saveBilling)
    router.put("/billing/u/billing", AuthorizationVerify, updateBilling)
    router.delete("/billing/d/billing/:id", AuthorizationVerify, deleteBilling)

    // State Billing
    router.get("/billing/g/state-billing", AuthorizationVerify, getStateBilling)
    router.post("/billing/i/state-billing", AuthorizationVerify, saveStateBilling)
    router.put("/billing/u/state-billing", AuthorizationVerify, updateStateBilling)
    router.delete("/billing/d/state-billing", AuthorizationVerify, deleteStateBilling)

    // --------------- Budgets ---------------

    // Budgets
    router.get("/budgets/g/budgets", AuthorizationVerify, getBudgets)
    router.post("/budgets/i/budgets", AuthorizationVerify, saveBudgets)
    router.put("/budgets/u/budgets", AuthorizationVerify, updateBudgets)
    router.delete("/budgets/d/budgets", AuthorizationVerify, deleteBudgets)

    // --------------- Businesses ---------------

    // Businesses
    router.get("/businesses/g/businesses", AuthorizationVerify, getBusinesses)
    router.post("/businesses/i/businesses", AuthorizationVerify, saveBusinesses)
    router.put("/businesses/u/businesses", AuthorizationVerify, updateBusinesses)
    router.delete("/businesses/d/businesses", AuthorizationVerify, deleteBusinesses)

    // --------------- Cash Register ---------------

    // Cash Counts
    router.get("/cash-register/g/cash-counts", AuthorizationVerify, getCashCounts)
    router.post("/cash-register/i/cash-counts", AuthorizationVerify, saveCashCounts)
    router.put("/cash-register/u/cash-counts", AuthorizationVerify, updateCashCounts)
    router.delete("/cash-register/d/cash-counts", AuthorizationVerify, deleteCashCounts)

    // Cash Movements
    router.get("/cash-register/g/cash-movements", AuthorizationVerify, getCashMovements)
    router.post("/cash-register/i/cash-movements", AuthorizationVerify, saveCashMovements)
    router.put("/cash-register/u/cash-movements", AuthorizationVerify, updateCashMovements)
    router.delete("/cash-register/d/cash-movements", AuthorizationVerify, deleteCashMovements)

    // Daily Closures
    router.get("/cash-register/g/daily-closures", AuthorizationVerify, getDailyClosures)
    router.post("/cash-register/i/daily-closures", AuthorizationVerify, saveDailyClosures)
    router.put("/cash-register/u/daily-closures", AuthorizationVerify, updateDailyClosures)
    router.delete("/cash-register/d/daily-closures", AuthorizationVerify, deleteDailyClosures)

    // --------------- CDI ---------------

    // CDI
    router.get("/cdi/g/cdi", AuthorizationVerify, getCdi)
    router.post("/cdi/i/cdi", AuthorizationVerify, saveCdi)
    router.put("/cdi/u/cdi", AuthorizationVerify, updateCdi)
    router.delete("/cdi/d/cdi", AuthorizationVerify, deleteCdi)

    // --------------- Config ---------------

    // Configurations
    router.get("/config/g/configurations", AuthorizationVerify, getConfigurations)
    router.post("/config/i/configurations", AuthorizationVerify, saveConfigurations)
    router.put("/config/u/configurations", AuthorizationVerify, updateConfigurations)
    router.delete("/config/d/configurations", AuthorizationVerify, deleteConfigurations)

    // Panel Config
    router.get("/config/g/panel-config", AuthorizationVerify, getPanelConfig)
    router.post("/config/i/panel-config", AuthorizationVerify, savePanelConfig)
    router.put("/config/u/panel-config", AuthorizationVerify, updatePanelConfig)
    router.delete("/config/d/panel-config", AuthorizationVerify, deletePanelConfig)

    // --------------- Customers ---------------

    // Customer Stats
    router.get("/customers/g/customer-stats", AuthorizationVerify, getCustomerStats)
    router.post("/customers/i/customer-stats", AuthorizationVerify, saveCustomerStats)
    router.put("/customers/u/customer-stats", AuthorizationVerify, updateCustomerStats)
    router.delete("/customers/d/customer-stats", AuthorizationVerify, deleteCustomerStats)

    // Customers
    router.get("/customers/g/customers", AuthorizationVerify, getCustomers)
    router.post("/customers/i/customers", AuthorizationVerify, saveCustomers)
    router.put("/customers/u/customers", AuthorizationVerify, updateCustomers)
    router.delete("/customers/d/customers", AuthorizationVerify, deleteCustomers)

    // --------------- Events ---------------

    // Events
    router.get("/events/g/events", AuthorizationVerify, getEvents)
    router.post("/events/i/events", AuthorizationVerify, saveEvents)
    router.put("/events/u/events", AuthorizationVerify, updateEvents)
    router.delete("/events/d/events", AuthorizationVerify, deleteEvents)

    // --------------- Expenses ---------------

    // Funds
    router.get("/expenses/g/funds", AuthorizationVerify, getFunds)
    router.post("/expenses/i/funds", AuthorizationVerify, saveFunds)
    router.put("/expenses/u/funds", AuthorizationVerify, updateFunds)
    router.delete("/expenses/d/funds", AuthorizationVerify, deleteFunds)

    // Operational Expenses
    router.get("/expenses/g/expenses-total", AuthorizationVerify, getTotalExpenses)
    router.get("/expenses/g/expenses-total-month", AuthorizationVerify, getTotalMonthExpenses)
    router.get("/expenses/g/expenses-total-outstanding", AuthorizationVerify, getTotalOutstandingExpenses)
    router.get("/expenses/g/expenses-total-categories", AuthorizationVerify, getTotalActiveCategories)
    router.get("/expenses/g/expenses-chart-one", AuthorizationVerify, getChartOneExpenses)
    router.get("/expenses/g/expenses-chart-two", AuthorizationVerify, getChartTwoExpenses)
    router.get("/expenses/g/expenses-records", AuthorizationVerify, getRecordsExpenses)
    router.get("/expenses/g/expenses-types", AuthorizationVerify, getExpenseTypes)
    router.post("/expenses/i/expenses", AuthorizationVerify, saveExpense)
    router.put("/expenses/u/operational-expenses", AuthorizationVerify, updateOperationalExpenses)
    router.delete("/expenses/d/operational-expenses", AuthorizationVerify, deleteOperationalExpenses)

    // --------------- Payments ---------------

    // Payment Methods
    router.get("/payments/g/payment-methods", AuthorizationVerify, getPaymentMethods)
    router.post("/payments/i/payment-methods", AuthorizationVerify, savePaymentMethods)
    router.put("/payments/u/payment-methods", AuthorizationVerify, updatePaymentMethods)
    router.delete("/payments/d/payment-methods", AuthorizationVerify, deletePaymentMethods)

    // Transactions
    router.get("/payments/g/transactions", AuthorizationVerify, getTransactions)
    router.post("/payments/i/transactions", AuthorizationVerify, saveTransactions)
    router.put("/payments/u/transactions", AuthorizationVerify, updateTransactions)
    router.delete("/payments/d/transactions", AuthorizationVerify, deleteTransactions)

    // --------------- Products ---------------

    // Categories Products
    router.get("/products/g/categories-products", AuthorizationVerify, getCategoriesProducts)
    router.post("/products/i/categories-products", AuthorizationVerify, saveCategoriesProducts)
    router.put("/products/u/categories-products", AuthorizationVerify, updateCategoriesProducts)
    router.delete("/products/d/categories-products", AuthorizationVerify, deleteCategoriesProducts)

    // Categories
    router.get("/products/g/categories", AuthorizationVerify, getCategories)
    router.post("/products/i/categories", AuthorizationVerify, saveCategories)
    router.put("/products/u/categories", AuthorizationVerify, updateCategories)
    router.delete("/products/d/categories", AuthorizationVerify, deleteCategories)

    // Inventory
    router.get("/products/g/inventory", AuthorizationVerify, getInventory)
    router.post("/products/i/inventory", AuthorizationVerify, saveInventory)
    router.put("/products/u/inventory/:id", AuthorizationVerify, updateInventory)
    router.delete("/products/d/inventory/:id", AuthorizationVerify, deleteInventory)

    // Products
    router.get("/products/g/products", AuthorizationVerify, getProducts)
    router.post("/products/i/products", AuthorizationVerify, saveProducts)
    router.put("/products/u/products", AuthorizationVerify, updateProducts)
    router.delete("/products/d/products", AuthorizationVerify, deleteProducts)

    // StateStock
    router.get("/products/g/state-stock", AuthorizationVerify, getStateStock)
    router.post("/products/i/state-stock", AuthorizationVerify, saveStateStock)
    router.put("/products/u/state-stock", AuthorizationVerify, updateStateStock)
    router.delete("/products/d/state-stock", AuthorizationVerify, deleteStateStock)

    // --------------- Purchases ---------------

    // Purchase History
    router.get("/purchases/g/purchase-history", AuthorizationVerify, getPurchaseHistory)
    router.post("/purchases/i/purchase-history", AuthorizationVerify, savePurchaseHistory)
    router.put("/purchases/u/purchase-history", AuthorizationVerify, updatePurchaseHistory)
    router.delete("/purchases/d/purchase-history", AuthorizationVerify, deletePurchaseHistory)

    // Purchase Order Items
    router.get("/purchases/g/purchase-order-items", AuthorizationVerify, getPurchaseOrderItems)
    router.post("/purchases/i/purchase-order-items", AuthorizationVerify, savePurchaseOrderItems)
    router.put("/purchases/u/purchase-order-items", AuthorizationVerify, updatePurchaseOrderItems)
    router.delete("/purchases/d/purchase-order-items", AuthorizationVerify, deletePurchaseOrderItems)

    // Purchase Order Status
    router.get("/purchases/g/purchase-order-status", AuthorizationVerify, getPurchaseOrderStatus)
    router.post("/purchases/i/purchase-order-status", AuthorizationVerify, savePurchaseOrderStatus)
    router.put("/purchases/u/purchase-order-status", AuthorizationVerify, updatePurchaseOrderStatus)
    router.delete("/purchases/d/purchase-order-status", AuthorizationVerify, deletePurchaseOrderStatus)

    // Purchase Orders
    router.get("/purchases/g/purchase-orders", AuthorizationVerify, getPurchaseOrders)
    router.post("/purchases/i/purchase-orders", AuthorizationVerify, savePurchaseOrders)
    router.put("/purchases/u/purchase-orders", AuthorizationVerify, updatePurchaseOrders)
    router.delete("/purchases/d/purchase-orders", AuthorizationVerify, deletePurchaseOrders)

    // Purchase Receipts
    router.get("/purchases/g/purchase-receipts", AuthorizationVerify, getPurchaseReceipts)
    router.post("/purchases/i/purchase-receipts", AuthorizationVerify, savePurchaseReceipts)
    router.put("/purchases/u/purchase-receipts", AuthorizationVerify, updatePurchaseReceipts)
    router.delete("/purchases/d/purchase-receipts", AuthorizationVerify, deletePurchaseReceipts)

    // --------------- Reports ---------------

    // Reports Exported
    router.get("/reports/g/reports-exported", AuthorizationVerify, getReportsExported)
    router.post("/reports/i/reports-exported", AuthorizationVerify, saveReportsExported)
    router.put("/reports/u/reports-exported", AuthorizationVerify, updateReportsExported)
    router.delete("/reports/d/reports-exported", AuthorizationVerify, deleteReportsExported)

    // Suppliers
    router.post("/suppliers/i/supplier-my-bussines/:id", AuthorizationVerify, getMySuppliers)
    router.post("/suppliers/i/orders/:id", AuthorizationVerify, getMyOrders)
    router.post("/suppliers/i/suppliers", AuthorizationVerify, saveSuppliers)
    router.get("/suppliers/g/suppliers/filter/:id", AuthorizationVerify, getMySuppliersFilter)
    router.post("/suppliers/i/suppliers/orders", AuthorizationVerify, saveSupplierOrdes)
    router.get("/suppliers/g/supplier-status", AuthorizationVerify, getSupplierStatus)
    router.get("/suppliers/g/suppliers", AuthorizationVerify, getSuppliers)

    // Supplier Categories
    router.get("/suppliers/g/supplier-categories", AuthorizationVerify, getSupplierCategories)
    router.post("/suppliers/i/supplier-categories", AuthorizationVerify, saveSupplierCategories)
    router.put("/suppliers/u/supplier-categories", AuthorizationVerify, updateSupplierCategories)
    router.delete("/suppliers/d/supplier-categories", AuthorizationVerify, deleteSupplierCategories)

    // Supplier Contacts
    router.get("/suppliers/g/supplier-contacts", AuthorizationVerify, getSupplierContacts)
    router.post("/suppliers/i/supplier-contacts", AuthorizationVerify, saveSupplierContacts)
    router.put("/suppliers/u/supplier-contacts", AuthorizationVerify, updateSupplierContacts)
    router.delete("/suppliers/d/supplier-contacts", AuthorizationVerify, deleteSupplierContacts)

    // Supplier Status
    router.get("/suppliers/g/supplier-status", AuthorizationVerify, getSupplierStatus)

    // Database
    router.get("/connect/", ConnectionVerify, getConnect)

    return router;
}