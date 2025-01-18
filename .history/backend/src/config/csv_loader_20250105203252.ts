// import { Pool } from 'pg';
// import * as fs from 'fs';
// import * as path from 'path';
// import csvParser from 'csv-parser';

// // Настройки подключения к PostgreSQL
// const pool = new Pool({
//   user: 'retro_trader',
//   host: 'localhost',
//   database: 'retro_trader',
//   password: '220612',
//   port: 5432,
// });

// interface CSVRow {
//   Time: string;
//   Open: string;
//   High: string;
//   Low: string;
//   Close: string;
//   Volume: string;
// }

// async function importCSVToDB(
//   filePath: string,
//   tickerName: string,
//   timeframeName: string
// ): Promise<void> {
//   const client = await pool.connect();

//   try {
//     const { rows: symbolRows } = await client.query(
//       `INSERT INTO symbols (name)
//        VALUES ($1)
//        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//        RETURNING id`,
//       [tickerName]
//     );
//     const symbolId = symbolRows[0].id;

//     const { rows: timeframeRows } = await client.query(
//       `INSERT INTO timeframes (name, duration)
//        VALUES ($1, $2)
//        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//        RETURNING id`,
//       [timeframeName, getTimeframeDuration(timeframeName)]
//     );
//     const timeframeId = timeframeRows[0].id;

//     const rows: any[] = [];
//     await new Promise((resolve, reject) => {
//       fs.createReadStream(filePath)
//         .pipe(csvParser())
//         .on('data', (data: CSVRow) => {
//           rows.push({
//             datetime: data.Time,
//             open: parseFloat(data.Open),
//             high: parseFloat(data.High),
//             low: parseFloat(data.Low),
//             close: parseFloat(data.Close),
//             volume: parseInt(data.Volume, 10),
//           });
//         })
//         .on('end', resolve)
//         .on('error', reject);
//     });

//     const queryText = `
//       INSERT INTO ohlc_data (symbol_id, timeframe_id, datetime, open, high, low, close, volume)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       ON CONFLICT (symbol_id, timeframe_id, datetime)
//       DO NOTHING`;
//     for (const row of rows) {
//       await client.query(queryText, [
//         symbolId,
//         timeframeId,
//         row.datetime,
//         row.open,
//         row.high,
//         row.low,
//         row.close,
//         row.volume,
//       ]);
//     }

//     console.log(`Данные из файла "${filePath}" успешно импортированы.`);
//   } catch (error) {
//     console.error('Ошибка при импорте данных:', error);
//   } finally {
//     client.release();
//   }
// }


// // Вспомогательная функция для определения продолжительности таймфрейма
// function getTimeframeDuration(timeframe: string): string {
//   const durations: { [key: string]: string } = {
//     M1: 'M1',
//     M2: 'M3',
//     M3: 'M5',
//     M5: 'M15',
//     M10: 'M10',
//     M15: 'M15',
//     M30: 'M30',
//     H1: 'H1',
//     H4: 'H4',
//     H12: 'H12',
//     D: 'D1',
//     W: 'W1',
//   };
//   return durations[timeframe] || 'M1'; // По умолчанию 1 минута
// }

// // Пример вызова функции
// (async () => {
//   const filePath = path.join(__dirname, '../data/January19/AUDCAD M1.csv');
//   // const filePath = '/Users/oleksandrlievskyi/Documents/gh/react-backtest/backend/src/data/January19/EURUSD_M1.csv';

//   const tickerName = 'EURUSD'; // Название тикера
//   const timeframeName = 'M1'; // Таймфрейм

//   await importCSVToDB(filePath, tickerName, timeframeName);
// })();


// import { Pool } from 'pg';
// import * as fs from 'fs';
// import * as path from 'path';
// import csvParser from 'csv-parser';
// import { time } from 'console';

// // Настройки подключения к PostgreSQL
// const pool = new Pool({
//   user: 'retro_trader',
//   host: 'localhost',
//   database: 'retro_trader',
//   password: '220612',
//   port: 5432,
// });

// interface CSVRow {
//   Time: string;
//   Open: string;
//   High: string;
//   Low: string;
//   Close: string;
//   Volume: string;
// }

// async function importCSVToDB(
//   filePath: string,
//   tickerName: string,
//   timeframeName: string
// ): Promise<void> {
//   const client = await pool.connect();

