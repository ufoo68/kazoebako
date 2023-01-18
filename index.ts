import Obniz from 'obniz';
import { load } from 'ts-dotenv';
import mysql from 'mysql2/promise';

const env = load({
  DEVICE_ID: String,
  DATABASE_URL: String,
});

const getSqlDatetime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const obniz = new Obniz(env.DEVICE_ID);
obniz.onconnect = async (obn) => {
  console.info('device connected');
  const connection = await mysql.createConnection(env.DATABASE_URL);
  console.info('database connected');
  let start = Date.now();
  const gnd = obn.getIO(0);
  const vcc = obn.getIO(1);
  const sig1 = obn.getIO(3);
  gnd.pull('5v');
  gnd.drive('open-drain');
  gnd.output(false);
  vcc.output(true);
  sig1.input(async (value) => {
    if (!value && Date.now() - start > 500) {
      start = Date.now();
      await connection.execute('insert into vote_histories (device_id, created_at, updated_at) values (?, ?, ?);', [
        1, getSqlDatetime(), getSqlDatetime()
      ]);
      console.info('send data device1');
    }
  });
}
