const obnizId = "9759-0430";
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

let votes = [
  {
    id: 1,
    label: "A",
    count: 0,
  },
  {
    id: 2,
    label: "B",
    count: 0,
  },
  {
    id: 3,
    label: "C",
    count: 0,
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

const updateVotes = async (chart) => {
  await Promise.all(
    seonsors.map(async (sensor) => {
      const res = await fetchVoteCount(sensor.id);
      const count = res?.count ?? 0;
      const vote = votes.find((vote) => vote.id === sensor.id);
      const otherVotes = votes.filter((vote) => vote.id !== sensor.id);
      votes = [...otherVotes, { ...vote, count }];
    })
  );
  chart.data.datasets.forEach((dataset) => {
    dataset.data = [votes.find((dress) => dress.label === dataset.label).count];
  });
  chart.data.datasets = chart.data.datasets.sort(
    (a, b) => b.data[0] - a.data[0]
  );
  chart.update();
};

window.onload = () => {
  // chart
  const ctx = document.getElementById("vote-chart");
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["投票結果"],
      datasets: votes.map(({ label, count }) => ({
        label,
        data: [count],
      })),
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
  updateVotes(chart);

  // reset button
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("role") === "admin") {
    const resetButton = document.getElementById("reset");
    resetButton.classList.remove("hidden");
    resetButton.addEventListener("click", async () => {
      await Promise.all(
        seonsors.map(async (sensor) => {
          await resetVote(sensor.id);
        })
      );
      await updateVotes(chart);
    });
  }

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
          await updateVotes(chart);
        }
      });
    }
  };
};
