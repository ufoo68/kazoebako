const fetchVoteCount = async (deviceId) => {
  const res = await fetch(`https://4mn3egvtck.execute-api.us-east-1.amazonaws.com/dev/vote/${deviceId}`);
  return res.json();
}


document.getElementById('refetch-button').addEventListener('click', () => {
  for (const deviceId of [1, 2, 3]) {
    fetchVoteCount(deviceId).then(
      (res) => {
        const count = res?.count ?? 0;
        document.getElementById(`vote-${deviceId}`).innerHTML = count;
      }
    );
  }
});

