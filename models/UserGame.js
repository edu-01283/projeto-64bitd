// models/userGame.js

const { DataTypes } = require('sequelize');
const db = require('../config/database'); 
const sequelize = db.sequelize;           

const UserGame = sequelize.define('UsuarioJogo', {
    fk_Usuarios_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Usuarios', 
            key: 'ID',
        }
    },
    fk_Jogos_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Jogos', 
            key: 'ID',
        }
    },
    Data_Aquisicao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    Status: {
        type: DataTypes.STRING,
        defaultValue: 'Favorito', 
    },
    Nota: {
        type: DataTypes.FLOAT,
        allowNull: true,
    }
}, {
    tableName: 'Usuarios_Jogos',
    timestamps: false,
    primaryKey: false, 
});

module.exports = UserGame;