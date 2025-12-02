// models/index.js - ARQUIVO CENTRAL DE EXPORTAÇÃO E ASSOCIAÇÕES

// ====================================================
// 1. IMPORTAÇÃO DO BANCO DE DADOS
// ====================================================
// Importa a instância do Sequelize (sequelize) e a função de teste de conexão.
const { sequelize, testConnection } = require('../config/database'); 

// ====================================================
// 2. IMPORTAÇÃO DOS MODELOS (CORREÇÃO DE CASE SENSITIVE 🛠️)
// ====================================================
// CRÍTICO PARA O RENDER: As importações DEVEM ser em lowercase para corresponder aos nomes que o GitHub está rastreando.
const User = require('./user');       
const Profile = require('./profile');   
const Game = require('./game');         
const UserGame = require('./userGame'); 
const Review = require('./review');     

// ====================================================
// 3. DEFINE AS ASSOCIAÇÕES (RELACIONAMENTOS)
// ====================================================

// --- Relação 1:1: Usuário <--> Perfil ---
// Um Usuário tem UM Perfil.
User.hasOne(Profile, { 
    foreignKey: 'UsuarioID', 
    as: 'Perfil', 
    onDelete: 'CASCADE' 
});
// Um Perfil pertence a UM Usuário.
Profile.belongsTo(User, { foreignKey: 'UsuarioID' });


// --- Relação N:M: Usuário <--> Jogo (Biblioteca/Favoritos) ---
// Um Usuário tem MUITOS Jogos (através da tabela UserGame).
User.belongsToMany(Game, { 
    through: UserGame,         
    foreignKey: 'fk_Usuarios_ID', 
    as: 'JogosFavoritos'       
});
// Um Jogo pertence a MUITOS Usuários (através da tabela UserGame).
Game.belongsToMany(User, { 
    through: UserGame,         
    foreignKey: 'fk_Jogos_ID',    
    as: 'UsuariosComJogo'      
});


// --- Relação 1:N: Reviews (Avaliações) ---

// 3.1 Usuário <--> Review
// Um Usuário pode ter MUITAS Avaliações.
User.hasMany(Review, { foreignKey: 'UsuarioID', as: 'Avaliacoes' });
// Uma Avaliação pertence a UM Usuário.
Review.belongsTo(User, { foreignKey: 'UsuarioID', as: 'Usuario' }); 

// 3.2 Jogo <--> Review
// Um Jogo pode ter MUITAS Avaliações.
Game.hasMany(Review, { foreignKey: 'JogoID', as: 'Avaliacoes' });
// Uma Avaliação pertence a UM Jogo.
Review.belongsTo(Game, { foreignKey: 'JogoID', as: 'Jogo' }); 


// ====================================================
// 4. EXPORTAÇÃO CENTRALIZADA
// ====================================================
// Exporta todos os componentes para que sejam importados em um único 'require' no server.js.
module.exports = {
    sequelize,
    testConnection,
    User,
    Profile,
    Game,
    UserGame,
    Review 
};