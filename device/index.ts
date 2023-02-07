import Obniz from 'obniz';
import { load } from 'ts-dotenv';
import * as mongoDB from 'mongodb';

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
  DB_CONN_STRING: String,
});

const obniz = new Obniz(env.DEVICE_ID);
obniz.onconnect = async (obn) => {
  console.info('device connected');
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(env.DB_CONN_STRING);
  await client.connect();
  const db: mongoDB.Db = client.db('kazoebako');
  const voteHistoryCollection: mongoDB.Collection = db.collection('voteHistory');
  console.log(`Successfully connected to database: ${db.databaseName} and collection: ${voteHistoryCollection.collectionName}`);
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
        await voteHistoryCollection.insertOne({ deviceId: sensor.id })
        console.info(`send data device id: ${sensor.id}`);
      }
    });
  }
}
