// models/review.js

const { DataTypes } = require('sequelize');
const db = require('../config/database'); 
const sequelize = db.sequelize;           

const Review = sequelize.define('Avaliacao', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // Chave Estrangeira para o Usuário
    UsuarioID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // Chave Estrangeira para o Jogo
    JogoID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Avaliacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    Corpo_do_comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'Avaliacoes', // Nome da tabela no MySQL
    timestamps: true,
});

module.exports = Review;