// server.js - Versão FINAL (Corrigida e Limpa)

require('dotenv').config(); 

const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer'); 
const { Op } = require('sequelize'); 
const bcrypt = require('bcrypt'); // Importa o bcrypt para criptografia
const app = express();
const PORT = process.env.PORT || 10000;

// ====================================================
// 1. IMPORTAÇÃO CENTRALIZADA DE MODELOS E DB 
// ====================================================
const {
    sequelize,
    testConnection,
    User,
    Profile,
    Game,
    UserGame,
    Review 
} = require('./models/index');

// ====================================================
// 2. CONFIGURAÇÃO DO UPLOAD (MULTER)
// ====================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/uploads/') // Pasta onde salvar
    },
    filename: function (req, file, cb) {
        // Nome único: id_usuario + timestamp + extensão
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.session.userId + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ====================================================
// 3. MIDDLEWARES
// ====================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

app.use(session({
    secret: process.env.SESSION_SECRET || 'chave-secreta-do-64bitd',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// ====================================================
// 4. DADOS ESTÁTICOS DE JOGOS
// ====================================================
const jogosDB = [
    { 
        id: 1, 
        slug: 'cyberpunk', 
        titulo: 'Cyberpunk 2077', 
        tituloEstilizado: 'Cyberpunk <span class="fw-light text-white">2077</span>',
        rota: '/jogo/cyberpunk', 
        genero: 'RPG • CD Projekt Red', 
        nota: '4.5', 
        badge: 'Popular', badgeClass: 'bg-primary',
        bannerImg: '/img/cyberpunk-2077.jpg',
        bannerPos: 'center 20%',
        coverArt: '/img/cyberpunk-2077.jpg',
        img: '/img/cyberpunk-2077.jpg',
        developer: 'CD Projekt RED',
        releaseDate: 'Dec 10, 2020',
        descricao: 'Cyberpunk 2077 é uma história de ação e aventura de mundo aberto ambientada em Night City, uma megalópole obcecada por poder, glamour e biomodificações. Você joga como V, um mercenário fora da lei atrás de um implante único que carrega a chave da imortalidade.',
        stats: { lists: '10.4k', likes: '9.4k' },
        platforms: ['Windows PC', 'PlayStation 5', 'Xbox Series X/S']
    },
    { 
        id: 2, 
        slug: 'witcher', 
        titulo: 'The Witcher 3: Wild Hunt', 
        tituloEstilizado: 'The Witcher 3: <span class="fw-light text-warning">Wild Hunt</span>',
        rota: '/jogo/witcher',
        genero: 'RPG • Aventura', 
        nota: '4.9', 
        badge: 'GOTY', badgeClass: 'bg-warning text-dark',
        bannerImg: '/img/witcher-3.jpg',
        bannerPos: 'center top',
        coverArt: '/img/witcher-3.jpg',
        img: '/img/witcher-3.jpg',
        developer: 'CD Projekt Red',
        releaseDate: 'May 19, 2015',
        descricao: 'Você é Geralt de Rívia, um mercenário caçador de monstros. Diante de você está um continente devastado pela guerra e infestado de criaturas que você pode explorar à vontade. Sua tarefa principal é encontrar a Criança da Profecia, uma arma viva que pode alterar a forma do mundo.',
        stats: { lists: '55.3k', likes: '52.1k' },
        platforms: ['PC', 'PlayStation 4/5', 'Xbox One/Series', 'Nintendo Switch']
    },
    { 
        id: 3, 
        slug: 'elden', 
        titulo: 'Elden Ring',
        tituloEstilizado: 'Elden <span class="fw-light text-white">Ring</span>',
        rota: '/jogo/elden',
        genero: 'Soulslike • FromSoftware', 
        nota: '4.8', badge: null,
        bannerImg: '/img/elden-ring.jpg',
        bannerPos: 'center 30%',
        coverArt: '/img/elden-ring.jpg',
        img: '/img/elden-ring.jpg',
        developer: 'FromSoftware',
        releaseDate: 'Feb 25, 2022',
        descricao: 'Levante-se, Maculado, e seja guiado pela graça para portar o poder do Anel Prístino e se tornar um Lorde Prístino nas Terras Intermédias. Um mundo vasto onde campos abertos e masmorras imensas se conectam de forma fluida.',
        stats: { lists: '48.5k', likes: '45.2k' },
        platforms: ['Windows PC', 'PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S']
    },
    { 
        id: 4, 
        slug: 'portal', 
        titulo: 'Portal 2', 
        tituloEstilizado: 'Portal <span class="fw-light text-warning">2</span>',
        rota: '/jogo/portal',
        genero: 'Puzzle • Valve', 
        nota: '5.0', badge: null,
        bannerImg: '/img/portal-2.jpg',
        bannerPos: 'center 20%',
        coverArt: '/img/portal-2.jpg',
        img: '/img/portal-2.jpg',
        developer: 'Valve',
        releaseDate: 'Apr 19, 2011',
        descricao: 'Portal 2 baseia-se na fórmula premiada de jogabilidade inovadora, história e música que rendeu ao Portal original mais de 70 distinções da indústria. O jogo apresenta um elenco de personagens dinâmicos, quebra-cabeças novos e uma história muito maior.',
        stats: { lists: '62.1k', likes: '58.9k' },
        platforms: ['Windows PC', 'macOS', 'Linux', 'PlayStation 3', 'Xbox 360', 'Nintendo Switch']
    },
    { 
        id: 5, 
        slug: 'silksong', 
        titulo: 'Hollow Knight: Silksong', 
        tituloEstilizado: 'Hollow Knight: <span class="fw-light text-warning">Silksong</span>',
        rota: '/jogo/silksong',
        genero: 'Metroidvania • Team Cherry', 
        nota: 'Em breve', badge: 'Desejado', badgeClass: 'bg-info text-dark',
        bannerImg: '/img/hollow-knight-silksong.jpg',
        bannerPos: 'center 20%',
        coverArt: '/img/hollow-knight-silksong.jpg',
        img: '/img/hollow-knight-silksong.jpg',
        developer: 'Team Cherry',
        releaseDate: 'TBA',
        descricao: 'Descubra um reino vasto e assombrado em Hollow Knight: Silksong! A sequência do premiado jogo de ação e aventura. Jogue como Hornet, princesa-protetora de Hallownest, e aventure-se por um reino totalmente novo governado por seda e música.',
        stats: { lists: '35.2k', likes: '42.1k' },
        platforms: ['PC', 'Nintendo Switch', 'PlayStation 5', 'Xbox Series X/S']
    },
    { 
        id: 6, 
        slug: 'metalgear', 
        titulo: 'Metal Gear Solid Delta', 
        tituloEstilizado: 'Metal Gear Solid <span class="fw-light text-success">Delta</span>',
        rota: '/jogo/metalgear',
        genero: 'Stealth • Konami', 
        nota: 'Em breve', badge: 'Novo', badgeClass: 'bg-success',
        bannerImg: '/img/metal-gear-delta.jpg',
        bannerPos: 'center 20%',
        coverArt: '/img/metal-gear-delta.jpg',
        img: '/img/metal-gear-delta.jpg',
        developer: 'Konami',
        releaseDate: 'TBA',
        descricao: 'Descubra a história de origem do icônico agente militar Snake e comece a desvendar a trama da lendária série METAL GEAR. Metal Gear Solid Delta: Snake Eater traz gráficos modernos sem precedentes, jogabilidade de ação furtiva imersiva e sons para sua história fascinante.',
        stats: { lists: '12.5k', likes: '15.8k' },
        platforms: ['Windows PC', 'PlayStation 5', 'Xbox Series X/S']
    },
    { 
        id: 7, 
        slug: 'expedition', 
        titulo: 'Clair Obscur: Expedition 33', 
        tituloEstilizado: 'Clair Obscur: <span class="fw-light text-warning">Expedition 33</span>',
        rota: '/jogo/expedition',
        genero: 'RPG • Sandfall', 
        nota: '2025', badge: null,
        bannerImg: '/img/expedition-33.jpg',
        bannerPos: 'center top',
        coverArt: '/img/expedition-33.jpg',
        img: '/img/expedition-33.jpg',
        developer: 'Sandfall Interactive',
        releaseDate: '2025',
        descricao: 'Lidere os membros da Expedição 33 em sua missão para destruir a Pintora para que ela nunca mais pinte a morte. Explore um mundo de fantasia inspirado na Belle Époque da França e lute contra inimigos terríveis neste RPG de turnos com mecânicas em tempo real.',
        stats: { lists: '5.1k', likes: '3.8k' },
        platforms: ['Windows PC', 'PlayStation 5', 'Xbox Series X/S']
    },
    { 
        id: 8, 
        slug: 'silenthill3', 
        titulo: 'Silent Hill 3', 
        tituloEstilizado: 'Silent Hill <span class="fw-light text-white">3</span>',
        rota: '/jogo/silenthill3',
        genero: 'Horror • Konami', 
        nota: '--', badge: 'Clássico', badgeClass: 'bg-secondary',
        bannerImg: '/img/silent-hill-3.jpg',
        bannerPos: 'center 30%',
        coverArt: '/img/silent-hill-3.jpg',
        img: '/img/silent-hill-3.jpg',
        developer: 'Konami',
        releaseDate: 'May 23, 2003',
        descricao: 'Terceira parte da série de terror psicológico Silent Hill, que serve como uma sequência direta do primeiro jogo. Jogue como Heather Mason, que deve lutar contra criaturas horríveis e um culto sombrio.',
        stats: { lists: '15.1k', likes: '12.7k' },
        platforms: ['PlayStation 2', 'Windows PC']
    }
];

// ====================================================
// 5. MIDDLEWARE
// ====================================================
const requireLogin = async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login?erro=Para acessar, faça login.');
    }

    try {
        const user = await User.findByPk(req.session.userId, {
            include: [{ model: Profile, as: 'Perfil' }]
        });

        if (!user) {
            return req.session.destroy(() => {
                res.redirect('/login?erro=Sessão expirada ou usuário removido.');
            });
        }

        // req.user: Sequelize Model (keys Nome, Email) - Usado para lógica de banco
        req.user = user;
        // Adiciona a Bio no modelo (minúsculo) para fácil acesso
        req.user.bio = user.Perfil ? user.Perfil.Bio : ''; 
        
        // req.session.user: Objeto Simples (keys nome, email) - Usado para a sessão e sidebar
        req.session.user = { 
            ID: user.ID, 
            nome: user.Nome, 
            usuario: user.Login, 
            email: user.Email, 
            avatar: user.AvatarUrl 
        };

        next();
    } catch (error) {
        console.error("Erro ao carregar usuário no requireLogin:", error);
        res.status(500).send("Erro interno ao validar sessão.");
    }
};

// ====================================================
// 6. ROTAS PÚBLICAS
// ====================================================

app.get('/', (req, res) => { res.render('index', { user: req.session.user }); });
app.get('/login', (req, res) => { res.render('login', { erro: req.query.erro, sucesso: req.query.sucesso }); });

// 🚨 LOGIN: CORRIGIDO COM MIGRAÇÃO DE SENHA
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;
    try {
        const user = await User.findOne({ where: { [Op.or]: [{ Login: usuario }, { Email: usuario }] } });
        
        if (!user) return res.render('login', { erro: "Usuário ou senha incorretos!", sucesso: null });
        
        // --- LÓGICA DE VERIFICAÇÃO E MIGRAÇÃO ---
        
        // Um hash BCrypt tem 60 caracteres (baseado no User.js: STRING(60))
        const isHashed = user.Senha.length === 60 && user.Senha.startsWith('$2'); 
        
        let passwordIsValid = false;

        if (isHashed) {
            // Cenário 1: Senha já está criptografada (Contas Novas ou Migradas)
            passwordIsValid = await bcrypt.compare(senha, user.Senha);
        } else {
            // Cenário 2: Senha está em texto puro (Contas Antigas)
            // Tenta logar com o texto puro
            if (user.Senha === senha) {
                passwordIsValid = true;
                
                // 🚨 MIGRAÇÃO: Criptografa a senha antiga e salva no DB
                const newHash = await bcrypt.hash(senha, 10);
                await User.update({ Senha: newHash }, { where: { ID: user.ID } });
                console.log(`[Segurança] Senha do usuário ${user.Login} migrada com sucesso.`);
            }
        }
        // --- FIM DA LÓGICA DE VERIFICAÇÃO ---

        if (!passwordIsValid) return res.render('login', { erro: "Usuário ou senha incorretos!", sucesso: null });
        
        req.session.userId = user.ID;
        res.redirect('/dashboard');
    } catch (error) { 
        console.error("Erro no login:", error);
        res.render('login', { erro: "Ocorreu um erro interno. Tente novamente.", sucesso: null }); 
    }
});

