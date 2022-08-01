let ranksMap = new Map([
  [
    "A",
    {
      quantity: 0,
      suits: [],
      next: null,
    },
  ],
  [
    "K",
    {
      quantity: 0,
      suits: [],
      next: "A",
    },
  ],
  [
    "Q",
    {
      quantity: 0,
      suits: [],
      next: "K",
    },
  ],
  [
    "J",
    {
      quantity: 0,
      suits: [],
      next: "Q",
    },
  ],
  [
    "10",
    {
      quantity: 0,
      suits: [],
      next: "J",
    },
  ],
  [
    "9",
    {
      quantity: 0,
      suits: [],
      next: "10",
    },
  ],
  [
    "8",
    {
      quantity: 0,
      suits: [],
      next: "9",
    },
  ],
  [
    "7",
    {
      quantity: 0,
      suits: [],
      next: "8",
    },
  ],
  [
    "6",
    {
      quantity: 0,
      suits: [],
      next: "7",
    },
  ],
  [
    "5",
    {
      quantity: 0,
      suits: [],
      next: "6",
    },
  ],
  [
    "4",
    {
      quantity: 0,
      suits: [],
      next: "5",
    },
  ],
  [
    "3",
    {
      quantity: 0,
      suits: [],
      next: "4",
    },
  ],
  [
    "2",
    {
      quantity: 0,
      suits: [],
      next: "3",
    },
  ],
]);

let suitsMap = new Map([
  [
    "H",
    {
      quantity: 0,
      ranks: new Map(),
    },
  ],
  [
    "S",
    {
      quantity: 0,
      ranks: new Map(),
    },
  ],
  [
    "D",
    {
      quantity: 0,
      ranks: new Map(),
    },
  ],
  [
    "C",
    {
      quantity: 0,
      ranks: new Map(),
    },
  ],
]);

const clearValuesWithQuantityZero = () => {
  for (let [key, value] of ranksMap.entries()) {
    if (value.quantity === 0) {
      ranksMap.delete(key);
    }
  }
  for (let [key, value] of suitsMap.entries()) {
    if (value.quantity === 0) {
      suitsMap.delete(key);
    }
  }
};

const sortByRankAndSuit = (cards) => {
  cards.forEach((card) => {
    let rank = card.substring(0, card.length - 1);
    let suit = card.substring(card.length - 1);

    let rankData = ranksMap.get(rank);

    rankData.quantity++;
    if (!rankData.suits.includes(suit)) {
      rankData.suits.push(suit);
    }
  });

  // derive suits from ranks
  for (let [key, value] of ranksMap.entries()) {
    value.suits.forEach((suit) => {
      const suitData = suitsMap.get(suit);
      suitData.quantity++;
      suitData.ranks.set(key, value);
    });
  }

  clearValuesWithQuantityZero();
};

const areRanksConsecutive = (ranks) => {
  const rankEntries = [...ranks.entries()];

  for (let i = 0; i < 3; i++) {
    const returnedRanks = [];

    for (let j = i; j < rankEntries.length - 1; j++) {
      const currentRank = rankEntries[j];
      const nextRank = rankEntries[j + 1];

      // 0 = key, 1 = value
      if (currentRank[0] === nextRank[1].next) {
        if (returnedRanks.length < 3) {
          returnedRanks.push(currentRank[0]);
        } else {
          returnedRanks.push(currentRank[0]);
          returnedRanks.push(nextRank[0]);
          return returnedRanks;
        }
      } else {
        break;
      }
    }
  }

  return false;
};

const highestSuitQuantity = (suits) => {
  const max = { suit: null, quantity: 0 };

  for (let [key, value] of suits.entries()) {
    if (value.quantity > max.quantity) {
      max.suit = key;
      max.quantity = value.quantity;
    }
  }

  return max;
};

const highestRankQuantity = (ranks, rank = undefined) => {
  const max = { rank: null, quantity: 0 };

  for (let [key, value] of ranks.entries()) {
    if (value.quantity > max.quantity && key !== rank) {
      max.rank = key;
      max.quantity = value.quantity;
    }
  }

  return max;
};

const nextHighestRanks = (ignoredRanks, numberLeft) => {
  const returnedRanks = [];
  const rankKeys = [...ranksMap.keys()];
  let index = 0;

  while (returnedRanks.length < numberLeft) {
    if (!ignoredRanks.includes(rankKeys[index])) {
      returnedRanks.push(rankKeys[index]);
    }
    index++;
  }

  return returnedRanks;
};

const hand = (holeCards, communityCards) => {
  const cards = holeCards.concat(communityCards);
  sortByRankAndSuit(cards);

  const biggestRank = highestRankQuantity(ranksMap);
  const nextBiggestRank = highestRankQuantity(ranksMap, biggestRank.rank);
  const biggestSuit = highestSuitQuantity(suitsMap);

  const straightFlush = areRanksConsecutive(
    suitsMap.get(biggestSuit.suit).ranks
  );
  const straight = areRanksConsecutive(ranksMap);

  // straight flush
  if (biggestSuit.quantity >= 5 && straightFlush) {
    return { type: "straight flush", ranks: straightFlush };

    // four-of-a-kind
  } else if (biggestRank.quantity === 4) {
    const remainingRank = nextHighestRanks([biggestRank.rank], 1);
    return {
      type: "four-of-a-kind",
      ranks: [biggestRank.rank].concat(remainingRank),
    };

    // full house
  } else if (biggestRank.quantity === 3 && nextBiggestRank.quantity === 2) {
    return {
      type: "full house",
      ranks: [biggestRank.rank, nextBiggestRank.rank],
    };

    // flush
  } else if (biggestSuit.quantity >= 5) {
    return {
      type: "flush",
      ranks: [...suitsMap.get(biggestSuit.suit).ranks.keys()],
    };

    // straight
  } else if (straight) {
    return {
      type: "straight",
      ranks: straight,
    };

    // three-of-a-kind
  } else if (biggestRank.quantity === 3) {
    const remainingRanks = nextHighestRanks([biggestRank.rank], 2);
    return {
      type: "three-of-a-kind",
      ranks: [biggestRank.rank].concat(remainingRanks),
    };

    // two-pair
  } else if (biggestRank.quantity === 2 && nextBiggestRank.quantity === 2) {
    const remainingRank = nextHighestRanks(
      [biggestRank.rank, nextBiggestRank.rank],
      1
    );
    return {
      type: "two-pair",
      ranks: [biggestRank.rank, nextBiggestRank.rank].concat(remainingRank),
    };

    // pair
  } else if (biggestRank.quantity === 2) {
    const remainingRanks = nextHighestRanks([biggestRank.rank], 3);
    return {
      type: "pair",
      ranks: [biggestRank.rank].concat(remainingRanks),
    };

    // nothing
  } else {
    return {
      type: "nothing",
      ranks: [...ranksMap.keys()].slice(0, 5),
    };
  }
};
