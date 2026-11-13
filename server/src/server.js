import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import seedAdmin from './modules/admin/admin.seed.js'
dotenv.config()

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})


const startServer = async () => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    await connectDB();
    await seedAdmin();
}

startServer()