app.get('/cadastro', (req, res) => { res.render('cadastro', { erro: null }); });

// 🚨 CADASTRO: CRIPTOGRAFIA DE SENHA COM BCrypt
app.post('/cadastro', async (req, res) => {
    const { nome, usuario, email, senha, dataNasc } = req.body;
    try {
        // Gera o hash da senha (10 é o número de rounds de salt)
        const hashedPassword = await bcrypt.hash(senha, 10);

        const newUser = await User.create({ 
            Nome: nome, 
            Login: usuario, 
            Email: email, 
            Senha: hashedPassword, // Salva o hash criptografado
            DataNascimento: dataNasc,
            AvatarUrl: '/img/user-avatar.jpg' 
        });
        await Profile.create({ UsuarioID: newUser.ID, Bio: null, AvatarUrl: '/img/user-avatar.jpg' }); 
        
        res.redirect('/login?sucesso=true');
    } catch (error) {
        const errorMessage = error.name === 'SequelizeUniqueConstraintError' ? 'Usuário ou E-mail já cadastrado.' : 'Erro ao cadastrar.';
        res.render('cadastro', { erro: errorMessage });
    }
});

app.get('/logout', (req, res) => { req.session.destroy(() => { res.redirect('/'); }); });

// ====================================================
// 7. ROTAS PROTEGIDAS
// ====================================================

