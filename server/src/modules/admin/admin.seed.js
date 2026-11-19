import Admin from "./admin.model.js"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
dotenv.config()
const ADMIN = [
    {
        name:"ADMIN",
        email:process.env.ADMIN_EMAIL,
        password:process.env.ADMIN_PASSWORD
    }
]


const seedAdmin = async() => {
    try {
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.log("Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing")
            return
        }

        const exist = await Admin.findOne({email:process.env.ADMIN_EMAIL})
        if (exist) {
            console.log("Admin already exists")
            return
        }

        const hashedpassword = await bcrypt.hash(ADMIN[0].password, 10)
        await Admin.create({
            name: ADMIN[0].name,
            email: ADMIN[0].email,
            password: hashedpassword
        })
        console.log("Admin created")
    } catch (error) {
        console.log(error);
    }
}

export default seedAdmin