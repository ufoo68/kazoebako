import Obniz from 'obniz';
import { load } from 'ts-dotenv';

const env = load({
  DEVICE_ID: String,
});

const obniz = new Obniz(env.DEVICE_ID);
obniz.onconnect = async (obn) => {
  console.info('connected')
  let count = 0;
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
      count++;
      console.log(count);
      start = Date.now();
    }
  });
}