//   try {
//     const { rows: symbolRows } = await client.query(
//       `INSERT INTO symbols (name)
//        VALUES ($1)
//        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//        RETURNING id`,
//       [tickerName]
//     );
//     const symbolId = symbolRows[0].id;

//     const { rows: timeframeRows } = await client.query(
//       `INSERT INTO timeframes (name, duration)
//        VALUES ($1, $2)
//        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//        RETURNING id`,
//       [timeframeName, getTimeframeDuration(timeframeName)]
//     );
//     const timeframeId = timeframeRows[0].id;

//     const rows: any[] = [];
//     await new Promise((resolve, reject) => {
//       fs.createReadStream(filePath)
//         .pipe(csvParser())
//         .on('data', (data: CSVRow) => {
//           const open = !isNaN(parseFloat(data.Open)) ? parseFloat(data.Open) : 0;
//           const high = !isNaN(parseFloat(data.High)) ? parseFloat(data.High) : 0;
//           const low = !isNaN(parseFloat(data.Low)) ? parseFloat(data.Low) : 0;
//           const close = !isNaN(parseFloat(data.Close)) ? parseFloat(data.Close) : 0;
//           const volume = !isNaN(parseInt(data.Volume, 10)) ? parseInt(data.Volume, 10) : 0;
          
//           if (!data.Time) {
//             console.warn(`⏰ Пропущено поле Time: ${JSON.stringify(data)}`);
//             return;
//           }
//           // Validate datetime
//           const datetime = data.Time ? new Date(data.Time) : null;
//           if (!datetime || isNaN(datetime.getTime())) {
//             console.warn(`Пропущена строка с некорректным datetime: ${JSON.stringify(data)}`);
//             return; // Skip this row
//           }
        
//           if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
//             console.warn(`Пропущена строка с некорректными данными: ${JSON.stringify(data)}`);
//             return;
//           }
        
//           rows.push({
//             datetime: datetime.toISOString(), // Ensure ISO format for DB compatibility
//             open,
//             high,
//             low,
//             close,
//             volume,
//           });
//         })
//         .on('end', resolve)
//         .on('error', reject);
//     });
    

//     const queryText = `
//       INSERT INTO ohlc_data (symbol_id, timeframe_id, datetime, open, high, low, close, volume)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       ON CONFLICT (symbol_id, timeframe_id, datetime)
//       DO NOTHING`;
//     for (const row of rows) {
//       if (isNaN(row.open) || isNaN(row.high) || isNaN(row.low) || isNaN(row.close) || isNaN(row.volume)) {
//         console.warn(`Пропущена строка с некорректными данными: ${JSON.stringify(row)}`);
//         continue;
//       }

//       await client.query(queryText, [
//         symbolId,
//         timeframeId,
//         row.datetime,
//         row.open,
//         row.high,
//         row.low,
//         row.close,
//         row.volume,
//       ]);
//     }

//     console.log(`Данные из файла "${filePath}" успешно импортированы.`);
//   } catch (error) {
//     console.error('Ошибка при импорте данных:', error);
//   } finally {
//     client.release();
//   }
// }

// // Вспомогательная функция для определения продолжительности таймфрейма
// function getTimeframeDuration(timeframe: string): string {
//   const durations: { [key: string]: string } = {
//     M1: 'M1',
//     M2: 'M3',
//     M3: 'M5',
//     M5: 'M15',
//     M10: 'M10',
//     M15: 'M15',
//     M30: 'M30',
//     H1: 'H1',
//     H4: 'H4',
//     H12: 'H12',
//     D: 'D1',
//     W: 'W1',
//   };
//   return durations[timeframe] || 'M1'; // По умолчанию 1 минута
// }


// // Функция для рекурсивного обхода папок
// async function importAllCSVRecursively(folderPath: string): Promise<void> {
//   const items = fs.readdirSync(folderPath);

//   for (const item of items) {
//     const fullPath = path.join(folderPath, item);
//     const stats = fs.statSync(fullPath);

//     if (stats.isDirectory()) {
//       // Если элемент — это папка, рекурсивно вызываем функцию
//       await importAllCSVRecursively(fullPath);
//     } else if (stats.isFile() && item.endsWith('.csv')) {
//       // Если элемент — это файл, проверяем его расширение и импортируем
//       const tickerName = item.split(' ')[0]; // Извлекаем тикер из имени файла
//       const timeframeName = 'M1'; // Таймфрейм фиксированный

//       console.log(`Импорт файла: ${fullPath}, Тикер: ${tickerName}`);
//       await importCSVToDB(fullPath, tickerName, timeframeName);
//     }
//   }
// }

