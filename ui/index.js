const fetchVoteCount = async (deviceId) => {
  const res = await fetch(`https://4mn3egvtck.execute-api.us-east-1.amazonaws.com/dev/vote/${deviceId}`);
  return res.json();
}

let dresses = [
  {
    id: 1,
    label: '赤',
    count: 0,
    background: 'rgba(255, 99, 132, 0.2)',
  },
  {
    id: 2,
    label: '緑',
    count: 0,
    background: 'rgba(75, 192, 192, 0.2)',
  },
  {
    id: 3,
    label: '青',
    count: 0,
    background: 'rgba(54, 162, 235, 0.2)',
  },
];

const ctx = document.getElementById('vote-chart');
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['投票数'],
    // labels: dresses.map((dress) => dress.label),
    datasets: dresses.map(({ label, count, background }) => ({
      label,
      data: [count],
      backgroundColor: background,
    }))
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

let isSyncing = false;
let intervalId;
const syncButton = document.getElementById('sync-button');
syncButton.addEventListener('click', () => {
  if (!isSyncing) {
    intervalId = setInterval(async () => {
      dresses = await Promise.all(dresses.map(async (dress) => {
        const res = await fetchVoteCount(dress.id)
        const count = res?.count ?? 0;
        return {
          ...dress,
          count,
        }
      }));
      chart.data.datasets.forEach((dataset) => {
        dataset.data = [dresses.find((dress) => dress.label === dataset.label).count];
      });
      chart.data.datasets = chart.data.datasets.sort((a, b) => b.data[0] - a.data[0]);
      chart.update();
    }, 1000);
    syncButton.innerHTML = '同期停止';
  } else if (intervalId) {
    clearInterval(intervalId);
    syncButton.innerHTML = '同期開始';
  }
  isSyncing = !isSyncing;
});
