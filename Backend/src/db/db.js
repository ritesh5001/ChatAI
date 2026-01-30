const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function connectDb() {
    try {
        await sequelize.authenticate();
        console.log("Connected to PostgreSQL");
        
        // Sync all models (creates tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log("Database synchronized");
    } catch (err) {
        console.error("Error connecting to PostgreSQL", err);
    }
}

module.exports = { connectDb, sequelize };