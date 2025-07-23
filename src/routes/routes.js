import express from "express";

// Middlewares
import { AuthorizationVerify } from "../middleware/authorization.js"
import { ConnectionVerify } from "../middleware/connection.js"

// Controllers
import { getTest, saveTest, updateTest, deleteTest } from "../controllers/test.controller.js"

// Database
import { getConnect } from "../database/connection.controller.js"

const router = express();

export const routes = () => {

    // Routes CRUD example
    router.get("/test/g/test-name", AuthorizationVerify, getTest)
    router.post("/test/i/add-test-name", AuthorizationVerify, saveTest)
    router.put("/test/u/edit-test-name", AuthorizationVerify, updateTest)
    router.delete("/test/d/delete-test-name", AuthorizationVerify, deleteTest)

    // In case you want to obtain the id by the parameters (URL)
    // router.put("/test/u/edit-test-name/:id", AuthorizationVerify, updateTest)
    // router.delete("/test/d/delete-test-name/:id", AuthorizationVerify, deleteTest)

    // Database
    router.get("/connect/", ConnectionVerify, getConnect)

    return router;
}