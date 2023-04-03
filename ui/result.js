const voteDict = {
  1: "病めるときも<br>健やかなるときも<br>ガチャ爆死したときも<br>手料理がまずかったときも<br>お互いを愛し尊重し許し合うことを誓います",
  2: "1.明るく笑いで溢れる家庭を築きます<br>2.相手を思いやり助け合うことを誓います<br>3.お互いの家族や友人を 大切にしあいます<br>4.ノルちゃんを取られても恨まないようにします",
  3: "「ゆ」友人や家族を大切にし<br>「う」嬉しいことも苦しいことも共に分かち合って<br>「た」沢山の思い出を一緒に作っていきます<br>「り」理解する気持ちを大切にし<br>「よ」喜びは2倍、悲しみは1/2で消化することを目標に<br>「う」うっかり失敗しても笑って許して<br>「こ」これからは二人で支えあって生きていくことを誓います",
};

const fetchVoteCount = async (voteId) => {
  const res = await fetch(
    `https://4mn3egvtck.execute-api.us-east-1.amazonaws.com/dev/vote/${voteId}`
  );
  const resData = await res.json();
  return { id: voteId, ...resData };
};

const getRating = (votes, i) => {
  if (i === 0) {
    return 1;
  }
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
    rankLabel.innerHTML = rank.label;
    const rankRating = document.getElementById(`rank-${rank.order}-rating`);
    rankRating.innerText = `${rank.rating}位（${rank.count}票）`;
  }
};
