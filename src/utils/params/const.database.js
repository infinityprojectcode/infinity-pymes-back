import dotenv from "dotenv";
dotenv.config();

export const variablesDB = ({
    data_base: process.env.DATABASE
})