// // Пример вызова функции
// (async () => {
//   const folderPath = path.join(__dirname, '../data'); // Путь к корневой папке
//   await importAllCSVRecursively(folderPath);
// })();

// import { Pool } from 'pg';
// import * as fs from 'fs';
// import * as path from 'path';
// import csvParser from 'csv-parser';

// // Настройки подключения к PostgreSQL
// const pool = new Pool({
//   user: 'retro_trader',
//   host: 'localhost',
//   database: 'retro_trader',
//   password: '220612',
//   port: 5432,
// });

// // Описание структуры строки CSV
// interface CSVRow {
//   Time: string;
//   Open: string;
//   High: string;
//   Low: string;
//   Close: string;
//   Volume: string;
// }

// // ✅ Функция для импорта одного CSV-файла
// async function importCSVToDB(
//   filePath: string,
//   tickerName: string,
//   timeframeName: string
// ): Promise<void> {
//   const client = await pool.connect();

//   try {
//     // Вставка или обновление символа
//     const { rows: symbolRows } = await client.query(
//       `INSERT INTO symbols (name)
//        VALUES ($1)
//        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//        RETURNING id`,
//       [tickerName]
//     );
//     const symbolId = symbolRows[0].id;

//     // Вставка или обновление таймфрейма
//     const { rows: timeframeRows } = await client.query(
//       `INSERT INTO timeframes (name, duration)
//        VALUES ($1, $2)
//        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//        RETURNING id`,
//       [timeframeName, getTimeframeDuration(timeframeName)]
//     );
//     const timeframeId = timeframeRows[0].id;

//     const rows: any[] = [];
//     let isHeader = true; // Флаг для пропуска заголовка

//     // await new Promise<void>((resolve, reject) => {
//     //   let isHeader = true; // Флаг для пропуска заголовка
    
//     //   fs.createReadStream(filePath)
//     //     .pipe(csvParser())
//     //     .on('data', (data: Record<string, string>) => {
//     //       if (isHeader) {
//     //         isHeader = false; // Пропускаем первую строку
//     //         return;
//     //       }
    
//     //       // Извлечение данных из строк
//     //       const time = Object.keys(data)[0]; // Первый ключ — это время
//     //       const open = parseFloat(data[Object.keys(data)[1]]) || 0;
//     //       const high = parseFloat(data[Object.keys(data)[2]]) || 0;
//     //       const low = parseFloat(data[Object.keys(data)[3]]) || 0;
//     //       const close = parseFloat(data[Object.keys(data)[4]]) || 0;
//     //       const volume = parseInt(data[Object.keys(data)[5]], 10) || 0;
    
//     //       // Проверка даты и корректности данных
//     //       if (!time || isNaN(new Date(time).getTime())) {
//     //         console.warn(`⏰ Пропущена строка с некорректной датой: ${JSON.stringify(data)}`);
//     //         return;
//     //       }
    
//     //       rows.push({
//     //         datetime: new Date(time).toISOString(),
//     //         open,
//     //         high,
//     //         low,
//     //         close,
//     //         volume,
//     //       });
//     //     })
//     //     .on('end', resolve)
//     //     .on('error', reject);
//     // });

//     await new Promise<void>((resolve, reject) => {
//       let headersDetected = false; // Флаг, указывающий, что заголовки найдены
//       const headerKeys: string[] = []; // Массив для хранения названий столбцов
    
//       fs.createReadStream(filePath)
//         .pipe(csvParser())
//         .on('data', (data: Record<string, string>) => {
//           if (!headersDetected) {
//             // Проверяем, содержит ли строка корректные заголовки
//             if (
//               Object.keys(data).includes('Time') &&
//               Object.keys(data).includes('Open') &&
//               Object.keys(data).includes('High') &&
//               Object.keys(data).includes('Low') &&
//               Object.keys(data).includes('Close') &&
//               Object.keys(data).includes('Volume')
//             ) {
//               headersDetected = true;
//               headerKeys.push(...Object.keys(data)); // Сохраняем заголовки
//             }
//             return;
//           }
    
//           // Если заголовки найдены, читаем данные
//           const time = data['Time'] || '';
//           const open = parseFloat(data['Open']) || 0;
//           const high = parseFloat(data['High']) || 0;
//           const low = parseFloat(data['Low']) || 0;
//           const close = parseFloat(data['Close']) || 0;
//           const volume = parseInt(data['Volume'], 10) || 0;
    
