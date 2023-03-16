const voteDict = {
  1: "A",
  2: "B",
  3: "C",
};

const fetchVoteCount = async (voteId) => {
  const res = await fetch(
    `https://4mn3egvtck.execute-api.us-east-1.amazonaws.com/dev/vote/${voteId}`
  );
  const resData = await res.json();
  return { id: voteId, ...resData };
};

const getRating = (votes, i) => {
  const previousVote = votes[i - 1];
  const currentVote = votes[i];
  return previousVote.count !== currentVote.count
    ? i + 1
    : getRating(votes, i - 1);
};

window.onload = async () => {
  const votes = await Promise.all(
    [1, 2, 3].map((rank) => fetchVoteCount(rank))
  );
  const sortedVotes = votes.sort((a, b) => b.count - a.count);
  const ranks = sortedVotes.map((vote, i) => {
    return {
      order: i + 1,
      label: voteDict[vote.id],
      count: vote.count,
      rating: i === 0 ? i + 1 : getRating(sortedVotes, i),
    };
  });
  for (const rank of ranks) {
    const rankLabel = document.getElementById(`rank-${rank.order}-label`);
    rankLabel.innerText = rank.label;
    const rankCount = document.getElementById(`rank-${rank.order}-count`);
    rankCount.innerText = `${rank.count}票`;
    const rankRating = document.getElementById(`rank-${rank.order}-rating`);
    rankRating.innerText = `${rank.rating}位`;
  }
};
