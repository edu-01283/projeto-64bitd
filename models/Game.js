// models/game.js

const { DataTypes } = require('sequelize');
const db = require('../config/database'); 
const sequelize = db.sequelize;           

const Game = sequelize.define('Jogo', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    Nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    Desenvolvedora: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    Publicante: { // Adicionado conforme seu modelo SQL
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    Ano_de_Lancamento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    Genero: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    coverArt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bannerImg: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'Jogos',
    timestamps: true,
});

module.exports = Game;