//           // Проверка корректности даты
//           if (!time || isNaN(new Date(time).getTime())) {
//             console.warn(`⏰ Пропущена строка с некорректной датой: ${JSON.stringify(data)}`);
//             return;
//           }
    
//           rows.push({
//             datetime: new Date(time).toISOString(),
//             open,
//             high,
//             low,
//             close,
//             volume,
//           });
//         })
//         .on('end', resolve)
//         .on('error', reject);
//     });
//     // Вставка данных в таблицу
//     const queryText = `
//       INSERT INTO ohlc_data (symbol_id, timeframe_id, datetime, open, high, low, close, volume)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       ON CONFLICT (symbol_id, timeframe_id, datetime)
//       DO NOTHING`;

//     for (const row of rows) {
//       await client.query(queryText, [
//         symbolId,
//         timeframeId,
//         row.datetime,
//         row.open,
//         row.high,
//         row.low,
//         row.close,
//         row.volume,
//       ]);
//     }

//     console.log(`✅ Данные из файла "${filePath}" успешно импортированы.`);
//   } catch (error) {
//     console.error('❌ Ошибка при импорте данных:', error);
//   } finally {
//     client.release();
//   }
// }

// // 🛠️ Вспомогательная функция для определения таймфрейма
// function getTimeframeDuration(timeframe: string): string {
//   const durations: { [key: string]: string } = {
//     M1: 'M1',
//     M2: 'M3',
//     M3: 'M5',
//     M5: 'M15',
//     M10: 'M10',
//     M15: 'M15',
//     M30: 'M30',
//     H1: 'H1',
//     H4: 'H4',
//     H12: 'H12',
//     D: 'D1',
//     W: 'W1',
//   };
//   return durations[timeframe] || 'М1'; // По умолчанию 1 минута
// }

// // 📂 Рекурсивный импорт всех CSV-файлов в папке
// async function importAllCSVRecursively(folderPath: string): Promise<void> {
//   const items = fs.readdirSync(folderPath);

//   for (const item of items) {
//     const fullPath = path.join(folderPath, item);
//     const stats = fs.statSync(fullPath);

//     if (stats.isDirectory()) {
//       await importAllCSVRecursively(fullPath); // Рекурсивно обрабатываем папки
//     } else if (stats.isFile() && item.endsWith('.csv')) {
//       const tickerName = 'eurusd'; // Извлекаем тикер
//       const timeframeName = 'M1'; // Фиксированный таймфрейм

//       console.log(`📥 Импорт файла: ${fullPath}, Тикер: ${tickerName}`);
//       await importCSVToDB(fullPath, tickerName, timeframeName);
//     }
//   }
// }

// // 🚀 Пример запуска
// (async () => {
//   const folderPath = path.join(__dirname, '../data'); // Укажите папку с CSV-файлами
//   await importAllCSVRecursively(folderPath);
// })();





// // //GOOD ----------------------------------------------------------
// import { Pool } from 'pg';
// import * as fs from 'fs';
// import * as path from 'path';
// import csvParser from 'csv-parser';

// // Настройки подключения к PostgreSQL
// const pool = new Pool({
//   user: 'retro_trader',
//   host: 'localhost',
//   database: 'retro_trader',
//   password: '220612',
//   port: 5432,
// });

// // Описание структуры строки CSV
// interface CSVRow {
//   Time: string;
//   Open: string;
//   High: string;
//   Low: string;
//   Close: string;
//   Volume: string;
// }

// // ✅ Функция для импорта одного CSV-файла
// async function importCSVToDB(
//   filePath: string,
//   tickerName: string,
//   timeframeName: string
// ): Promise<void> {
//   const client = await pool.connect();

//   try {
//     // Вставка или обновление символа
//     const { rows: symbolRows } = await client.query(
//       `INSERT INTO symbols (name)
//        VALUES ($1)
//        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//        RETURNING id`,
//       [tickerName]
//     );
//     const symbolId = symbolRows[0].id;

//     // Вставка или обновление таймфрейма
//     const { rows: timeframeRows } = await client.query(
//       `INSERT INTO timeframes (name, duration)
//        VALUES ($1, $2)
//        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//        RETURNING id`,
//       [timeframeName, getTimeframeDuration(timeframeName)]
//     );
//     const timeframeId = timeframeRows[0].id;

//     const rows: any[] = [];

