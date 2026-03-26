import zod from "zod";
import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3000, () => {
    console.log("Server started on port 3000");
});