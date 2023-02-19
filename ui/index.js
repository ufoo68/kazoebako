const obnizId = '9759-0430';

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
let dresses = [
  {
    id: 1,
    gnd: 0,
    vcc: 1,
    signal: 2,
    label: "赤",
    count: 0,
    background: "rgba(255, 99, 132, 0.2)",
  },
  {
    id: 2,
    gnd: 4,
    vcc: 5,
    signal: 6,
    label: "緑",
    count: 0,
    background: "rgba(75, 192, 192, 0.2)",
  },
  {
    id: 3,
    gnd: 8,
    vcc: 9,
    signal: 10,
    label: "青",
    count: 0,
    background: "rgba(54, 162, 235, 0.2)",
  },
];
window.onload = () => {
  const ctx = document.getElementById('chart');
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["投票数"],
      datasets: dresses.map(({ label, count, background }) => ({
        label,
        data: [count],
        backgroundColor: background,
      })),
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  const updateChart = async () => {
    dresses = await Promise.all(
      dresses.map(async (dress) => {
        const res = await fetchVoteCount(dress.id);
        const count = res?.count ?? 0;
        return {
          ...dress,
          count,
        };
      })
    );
    chart.data.datasets.forEach((dataset) => {
      dataset.data = [
        dresses.find((dress) => dress.label === dataset.label).count,
      ];
    });
    chart.data.datasets = chart.data.datasets.sort(
      (a, b) => b.data[0] - a.data[0]
    );
    chart.update();
  };

  const resetButton = document.getElementById('reset');
  resetButton.addEventListener('click', async () => {
    await Promise.all(
      dresses.map(async (dress) => {
        await resetVote(dress.id);
      })
    );
    await updateChart();
  });

  updateChart();

  // device
  const obniz = new Obniz(obnizId);
  obniz.onconnect = async (obn) => {
    console.info("device connected");
    for (const dress of dresses) {
      let start = Date.now();
      const gnd = obn.getIO(dress.gnd);
      const vcc = obn.getIO(dress.vcc);
      const signal = obn.getIO(dress.signal);
      gnd.pull("5v");
      gnd.drive("open-drain");
      gnd.output(false);
      vcc.output(true);
      signal.input(async (value) => {
        if (!value && Date.now() - start > 500) {
          start = Date.now();
          await sendVote(dress.id);
          console.info(`send data device id: ${dress.id}`);
          await updateChart();
        }
      });
    }
  };
};
