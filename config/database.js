// config/database.js - PRONTO PARA PRODUÇÃO (Render/PostgreSQL) E LOCAL (MySQL)

const { Sequelize } = require('sequelize');

// Variáveis de Ambiente
const DATABASE_URL = process.env.DATABASE_URL; // Variável fornecida pelo Render
const DB_DIALECT_LOCAL = process.env.DB_DIALECT || 'mysql'; // Dialeto local

let sequelize;

if (DATABASE_URL) {
    // ====================================================
    // AMBIENTE DE PRODUÇÃO (Render/PostgreSQL)
    // Se a DATABASE_URL existir (no Render), usamos o PostgreSQL com SSL
    // ====================================================
    console.log('Detectando ambiente de produção. Usando PostgreSQL.');
    
    // Configuração obrigatória para PostgreSQL na nuvem (SSL)
    const connectionOptions = {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Essencial para conexões SSL do Render
            }
        },
        logging: false, // Desativa logs em produção
    };
    
    // Conecta usando a string de URL completa
    sequelize = new Sequelize(DATABASE_URL, connectionOptions);

} else {
    // ====================================================
    // AMBIENTE LOCAL (MySQL/Desenvolvimento)
    // Se a DATABASE_URL não existir (localmente), usa as variáveis do .env
    // ====================================================
    console.log('Detectando ambiente local. Usando MySQL.');

    sequelize = new Sequelize( 
        process.env.DB_NAME,      // Nome do DB
        process.env.DB_USER,      // Usuário do DB
        process.env.DB_PASSWORD,  // Senha do DB
        {
            host: process.env.DB_HOST,
            dialect: DB_DIALECT_LOCAL, // 'mysql'
            logging: false, 
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

// Função de Teste de Conexão
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    } catch (error) {
        console.error('❌ ERRO ao conectar ao banco de dados:', error.message);
        // Lança o erro para que a aplicação não inicie com falha no DB
        throw error; 
    }
}

// Exporta a instância do sequelize e a função de teste
module.exports = {
    sequelize,
    testConnection
};