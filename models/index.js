// models/index.js - ARQUIVO CENTRAL DE EXPORTAÇÃO E ASSOCIAÇÕES

// ====================================================
// 1. IMPORTAÇÃO DO BANCO DE DADOS
// ====================================================
// Importa a instância do Sequelize (sequelize) e a função de teste de conexão.
const { sequelize, testConnection } = require('../config/database'); 

// ====================================================
// 2. IMPORTAÇÃO DOS MODELOS
// (Garantindo Lowercase para compatibilidade com Linux/Render)
// ====================================================
// Importa cada modelo definido separadamente.
const User = require('./user');       // Modelo de Usuário
const Profile = require('./profile');   // Modelo de Perfil (Informações adicionais do Usuário)
const Game = require('./game');         // Modelo de Jogo
const UserGame = require('./userGame'); // Modelo da tabela pivot (N:M) entre Usuário e Jogo
const Review = require('./review');     // Modelo de Avaliação/Review

// ====================================================
// 3. DEFINE AS ASSOCIAÇÕES (RELACIONAMENTOS)
// ====================================================

// --- Relação 1:1: Usuário <--> Perfil ---
// Um Usuário tem UM Perfil.
User.hasOne(Profile, { 
    foreignKey: 'UsuarioID', 
    as: 'Perfil', 
    onDelete: 'CASCADE' // Se o Usuário for deletado, o Perfil também é.
});
// Um Perfil pertence a UM Usuário (usando a mesma chave estrangeira).
Profile.belongsTo(User, { foreignKey: 'UsuarioID' });


// --- Relação N:M: Usuário <--> Jogo (Biblioteca/Favoritos) ---
// Um Usuário tem MUITOS Jogos (através da tabela UserGame).
User.belongsToMany(Game, { 
    through: UserGame,         // Tabela pivot (junção)
    foreignKey: 'fk_Usuarios_ID', // Chave do Usuário na tabela UserGame
    as: 'JogosFavoritos'       // Alias para quando buscar os jogos do Usuário
});
// Um Jogo pertence a MUITOS Usuários (através da tabela UserGame).
Game.belongsToMany(User, { 
    through: UserGame,         // Tabela pivot (junção)
    foreignKey: 'fk_Jogos_ID',    // Chave do Jogo na tabela UserGame
    as: 'UsuariosComJogo'      // Alias para quando buscar os usuários que têm o jogo
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
// Exporta a instância do Sequelize, a função de conexão e todos os modelos.
// Isso permite que sejam importados em um único 'require' no server.js.
module.exports = {
    sequelize,
    testConnection,
    User,
    Profile,
    Game,
    UserGame,
    Review 
};