//     await new Promise<void>((resolve, reject) => {
//       fs.createReadStream(filePath)
//         .pipe(
//           csvParser({
//             headers: ['Time', 'Open', 'High', 'Low', 'Close', 'Volume'], // Явно задаем заголовки
//             separator: ',', // Укажите разделитель, если не запятая
//           })
//         )
//         .on('data', (data: Record<string, string>) => {
//           // Вывод данных для отладки
//           console.log('📊 Обработка строки:', data);
        
//           // Проверяем, есть ли все ожидаемые поля
//           if (!data['Time'] || !data['Open'] || !data['High'] || !data['Low'] || !data['Close'] || !data['Volume']) {
//             throw new Error(`⚠️ Пропущена строка с некорректными данными: ${JSON.stringify(data)}`);
//             return;
//           }
        
//           // Извлечение данных
//           const time = data['Time'].trim();
//           const open = parseFloat(data['Open']) || 0;
//           const high = parseFloat(data['High']) || 0;
//           const low = parseFloat(data['Low']) || 0;
//           const close = parseFloat(data['Close']) || 0;
//           const volume = parseFloat(data['Volume']) || 0; // Обрабатываем как число с плавающей точкой
        
//           // Преобразование времени
//           const formattedTime = time.replace(
//             /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2}\.\d{3})$/,
//             '$3-$2-$1T$4:$5:$6'
//           );
        
//           // Проверка корректности времени
//           if (isNaN(new Date(formattedTime).getTime())) {
//             console.warn(`⏰ Пропущена строка с некорректной датой: ${JSON.stringify(data)}`);
//             return;
//           }
        
//           rows.push({
//             datetime: new Date(formattedTime).toISOString(),
//             open,
//             high,
//             low,
//             close,
//             volume,
//           });
//         })
//         .on('end', resolve)
//         .on('error', reject);
//     });

//     // Вставка данных в таблицу
//     const queryText = `
//       INSERT INTO ohlc_data (symbol_id, timeframe_id, datetime, open, high, low, close, volume)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       ON CONFLICT (symbol_id, timeframe_id, datetime)
//       DO NOTHING`;

//     for (const row of rows) {
//       console.log('🔄 Параметры для запроса:', [
//         symbolId,
//         timeframeId,
//         row.datetime,
//         row.open,
//         row.high,
//         row.low,
//         row.close,
//         row.volume,
//       ]);
//       await client.query(queryText, [
//         symbolId,
//         timeframeId,
//         row.datetime,
//         row.open,
//         row.high,
//         row.low,
//         row.close,
//         row.volume,
//       ]);
//     }

//     console.log(`✅ Данные из файла "${filePath}" успешно импортированы.`);
//   } catch (error) {
//     console.error('❌ Ошибка при импорте данных:', error);
//   } finally {
//     client.release();
//   }
// }

// // 🛠️ Вспомогательная функция для определения таймфрейма
// function getTimeframeDuration(timeframe: string): string {
//   const durations: { [key: string]: string } = {
//     M1: 'M1',
//     M5: 'M5',
//     M15: 'M15',
//     M30: 'M30',
//     H1: 'H1',
//     H4: 'H4',
//     D: 'D1',
//   };
//   return durations[timeframe] || 'M1'; // По умолчанию 1 минута
// }

// // 📂 Рекурсивный импорт всех CSV-файлов в папке
// async function importAllCSVRecursively(folderPath: string): Promise<void> {
//   const items = fs.readdirSync(folderPath);

//   for (const item of items) {
//     const fullPath = path.join(folderPath, item);
//     const stats = fs.statSync(fullPath);

//     if (stats.isDirectory()) {
//       await importAllCSVRecursively(fullPath); // Рекурсивно обрабатываем папки
//     } else if (stats.isFile() && item.endsWith('.csv')) {
//       const tickerName = 'EURUSD'; // Пример тикера
//       const timeframeName = 'D1'; // Пример таймфрейма

//       console.log(`📥 Импорт файла: ${fullPath}, Тикер: ${tickerName}`);
//       await importCSVToDB(fullPath, tickerName, timeframeName);
//     }
//   }
// }

// // 🚀 Пример запуска
// (async () => {
//   const folderPath = path.join(__dirname, '../data'); // Укажите папку с CSV-файлами
//   await importAllCSVRecursively(folderPath);
// })();
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

// ✅ PostgreSQL connection settings
const pool = new Pool({
  user: 'retro_trader',
  host: 'localhost',
  database: 'retro_trader',
  password: '220612',
  port: 5432,
});

