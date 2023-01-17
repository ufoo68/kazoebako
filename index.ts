import Obniz from 'obniz';
import { load } from 'ts-dotenv';

const env = load({
  DEVICE_ID: String,
});

const obniz = new Obniz(env.DEVICE_ID);
obniz.onconnect = async (o) => {
  let count = 0;
  const io0 = o.getIO(0);
  const io1 = o.getIO(1);
  const io3 = o.getIO(3);
  io0.pull('5v');
  io0.drive('open-drain');
  io0.output(false);
  io1.output(true);
  io3.input(async (value) => {
    if (!value) {
      count++;
      console.log(count);
    }
  });
}