---
title: Futures Trading and Liquidation Risk — The Exchange Holds the Force-Close Button
description: The basic structure of crypto futures (margin, leverage, mark price), how liquidation happens, and why cascades shake the whole market.
order: 4
---

Spot trading is simple. Buy coins with your own 1,000 dollars and even if the price halves, you're left with 500 dollars of coins. You can wait, and while you wait nobody force-sells your coins. Futures are different. **In exchange for sizing up your position with borrowed power (leverage), the exchange force-closes your position once your loss crosses a certain line.** That's liquidation.

## The basic structure of futures

In crypto futures, especially perps, traders aren't actually buying and selling coins — they're exchanging **contracts that bet on the direction of the price.** You put up only a fraction of the full contract value as collateral, and that collateral is your **margin.**

Say you open a 10,000-dollar position with 1,000 dollars of margin — that's 10x leverage. A 1% rise means 1% on the full position, or 100 dollars of profit, which is a 10% return on your 1,000-dollar margin. Gains 10x, losses 10x — you've probably heard this part plenty.

The problem is that the exchange steps in *before* your loss eats through all your margin. From the exchange's side, if a trader's loss exceeds their margin, the excess becomes the exchange's or the counterparty's loss. So once margin shrinks to the **maintenance margin** level, the exchange force-closes the position at market. For a 10x long, the liquidation line arrives around a 9%-ish drop; for 20x, before even 5%. Because of fees and maintenance margin, the real liquidation price is always closer than the arithmetic "100% ÷ leverage."

## Details that pull liquidation closer

- **Mark price**: Liquidation is usually judged not on the last traded price but on a mark price synthesized from several exchanges' prices. It's a safeguard against unfair liquidation from a momentary bad print — but it's also the reason for the "it never touched on my exchange's chart yet I got liquidated" experience.
- **Cross vs. Isolated**: Isolated margin only loses the margin assigned to that position, but with cross margin your whole account balance is collateral, so one position can drag your entire account down with it.
- **Funding rate**: Hold a position long enough and [funding](/guide/funding-rate) nibbles away at your margin, slowly pulling the liquidation price closer.

## Liquidation cascades — why the market falls like a waterfall

Liquidation doesn't end as one person's tragedy. When a long is liquidated, the exchange closes that position with a **market sell.** If that sell pushes price lower, the liquidation prices of other longs sitting just below get hit one after another, and selling begets selling. In minutes, price collapses by several percent — a **liquidation cascade.** In the May 2021 crash and several 2022 drops, positions worth billions were liquidated in a single day on record. Short squeezes in the other direction work on the same principle. The very act of leverage stacking up one way during calm markets is the fuel for the next violent move, piling up bit by bit.

## What beginners should remember

First, in futures **time is not on your side.** In spot you can hold out, but the liquidation line and funding won't wait for you. Second, it's more accurate to understand leverage as a device that **shrinks your margin for error**, not one that multiplies profit. 20x leverage is, before it's a "20x chance to profit," a "contract that won't tolerate even a 5% move against you." Third, once you understand why liquidation stats and lean indicators become material for reading market psychology, the indicators on this site's [Market Temperature](/market) page will look different.

This piece isn't written to encourage futures trading — quite the opposite. Once you understand the structural risk, it becomes clear why the "you can lose your entire principal" warning is no exaggeration. The mathematical asymmetry of leverage continues in the next piece, [The Math of Leverage](/guide/leverage-math).
