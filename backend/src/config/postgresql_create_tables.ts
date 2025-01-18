import { Pool } from 'pg';

const pool = new Pool({
  user: 'retro_trader',
  host: 'localhost',
  database: 'retro_trader',
  password: '220612',
  port: 5432,
});

async function initializeDB() {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS symbols (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS timeframes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                duration INTERVAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS ohlc_data (
                id SERIAL PRIMARY KEY,
                symbol_id INT REFERENCES symbols(id),
                timeframe_id INT REFERENCES timeframes(id),
                datetime TIMESTAMP NOT NULL,
                open NUMERIC NOT NULL,
                high NUMERIC NOT NULL,
                low NUMERIC NOT NULL,
                close NUMERIC NOT NULL,
                volume INT NOT NULL,
                UNIQUE (symbol_id, timeframe_id, datetime)
            );
        `);

        console.log('База данных успешно инициализирована.');
    } catch (error) {
        console.error('Ошибка инициализации базы данных:', error);
    } finally {
        client.release();
    }
}

initializeDB().catch(console.error);
