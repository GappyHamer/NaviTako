---
title: RSI Basics — What Overbought and Oversold Really Mean
description: How the classic indicator RSI is calculated, the misunderstanding around the 70/30 rule, and the traps of divergence and trending markets — from the ground up.
order: 7
---

When you start learning chart analysis, the very first indicator you meet is **RSI (Relative Strength Index).** Devised by Welles Wilder in 1978, it's built into nearly every charting app, and the line "below 30 is oversold" floats around like a trading proverb. Yet surprisingly few people know exactly what that number is counting.

## What RSI measures

RSI takes **the ratio of the strength of up days to the strength of down days over a recent period** and converts it to a 0–100 scale. The default setting is 14 candles. Put into words, the calculation goes like this.

1. Over the last 14 candles, find the average of the up moves (AU) and the average of the down moves (AD) versus the prior candle.
2. Compute the relative strength RS = AU ÷ AD.
3. Convert with RSI = 100 − 100 ÷ (1 + RS).

When up-strength and down-strength are equal (RS=1), RSI is 50. If all 14 candles are up, it pins near 100; all down, near 0. In other words, RSI is not a device for predicting the future — it's a **lagging statistic that summarizes the bias of recent price movement.**

## The 70/30 rule and its misunderstanding

The textbook reading is simple. RSI at 70 or above is overbought (rose too much too fast), 30 or below is oversold (fell too much). In a ranging market this contrarian frame works well enough, because the pattern of RSI crossing 70 at the top of the range and breaking 30 at the bottom repeats.

The problem is a **trending market.** In a strong uptrend, RSI can sit above 70 for weeks while price keeps climbing. Bitcoin's weekly RSI in the 2020–2021 bull run floated in the overbought zone for a long stretch. Conversely, hands that caught a crash thinking "RSI is at 30, so it'll bounce" often got to see an even deeper bottom. That's why experienced users sometimes flip the reading, treating overbought/oversold not as a "reversal signal" but as **"evidence the trend is strong."** The fact that the same number allows opposite interpretations is the intrinsic limit of indicators.

## Divergence — what RSI users actually watch

A use that has earned more trust than plain 70/30 is **divergence.** If price sets a new high but RSI's peak is lower than before (bearish divergence), it reads as a hint that the internal momentum of the rise is weakening. Conversely, if price sets a new low but RSI's trough is higher (bullish divergence), you suspect the selling pressure is exhausting. Divergence too is not a confirmed signal but a probabilistic warning light, and the convention is to give it more weight on larger timeframes (daily, weekly).

## What to remember in practice

- **The picture changes completely by timeframe.** A 15-minute RSI oversold and a weekly RSI oversold carry different weight.
- **RSI trading on its own has a faint statistical edge.** It's typically overlaid with trend judgment (moving averages, etc.) and market sentiment ([Fear & Greed Index](/guide/fear-greed-index), [funding rate](/guide/funding-rate)).
- The setting of 14 is a convention, not a magic number. Shortening the period makes it more sensitive and lengthening it makes it duller — neither is "more correct."

For the record, the octopus on this site doesn't use RSI. The "recent price bias" that RSI summarizes overlaps in role with its 24-hour momentum indicator. The indicators and formulas the octopus actually reads are in the [full algorithm reveal](/guide/our-algorithm). RSI is a fine introductory lens for understanding the market, but remember — no matter how good the lens, the future doesn't come out developed on the film.
