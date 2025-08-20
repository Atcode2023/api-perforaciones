import mongoose from 'mongoose';
import userModel from './models/user.model';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/perforaciones';

async function seedAdminUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a la base de datos');

    const adminExists = await userModel.findOne({ role: 'ADMIN' });
    if (adminExists) {
      console.log('Ya existe un usuario Admin.');
      return;
    }

    const hashedPassword = await hash('admin123', 10); // Cambia esto por una contraseña segura
    const adminUser = new userModel({
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      created_at: new Date(),
      deleted_at: null,
    });
    await adminUser.save();
    console.log('Usuario Admin creado con éxito.');
  } catch (error) {
    console.error('Error al hacer el seed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdminUser();
