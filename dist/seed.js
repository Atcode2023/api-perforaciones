"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const user_model_1 = tslib_1.__importDefault(require("./models/user.model"));
const bcrypt_1 = require("bcrypt");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/perforaciones';
async function seedAdminUser() {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('Conectado a la base de datos');
        const adminExists = await user_model_1.default.findOne({ role: 'ADMIN' });
        if (adminExists) {
            console.log('Ya existe un usuario Admin.');
            return;
        }
        const hashedPassword = await (0, bcrypt_1.hash)('admin123', 10); // Cambia esto por una contraseña segura
        const adminUser = new user_model_1.default({
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN',
            created_at: new Date(),
            deleted_at: null,
        });
        await adminUser.save();
        console.log('Usuario Admin creado con éxito.');
    }
    catch (error) {
        console.error('Error al hacer el seed:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
seedAdminUser();
//# sourceMappingURL=seed.js.map