app.get('/dashboard', requireLogin, (req, res) => {
    const destaques = jogosDB.slice(0, 3);
    const populares = jogosDB.filter(j => j.nota >= 4.8 || j.nota === '5.0');
    const novos = jogosDB.filter(j => j.nota === 'Em breve' || j.nota === '2025');
    res.render('dashboard', { user: req.session.user, destaques: destaques, populares: populares, novos: novos });
});

// Explorar (Média Real)
app.get('/explorar', requireLogin, async (req, res) => {
    const termo = req.query.busca ? req.query.busca.toLowerCase() : '';
    
    try {
        let listaBase = termo ? jogosDB.filter(j => j.titulo.toLowerCase().includes(termo)) : jogosDB;

        const jogosDoBanco = await Game.findAll({
            include: [{ model: Review, as: 'Avaliacoes', attributes: ['Avaliacao'] }]
        });

        const listaAtualizada = listaBase.map(jogoEstatico => {
            const jogoDb = jogosDoBanco.find(dbGame => dbGame.slug === jogoEstatico.slug);

            if (jogoEstatico.nota === 'Em breve' || jogoEstatico.nota === '2025' || jogoEstatico.nota === 'TBA') {
                return jogoEstatico;
            }

            if (jogoDb && jogoDb.Avaliacoes && jogoDb.Avaliacoes.length > 0) {
                const total = jogoDb.Avaliacoes.reduce((sum, review) => sum + review.Avaliacao, 0);
                const media = (total / jogoDb.Avaliacoes.length).toFixed(1);
                return { ...jogoEstatico, nota: media };
            }

            return { ...jogoEstatico, nota: '--' };
        });

        res.render('explorar', { user: req.session.user, jogos: listaAtualizada, busca: req.query.busca });

    } catch (error) {
        console.error("Erro ao carregar explorar:", error);
        res.render('explorar', { user: req.session.user, jogos: jogosDB, busca: req.query.busca });
    }
});

