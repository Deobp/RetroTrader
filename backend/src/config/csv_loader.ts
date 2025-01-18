
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

const pool = new Pool({
  user: 'retro_trader',
  host: 'localhost',
  database: 'retro_trader',
  password: '220612',
  port: 5432,
});

//  cvs row structure
interface CSVRow {
  Time: string;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  Volume: string;
}

// single file
async function importCSVToDB(filePath: string, tickerName: string, timeframeName: string): Promise<void> {
  const client = await pool.connect();

  try {
    const { rows: symbolRows } = await client.query(
      `INSERT INTO symbols (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [tickerName]
    );
    const symbolId = symbolRows[0]?.id;

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
              const [datetimePart] = time.split(' GMT');
              if (!datetimePart) {
                throw new Error(`Invalid date format: ${time}`);
              }
            
              const match = datetimePart.match(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
            
              if (!match) {
                throw new Error(`Date parsing failed: ${time}`);
              }
            
              const [day, month, year, hour, minute, second, millisecond] = match.slice(1).map(Number);
            
              formattedTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.${String(millisecond).padStart(3, '0')}`;
            } catch (error) {
              console.warn(`⏰ Skipped row with invalid date: ${JSON.stringify(data)}. Error: ${error}`);
              return;
            }

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

// import all files in a folder
async function importAllCSVRecursively(folderPath: string): Promise<void> {
  const items = fs.readdirSync(folderPath);

  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      await importAllCSVRecursively(fullPath);
    } else if (stats.isFile() && item.endsWith('.csv')) {

      // WARNING:

      // Change Ticker and Timeframe here manually!

      const tickerName = 'EURUSD';
      const timeframeName = '1M';

      console.log(`📥 Importing file: ${fullPath}, Ticker: ${tickerName}`);
      await importCSVToDB(fullPath, tickerName, timeframeName);
    }
  }
}

(async () => {
  try {
    const folderPath = path.join(__dirname, '../data');
    await importAllCSVRecursively(folderPath);
    console.log('🚀 All CSV files have been imported successfully.');
  } catch (error) {
    console.error('❌ Failed to import CSV files:', error);
  } finally {
    pool.end();
  }
})();