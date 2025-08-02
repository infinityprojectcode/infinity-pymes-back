import dotenv from "dotenv";
dotenv.config();

export const variablesDB = ({
    database: process.env.MYSQL_DATABASE
})