// Perfil (Com Estatísticas)
app.get('/perfil', requireLogin, async (req, res) => {
    try {
        const userWithDetails = await User.findByPk(req.session.userId, {
            include: [
                { model: Profile, as: 'Perfil' }, 
                { model: Game, as: 'JogosFavoritos' },
                { model: Review, as: 'Avaliacoes' }
            ]
        });
        
        const favoritosComDetalhes = userWithDetails.JogosFavoritos
            .map(favGame => jogosDB.find(j => j.id === favGame.ID)).filter(j => j);
            
        const reviews = userWithDetails.Avaliacoes || [];
        const reviewCount = reviews.length;
        
        let avgRating = '--';
        if (reviewCount > 0) {
            const totalStars = reviews.reduce((sum, r) => sum + r.Avaliacao, 0);
            avgRating = (totalStars / reviewCount).toFixed(1);
        }

        const userEJS = { 
            ...req.session.user, 
            bio: userWithDetails.Perfil ? userWithDetails.Perfil.Bio : 'Adicione uma descrição ao seu perfil.', 
            jogosFavoritos: favoritosComDetalhes, 
            isCurrentUser: true,
            reviewCount: reviewCount,
            avgRating: avgRating
        };

        res.render('perfil', { user: userEJS, reviewCount: reviewCount, avgRating: avgRating });
    } catch (error) { 
        console.error('Erro ao carregar perfil:', error);
        res.redirect('/dashboard'); 
    }
});

