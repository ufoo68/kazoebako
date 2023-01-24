const fetchVoteCount = async (deviceId) => {
  const res = await fetch(`https://4mn3egvtck.execute-api.us-east-1.amazonaws.com/dev/vote/${deviceId}`);
  return res.json();
}


document.getElementById('refetch-button').addEventListener('click', () => {
  Promise.all([1, 2, 3].map(async (deviceId) => {
    const res = await fetchVoteCount(deviceId)
    const count = res?.count ?? 0;
    document.getElementById(`vote-${deviceId}`).innerHTML = count;
  }));
});

