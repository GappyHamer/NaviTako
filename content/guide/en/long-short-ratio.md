---
title: How to Read the Long/Short Ratio — Smart Money's Position vs. the Crowd's Lean
description: How Binance's two long/short ratios (global account ratio vs. top trader position ratio) differ, and how to interpret each.
order: 3
---

The Long/Short Ratio is exactly what it sounds like: **the ratio of the side betting long to the side betting short.** A ratio of 1 means both sides are evenly matched; above 1 means longs dominate; below 1 means shorts dominate. A ratio of 1.5, for example, means longs and shorts are split 60/40, while 0.5 means it's 33/67 with twice as many shorts.

Simple as it looks, this indicator has one trap beginners often miss: the long/short ratio Binance publishes **isn't a single thing.**

## Two long/short ratios, two completely different stories

Binance futures data has two headline ratios.

- **Global Long/Short Account Ratio**: Counts *every account* holding a position and takes the ratio of long accounts to short accounts. Since it's tallied one-account-one-vote regardless of account size, it heavily reflects the psychology of small retail traders.
- **Top Trader Long/Short Position Ratio**: Takes only the top 20% of accounts by margin balance and computes the long/short ratio of the *position value* they hold. It's tallied by weight of money, not by vote — the direction of the so-called "smart money."

The two ratios pointing in opposite directions at the same moment is common. When price crashes, for instance, the global account ratio spikes on "average down" and "buy the dip" psychology, while the top trader ratio tilts short instead.

## Who to follow and who to fade

Derivatives markets have an old statistical observation: **the more small accounts pile into one direction, the more the market tends to go the other way.** The full reasoning is covered in [Why Retail Always Gets Trapped](/guide/why-retail-loses), but in short, the crowd reacts late to news and price, and crowded positions become fuel for a move the opposite way via liquidation.

So the conventional interpretive frame is this.

- Global account ratio extremely high (retail piled long) → contrarian, **watch for shorts**
- Top trader position ratio high (smart money long) → trend-following, **reference for longs**

The octopus on this site uses the same frame. It scores the top trader ratio as something to follow (trend) and the global account ratio as something to fade (contrarian), then normalizes both on a log scale so they occupy two of its five indicator slots. The reason for the log scale is so that a ratio of 2.0 (twice as long) and 0.5 (twice as short) are treated as symmetric in strength.

## Things to watch when reading it

First, **the ratio tells you direction, not magnitude.** Even if long accounts are numerous, their market impact is limited if each position is tiny. Second, **hedges are mixed in.** Plenty of participants hold spot and short as insurance, so a high short ratio doesn't mean everyone is betting on a drop. Third, **numbers differ by exchange because customer bases differ.** Binance's figures don't represent the whole market. Fourth, extreme lean takes time to unwind, and price can travel further in the crowded direction in the meantime.

To sum up, the long/short ratio is a snapshot of "who's standing on which side right now." One photo can't tell you the future, but overlaid with the Fear & Greed Index and funding rate, it gives you a three-dimensional feel for how far the market is tilted. You'll find the current values on [Market Temperature](/market), and how the octopus folds this value into its math is in the [full algorithm reveal](/guide/our-algorithm).