// Edição de Perfil (GET)
app.get('/perfil/editar', requireLogin, async (req, res) => {
    const error = req.query.erro ? req.query.erro.replace(/-/g, ' ') : null;
    
    // Cria um objeto simples para EJS com as propriedades em minúsculo
    const userForEjs = {
        nome: req.user.Nome,
        email: req.user.Email,
        bio: req.user.bio, 
        avatar: req.user.AvatarUrl || req.session.user.avatar
    };

    res.render('editar-perfil', { user: userForEjs, error: error });
});

// Salvar Perfil (POST) - Com Multer e correção de E-mail
app.post('/perfil/editar', requireLogin, upload.single('avatar'), async (req, res) => {
    const { nome, email, bio } = req.body;
    const currentUser = req.user; // Sequelize User instance

    // Função auxiliar para re-renderizar o form com os dados submetidos e a mensagem de erro
    const renderError = (msg) => {
        // Usa os dados submetidos para preencher o formulário novamente
        const userSubmitted = {
            nome: nome,
            email: email,
            bio: bio,
            avatar: req.session.user.avatar || currentUser.AvatarUrl
        };
        return res.render('editar-perfil', { user: userSubmitted, error: msg });
    };

    try {
        let updateData = { Nome: nome };
        
        // 1. Lógica de Upload de Foto
        if (req.file) {
            updateData.AvatarUrl = `/img/uploads/${req.file.filename}`;
        }

        // 2. Lógica de E-mail
        if (!email || email.trim() === '') {
            return renderError("O campo E-mail não pode ficar vazio.");
        }

        // Se o e-mail for diferente do atual, verifica unicidade
        if (email !== currentUser.Email) {
            const emailExists = await User.findOne({ where: { Email: email } });
            
            // Verifica se o e-mail existe E se o ID do e-mail encontrado é diferente do ID do usuário atual.
            if (emailExists && emailExists.ID !== currentUser.ID) { 
                return renderError("Este e-mail já está em uso por outro usuário.");
            }
            updateData.Email = email;
        }

        // 3. Atualiza o Usuário (Nome, Foto e talvez E-mail)
        await User.update(updateData, { where: { ID: req.session.userId } });
        
        // 4. Atualiza o Perfil (Bio)
        await Profile.upsert({ UsuarioID: req.session.userId, Bio: bio });
        
        // 5. Atualiza a Sessão
        req.session.user.nome = nome;
        if (updateData.Email) req.session.user.email = updateData.Email;
        if (updateData.AvatarUrl) req.session.user.avatar = updateData.AvatarUrl; 
        
        res.redirect('/perfil');

    } catch (error) { 
        console.error("Erro ao atualizar perfil:", error);
        return renderError("Erro interno ao salvar dados.");
    }
});

