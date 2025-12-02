// models/index.js - Versão FINAL AJUSTADA AOS NOMES DE ARQUIVO

// ====================================================
// 1. IMPORTAÇÃO DO BANCO DE DADOS
// ====================================================
const { sequelize, testConnection } = require('../config/database'); 

// ====================================================
// 2. IMPORTAÇÃO DOS MODELOS
// ====================================================
// ATENÇÃO: As importações abaixo estão ajustadas exatamente para os nomes
// dos arquivos presentes no seu repositório.

const User = require('./user');         // Arquivo está como User.js (Maiúsculo)
const Game = require('./game');         // Arquivo está como Game.js (Maiúsculo)
const UserGame = require('./userGame'); // Arquivo está como UserGame.js (Maiúsculo)

const Profile = require('./profile');   // Arquivo está como profile.js (minúsculo)
const Review = require('./review');     // Arquivo está como review.js (minúsculo)


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