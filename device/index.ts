import Obniz from 'obniz';
import { load } from 'ts-dotenv';
import mysql from 'mysql2/promise';

type Sensor = {
  id: number;
  gnd: number;
  vcc: number;
  signal: number;
};

const sensors: Sensor[] = [
  {
    id: 1,
    gnd: 0,
    vcc: 1,
    signal: 2,
  },
  {
    id: 2,
    gnd: 4,
    vcc: 5,
    signal: 6,
  },
  {
    id: 3,
    gnd: 8,
    vcc: 9,
    signal: 10,
  },
];

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
  for (const sensor of sensors) {
    let start = Date.now();
    const gnd = obn.getIO(sensor.gnd);
    const vcc = obn.getIO(sensor.vcc);
    const signal = obn.getIO(sensor.signal);
    gnd.pull('5v');
    gnd.drive('open-drain');
    gnd.output(false);
    vcc.output(true);
    signal.input(async (value) => {
      if (!value && Date.now() - start > 500) {
        start = Date.now();
        await connection.execute(
          'insert into vote_histories (device_id, created_at, updated_at) values (?, ?, ?);',
          [
            sensor.id, getSqlDatetime(), getSqlDatetime()
          ]);
        console.info(`send data device id: ${sensor.id}`);
      }
    });
  }
}
