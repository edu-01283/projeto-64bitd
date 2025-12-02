// models/index.js - Versão FINAL SEM MENSAGENS

const { sequelize, testConnection } = require('../config/database'); 

const User = require('./user');
const Profile = require('./profile');
const Game = require('./game');
const UserGame = require('./userGame');
const Review = require('./review'); 

// ====================================================
// 3. DEFINE AS ASSOCIAÇÕES
// ====================================================

// Relação 1:1 Usuário <--> Perfil
User.hasOne(Profile, { foreignKey: 'UsuarioID', as: 'Perfil', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'UsuarioID' });

// Relação N:M Usuário <--> Jogo (Biblioteca/Favoritos)
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

// Relação 1:N (Reviews)
User.hasMany(Review, { foreignKey: 'UsuarioID', as: 'Avaliacoes' });
Review.belongsTo(User, { foreignKey: 'UsuarioID' }); // Review pertence a um Usuário
 
Game.hasMany(Review, { foreignKey: 'JogoID', as: 'Avaliacoes' });
Review.belongsTo(Game, { foreignKey: 'JogoID', as: 'Jogo' }); 


// 4. Exporta tudo
module.exports = {
    sequelize,
    testConnection,
    User,
    Profile,
    Game,
    UserGame,
    Review 
};