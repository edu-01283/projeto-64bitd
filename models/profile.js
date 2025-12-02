// models/profile.js

const { DataTypes } = require('sequelize');
const db = require('../config/database'); 
const sequelize = db.sequelize;           

const Profile = sequelize.define('Perfil', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    UsuarioID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Garante a relação 1:1
    },
    Bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: 'Perfis',
    timestamps: true,
});

module.exports = Profile;