// Perfil Público
app.get('/perfil/:userId', requireLogin, async (req, res) => {
    const targetUserId = req.params.userId;
    try {
        const userWithDetails = await User.findByPk(targetUserId, {
            include: [{ model: Profile, as: 'Perfil' }, { model: Game, as: 'JogosFavoritos' }]
        });

        if (!userWithDetails) {
            return res.status(404).send('Usuário não encontrado.');
        }

        const favoritosComDetalhes = userWithDetails.JogosFavoritos
            .map(favGame => jogosDB.find(j => j.id === favGame.ID))
            .filter(j => j);
            
        const userEJS = { 
            ID: userWithDetails.ID, 
            nome: userWithDetails.Nome, 
            usuario: userWithDetails.Login, 
            avatar: userWithDetails.AvatarUrl,
            bio: userWithDetails.Perfil ? userWithDetails.Perfil.Bio : 'Sem descrição.',
            jogosFavoritos: favoritosComDetalhes,
            isCurrentUser: req.session.userId == targetUserId 
        };

        res.render('perfil-publico', { user: userEJS }); 
    } catch (error) {
        console.error('Erro ao carregar perfil público:', error);
        res.status(500).send('Erro interno ao carregar perfil.');
    }
});

// Rota de Detalhes do Jogo
app.get('/jogo/:id', requireLogin, async (req, res) => {
    const slug = req.params.id;
    
    try {
        const jogoDB = await Game.findOne({
            where: { slug: slug },
            include: [{ 
                model: Review, 
                as: 'Avaliacoes', 
                include: [{ 
                    model: User,
                    as: 'Usuario'
                }] 
            }], 
            order: [[{ model: Review, as: 'Avaliacoes' }, 'createdAt', 'DESC']]
        });

        const jogoEstatico = jogosDB.find(j => j.slug === slug);

        if (jogoEstatico) {
            const jogoDBPlain = jogoDB ? jogoDB.toJSON() : {};

            const dadosFinais = { 
                ...jogoEstatico, 
                ...jogoDBPlain,
                coverArt: jogoDBPlain.coverArt || jogoEstatico.coverArt,
                bannerImg: jogoDBPlain.bannerImg || jogoEstatico.bannerImg,
                titulo: jogoEstatico.titulo, 
                slug: jogoEstatico.slug,
                id: jogoDB ? jogoDB.ID : jogoEstatico.id
            };
            
            let isFavorito = false;
            if (jogoDB) {
                const favoritoExistente = await UserGame.findOne({
                    where: { fk_Usuarios_ID: req.session.userId, fk_Jogos_ID: jogoDB.ID }
                });
                isFavorito = !!favoritoExistente; 
            }

            const avaliacoes = jogoDB ? jogoDB.Avaliacoes : [];
            let total = 0;
            avaliacoes.forEach(r => total += r.Avaliacao);
            const media = avaliacoes.length > 0 ? (total / avaliacoes.length).toFixed(1) : dadosFinais.nota || '--';

            res.render('detalhes-jogo', { 
                user: req.session.user, 
                jogo: dadosFinais, 
                reviews: avaliacoes, 
                media: media,
                isFavorito: isFavorito
            });
        } else {
            res.status(404).send('Jogo não encontrado no catálogo.');
        }
    } catch (error) {
        console.error('Erro ao carregar jogo:', error);
        res.redirect('/dashboard');
    }
});

// Ação de Favoritar
app.post('/jogo/:slug/favoritar', requireLogin, async (req, res) => {
    const { slug } = req.params;

    try {
        const jogo = await Game.findOne({ where: { slug: slug } });
        if (!jogo) return res.status(404).send("Jogo não encontrado no banco.");

        const favoritoExistente = await UserGame.findOne({
            where: { fk_Usuarios_ID: req.session.userId, fk_Jogos_ID: jogo.ID }
        });

        if (favoritoExistente) {
            await favoritoExistente.destroy();
        } else {
            await UserGame.create({
                fk_Usuarios_ID: req.session.userId,
                fk_Jogos_ID: jogo.ID,
                Status: 'Favorito',
                Data_Aquisicao: new Date()
            });
        }
        res.redirect(`/jogo/${slug}`);
    } catch (error) {
        console.error("Erro ao favoritar:", error);
        res.redirect(`/jogo/${slug}`);
    }
});

