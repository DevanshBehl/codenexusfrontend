import { prisma } from "./lib/prisma.js";

const createUser = async () => {
    const user = await prisma.user.create({
        data: {
            email: "devanshbhel@gmail.com",
            password: "anudev0405",
            role: "STUDENT"

        }
    })
    console.log("user created", user);
}

createUser();
