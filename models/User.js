// models/user.js

const { DataTypes } = require('sequelize');
const db = require('../config/database'); // Importa a conexão
const sequelize = db.sequelize;           // Acessa a instância do Sequelize

const User = sequelize.define('Usuario', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Login: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true, 
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
        validate: {
            isEmail: true,
        }
    },
    Senha: {
        type: DataTypes.STRING(60), 
        allowNull: false,
    },
    AvatarUrl: {
        type: DataTypes.STRING,
        defaultValue: '/img/user-avatar.jpg',
    }
}, {
    tableName: 'Usuarios',
    timestamps: true,
});

module.exports = User;