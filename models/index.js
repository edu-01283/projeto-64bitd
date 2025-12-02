// models/index.js - Versão CORRIGIDA (Case Sensitive)

// ====================================================
// 1. IMPORTAÇÃO DO BANCO DE DADOS
// ====================================================
const { sequelize, testConnection } = require('../config/database'); 

// ====================================================
// 2. IMPORTAÇÃO DOS MODELOS
// ====================================================
// CORREÇÃO: Os nomes aqui devem ser idênticos aos nomes dos arquivos físicos
// Linux diferencia 'User' de 'user'.

const User = require('./User');         // Corrigido de './user' para './User'
const Game = require('./Game');         // Corrigido de './game' para './Game'
const UserGame = require('./UserGame'); // Corrigido de './userGame' para './UserGame'

const Profile = require('./profile');   // Mantido minúsculo (arquivo é profile.js)
const Review = require('./review');     // Mantido minúsculo (arquivo é review.js)


// ====================================================
// 3. DEFINE AS ASSOCIAÇÕES (RELACIONAMENTOS)
// ====================================================

// --- Relação 1:1: Usuário <--> Perfil ---
User.hasOne(Profile, { 
    foreignKey: 'UsuarioID', 
    as: 'Perfil', 
    onDelete: 'CASCADE' 
});
Profile.belongsTo(User, { foreignKey: 'UsuarioID' });


// --- Relação N:M: Usuário <--> Jogo (Biblioteca/Favoritos) ---
User.belongsToMany(Game, { 
    through: UserGame, 
    foreignKey: 'fk_Usuarios_ID', 
    as: 'JogosFavoritos' 
});
Game.belongsToMany(User, { 
    through: UserGame, 
    foreignKey: 'fk_Jogos_ID', 
    as: 'UsuariosComJogo' 
});


// --- Relação 1:N: Reviews (Avaliações) ---

// 3.1 Usuário <--> Review
User.hasMany(Review, { foreignKey: 'UsuarioID', as: 'Avaliacoes' });
Review.belongsTo(User, { foreignKey: 'UsuarioID', as: 'Usuario' }); 

// 3.2 Jogo <--> Review
Game.hasMany(Review, { foreignKey: 'JogoID', as: 'Avaliacoes' });
Review.belongsTo(Game, { foreignKey: 'JogoID', as: 'Jogo' }); 


// ====================================================
// 4. EXPORTAÇÃO
// ====================================================
module.exports = {
    sequelize,
    testConnection,
    User,
    Profile,
    Game,
    UserGame,
    Review 
};