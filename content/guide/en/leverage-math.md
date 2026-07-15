---
title: The Math of Leverage — Why -50% Needs +100% to Get Back
description: The asymmetry of loss and recovery, volatility drag, and the link between leverage multiple and liquidation distance — the hidden math of leverage, worked out in numbers.
order: 5
---

Most leverage talk starts with "how many times you can multiply your gains," but what actually decides your account's fate is much simpler arithmetic. This piece covers just three mathematical facts: **loss and recovery are not symmetric, volatility itself eats your balance, and leverage divides down the margin of error you can survive.**

## 1. The loss-recovery asymmetry

If 1,000 dollars takes a 50% loss, it becomes 500. How much do you need to get back to even? Not 50% — **100%.** The return needed to recover is `loss ÷ (1 - loss)`, and it climbs steeply the bigger the loss.

| Loss | Return needed to recover |
|---|---|
| -10% | +11.1% |
| -20% | +25% |
| -33% | +50% |
| -50% | +100% |
| -75% | +300% |
| -90% | +900% |

In the loss zone, the same percentage carries more weight the further down you go. That's why experienced traders talk about **managing maximum drawdown (MDD)** before maximizing gains. A single -75% can't be recovered even by three +50% runs.

## 2. Volatility drag — a balance that shrinks just from going up and down

If price rises 10% then falls 10%, are you back to even? 100 → 110 → 99. **1% is gone.** Flip the order and the result is the same. When rises and falls of equal amplitude repeat, your balance follows the geometric mean, not the arithmetic mean — and the geometric mean falls further below the arithmetic mean the greater the volatility. This is volatility drag.

Leverage amplifies this drag to roughly a squared degree. Repeat the same scenario at 3x and it becomes +30%, -30%: 100 → 130 → 91. 9% vanishes in one cycle. Even if you get the direction right, a **choppy path** slowly melts a leveraged position. Leverage ETFs that rebalance their multiple daily bleed out gradually in a chop for the same reason.

## 3. Leverage = dividing down your margin for error

As we saw in [Futures Trading and Liquidation Risk](/guide/futures-liquidation), the theoretical liquidation distance of an N-times position is roughly `100% ÷ N` (in practice it's closer, because of maintenance margin and fees).

| Leverage | Adverse move tolerated before liquidation (theoretical) |
|---|---|
| 2x | about 50% |
| 5x | about 20% |
| 10x | about 10% |
| 20x | about 5% |
| 50x | about 2% |

Recall that Bitcoin's daily range topping 3–5% is hardly rare, and you can see that leverage of 20x or more is a structure where "even if your direction is right, your account can vanish first in the chop along the way." Liquidation isn't a matter of probability — it's a matter of the **geometry of volatility and distance.**

## What the Kelly criterion tells us

To the question "but if I'm confident, shouldn't I bet big?" the Kelly criterion, a classic of gambling math, gives a partial answer. The Kelly formula tells you the betting fraction that maximizes long-run compound growth *when the win rate and payoff are known exactly*, and two of its implications are famous. First, in a game with no edge, the optimal bet is **0.** Second, even with an edge, **betting more than twice the optimal fraction makes long-run growth negative.** High-multiple betting when you don't know your own win rate is, mathematically, optimizing the speed of ruin rather than growth.

## Wrapping up

Leverage is just a tool, neither good nor evil — but its math is cold. Loss weighs more than recovery, volatility is a cost in itself, and the multiple eats into the margin of error you can survive on. It's one of the reasons the octopus on this site never states a target price or a multiple on its result screen — the direction-guessing game and the math of account survival are two entirely different problems.
