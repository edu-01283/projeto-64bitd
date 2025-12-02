// config/database.js

const { Sequelize } = require('sequelize');

// Configuração da Conexão com MySQL
// Lendo as variáveis de ambiente do arquivo .env
const sequelize = new Sequelize( // <-- Linha 7
    process.env.DB_NAME,      // Nome do DB
    process.env.DB_USER,      // Usuário do DB (lido de DB_USER no .env)
    process.env.DB_PASSWORD,  // Senha do DB (lido de DB_PASSWORD no .env)
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT, // Deve ser 'mysql'
        logging: false, // Defina como true para ver as queries SQL no console
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Função de Teste de Conexão
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    } catch (error) {
        console.error('❌ Não foi possível conectar ao banco de dados:', error.message);
        // Em caso de falha de conexão, lançamos o erro para parar o processo de inicialização.
        throw error; 
    }
}

// Exporta a instância do sequelize e a função de teste
module.exports = {
    sequelize,
    testConnection
};