// ✅ CSV row structure
interface CSVRow {
  Time: string;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  Volume: string;
}

// ✅ Import a single CSV file
async function importCSVToDB(filePath: string, tickerName: string, timeframeName: string): Promise<void> {
  const client = await pool.connect();

  try {
    // Insert or update the symbol
    const { rows: symbolRows } = await client.query(
      `INSERT INTO symbols (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [tickerName]
    );
    const symbolId = symbolRows[0]?.id;

    // Insert or update the timeframe
    const { rows: timeframeRows } = await client.query(
      `INSERT INTO timeframes (name, duration)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [timeframeName, getTimeframeDuration(timeframeName)]
    );
    const timeframeId = timeframeRows[0]?.id;

    if (!symbolId || !timeframeId) {
      throw new Error('❌ Failed to retrieve symbol or timeframe IDs');
    }

    const rows: any[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(
          csvParser({
            headers: ['Time', 'Open', 'High', 'Low', 'Close', 'Volume'],
            separator: ',',
          })
        )
        .on('data', (data: Record<string, string>) => {
          try {
            const time = data['Time']?.trim();
            const open = parseFloat(data['Open']) || 0;
            const high = parseFloat(data['High']) || 0;
            const low = parseFloat(data['Low']) || 0;
            const close = parseFloat(data['Close']) || 0;
            const volume = parseFloat(data['Volume']) || 0;

            if (!time || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
              console.warn(`⚠️ Skipped invalid row: ${JSON.stringify(data)}`);
              return;
            }

            let formattedTime: string;

            try {
              const [datetimePart] = time.split(' GMT'); // Ignore the GMT offset since we are keeping it as-is
              if (!datetimePart) {
                throw new Error(`Invalid date format: ${time}`);
              }
            
              // Parse the date and time from the string using a different regular expression
              const match = datetimePart.match(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
            
              if (!match) {
                throw new Error(`Date parsing failed: ${time}`);
              }
            
              const [day, month, year, hour, minute, second, millisecond] = match.slice(1).map(Number);
            
              // Format the time correctly
              formattedTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.${String(millisecond).padStart(3, '0')}`;
            } catch (error) {
              console.warn(`⏰ Skipped row with invalid date: ${JSON.stringify(data)}. Error: ${error}`);
              return;
            }

            // Push the parsed row to the array
            rows.push({
              datetime: formattedTime,
              open,
              high,
              low,
              close,
              volume,
            });
          } catch (rowError) {
            console.error(`❌ Row processing error:`, rowError);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insert rows into the database
    const queryText = `
      INSERT INTO ohlc_data (symbol_id, timeframe_id, datetime, open, high, low, close, volume)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (symbol_id, timeframe_id, datetime)
      DO NOTHING`;

    for (const row of rows) {
      await client.query(queryText, [
        symbolId,
        timeframeId,
        row.datetime,
        row.open,
        row.high,
        row.low,
        row.close,
        row.volume,
      ]);
    }

    console.log(`✅ Successfully imported data from "${filePath}".`);
  } catch (error) {
    console.error('❌ Error importing CSV:', error);
  } finally {
    client.release();
  }
}

// ✅ Helper function to get timeframe duration
function getTimeframeDuration(timeframe: string): string {
  const durations: { [key: string]: string } = {
    M1: 'M1',
    M5: 'M5',
    M15: 'M15',
    M30: 'M30',
    H1: 'H1',
    H4: 'H4',
    D: 'D1',
  };
  return durations[timeframe] || 'M1';
}

// ✅ Recursively import all CSV files in a folder
async function importAllCSVRecursively(folderPath: string): Promise<void> {
  const items = fs.readdirSync(folderPath);

  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      await importAllCSVRecursively(fullPath);
    } else if (stats.isFile() && item.endsWith('.csv')) {
      const tickerName = 'EURUSD'; // Example ticker
      const timeframeName = '1M'; // Example timeframe

      console.log(`📥 Importing file: ${fullPath}, Ticker: ${tickerName}`);
      await importCSVToDB(fullPath, tickerName, timeframeName);
    }
  }
}

// ✅ Start the import
(async () => {
  try {
    const folderPath = path.join(__dirname, '../data'); // Path to your CSV files
    await importAllCSVRecursively(folderPath);
    console.log('🚀 All CSV files have been imported successfully.');
  } catch (error) {
    console.error('❌ Failed to import CSV files:', error);
  } finally {
    pool.end();
  }
})();
