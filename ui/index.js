const obnizId = '9759-0430';
const seonsors = [
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

const fetchVoteCount = async (deviceId) => {
  const res = await fetch(
    `https://4mn3egvtck.execute-api.us-east-1.amazonaws.com/dev/vote/${deviceId}`
  );
  return res.json();
};
const sendVote = async (deviceId) => {
  await fetch(
    `https://4mn3egvtck.execute-api.us-east-1.amazonaws.com/dev/vote/${deviceId}`,
    {
      method: "POST",
    }
  );
};
const resetVote = async (deviceId) => {
  await fetch(
    `https://4mn3egvtck.execute-api.us-east-1.amazonaws.com/dev/vote/${deviceId}`,
    {
      method: "DELETE",
    }
  );
};

const updateVotes = async () => {
  await Promise.all(
    seonsors.map(async (sensor) => {
      const res = await fetchVoteCount(sensor.id);
      const count = res?.count ?? 0;
      const vote = document.getElementById(`vote-${sensor.id}`);
      vote.innerText = String(count);
    })
  );
};

// device
const obniz = new Obniz(obnizId);
obniz.onconnect = async (obn) => {
  console.info("device connected");
  for (const sensor of seonsors) {
    let start = Date.now();
    const gnd = obn.getIO(sensor.gnd);
    const vcc = obn.getIO(sensor.vcc);
    const signal = obn.getIO(sensor.signal);
    gnd.pull("5v");
    gnd.drive("open-drain");
    gnd.output(false);
    vcc.output(true);
    signal.input(async (value) => {
      if (!value && Date.now() - start > 500) {
        start = Date.now();
        await sendVote(sensor.id);
        console.info(`send data device id: ${sensor.id}`);
        await updateVotes();
      }
    });
  }
};

window.onload = () => {
  updateVotes();
  const resetButton = document.getElementById('reset');
  resetButton.addEventListener('click', async () => {
    await Promise.all(
      seonsors.map(async (sensor) => {
        await resetVote(sensor.id);
      })
    );
    await updateVotes();
  });
}