// Listar Reviews
app.get('/reviews', requireLogin, async (req, res) => {
    try {
        const minhasReviews = await Review.findAll({
            where: { UsuarioID: req.session.userId },
            include: [{ model: Game, as: 'Jogo', attributes: ['ID', 'Nome', 'slug'] }], 
            order: [['createdAt', 'DESC']]
        });
        
        const reviewsComImagens = minhasReviews.map(review => {
            const reviewPlain = review.get({ plain: true }); 
            const jogoEstatico = jogosDB.find(j => j.id === reviewPlain.Jogo.ID);
            
            if (jogoEstatico && reviewPlain.Jogo) {
                reviewPlain.Jogo.img = jogoEstatico.img; 
            } else {
                reviewPlain.Jogo.img = '/img/placeholder.jpg'; 
            }
            return reviewPlain;
        });

        res.render('reviews', { user: req.session.user, reviews: reviewsComImagens });
    } catch (error) {
        console.error("Erro ao listar reviews:", error);
        res.render('reviews', { user: req.session.user, reviews: [] });
    }
});

// Deletar Review
app.post('/reviews/deletar/:id', requireLogin, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findOne({ where: { ID: reviewId, UsuarioID: req.session.userId } });
        if (review) { await review.destroy(); }
        res.redirect('/reviews');
    } catch (error) {
        console.error("Erro ao deletar review:", error);
        res.redirect('/reviews');
    }
});

// Editar Review (GET)
app.get('/reviews/editar/:id', requireLogin, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findOne({
            where: { ID: reviewId, UsuarioID: req.session.userId },
            include: [{ model: Game, as: 'Jogo' }]
        });
        if (!review) return res.redirect('/reviews');
        res.render('editar-review', { user: req.session.user, review: review });
    } catch (error) {
        console.error("Erro ao carregar edição:", error);
        res.redirect('/reviews');
    }
});

// Editar Review (POST)
app.post('/reviews/editar/:id', requireLogin, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { nota, comentario } = req.body;
        await Review.update({ Avaliacao: parseInt(nota), Corpo_do_comentario: comentario }, { where: { ID: reviewId, UsuarioID: req.session.userId } });
        res.redirect('/reviews');
    } catch (error) {
        console.error("Erro ao atualizar review:", error);
        res.redirect('/reviews');
    }
});

// Criar Review (GET)
app.get('/reviews/criar', requireLogin, async (req, res) => {
    try {
        const jogos = await Game.findAll({ attributes: ['ID', 'Nome'], order: [['Nome', 'ASC']] });
        const selectedId = req.query.jogoId || null;
        
        res.render('criar-review', { 
            user: req.session.user, 
            jogos: jogos, 
            selectedId: selectedId,
            erro: req.query.erro || null,
            sucesso: req.query.sucesso || null
        });
    } catch (error) { 
        console.error("Erro ao carregar formulário de review:", error);
        res.redirect('/reviews'); 
    }
});

// Criar Review (POST)
app.post('/reviews/criar', requireLogin, async (req, res) => {
    const { jogoId, nota, comentario } = req.body;
    try {
        await Review.create({
            UsuarioID: req.session.userId,
            JogoID: jogoId,
            Avaliacao: parseInt(nota),
            Corpo_do_comentario: comentario
        });
        res.redirect('/reviews');
    } catch (error) { res.redirect('/reviews/criar?erro=true'); }
});

app.get('/esqueci-senha', (req, res) => { res.render('esqueci-senha'); });

// ====================================================
// 9. INICIAR SERVIDOR
// ====================================================
async function initializeApp() {
    try {
        await testConnection();
        await sequelize.sync({ alter: true });
        console.log('✅ Banco de dados sincronizado.');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erro crítico:', error);
    }
}

initializeApp();