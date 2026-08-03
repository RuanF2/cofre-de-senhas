const passport = require ('passport');
const { Strategy: GoogleStrategy } = require ('passport-google-oauth20');
const pool = require ('../db');
const bcrypt = require ('bcrypt');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value
    const verificacao = await pool.query ('SELECT * FROM usuarios WHERE email = $1', [email]);
    let busca = verificacao.rows[0];
    if(!busca){
        const senhaAleatoria = Math.random().toString();
        const hash = await bcrypt.hash(senhaAleatoria, 10);

        const resultado = await pool.query ('INSERT INTO usuarios (email,senha) VALUES($1,$2) RETURNING *', [email,hash]);

        busca = resultado.rows[0];
    }

    done(null,busca);
}));