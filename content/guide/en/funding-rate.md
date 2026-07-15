---
title: What Is Funding Rate? The Thermometer for Perp Market Lean
description: Why perpetual futures have a funding rate, what positive vs. negative means, and how to read it as an overheating signal.
order: 2
---

The single most traded product in crypto derivatives is the future with no expiry — the so-called **perpetual future (perp)**. Traditional futures settle at expiry, pulling the futures price toward spot as the date approaches. Perps have no expiry. So what stops the perp price from drifting infinitely away from spot? That mechanism is the **funding rate**.

## How funding works

The funding rate isn't a fee the exchange pockets — it's **money longs and shorts pay each other**. On Binance it settles once every 8 hours.

- When the perp trades **above** spot (a premium), funding goes **positive** and longs pay shorts. Holding a long now costs something, which cools overheated long demand, while shorts get paid, restoring balance.
- When the perp trades **below** spot, funding goes **negative** and shorts pay longs.

So funding is both the rubber band tethering the perp price to spot, and a real-time sentiment gauge showing **which way the market is currently leaning.**

## Getting a feel for the numbers

The baseline funding rate on Binance's BTCUSDT perp is 0.01% (per 8 hours). At that level the market is roughly balanced. It looks like a nothing number, but annualize it and the story changes. 0.01% three times a day adds up to about 11% a year. Push funding to 0.05% and you're at roughly 55% annualized; 0.1% is over 100%. The longer you hold a position, the more funding becomes a cost you can't ignore.

By convention, participants read **sustained +0.05% or higher as long overheating**, and **deepening negative funding as short overheating.** During the 2021 bull phase, extreme long lean with funding flirting past 0.1% showed up often, and such stretches were frequently followed by leveraged longs getting liquidated all at once — the long squeeze. Conversely, stretches where funding dropped deep negative right after a crash sometimes set the stage for a short squeeze, as over-crowded shorts snapped back.

## Why read it contrarian, and its limits

The logic for reading funding as a contrarian signal is simple. If everyone is betting long and willingly paying a cost to do so, there may not be many new buyers left. On top of that, leverage stacked one way can trigger cascading liquidations on even a small move the other way, shoving price further. That's why extreme funding often gets described as "fuel for a violent move in the opposite direction."

There are limits, of course. In a strong uptrend funding can stay positive for weeks while price keeps rising. High funding alone can't confirm a drop is coming, and vice versa. Settlement cycles and formulas also differ slightly by exchange, so watching the trend across several venues is safer than fixating on one exchange's snapshot value.

Experienced participants read funding alongside **open interest**. If funding is spiking *and* open interest is surging, fresh leverage is pouring in one direction, so the potential energy for an unwind (a liquidation event) is building. If funding is high but open interest is falling, the cleanup may already be underway.

The octopus on this site reads funding contrarian too. It normalizes so that +0.05% saturates to a short bias of -1 and -0.05% saturates to a long bias of +1, then uses it as one of five indicators (see the [full algorithm reveal](/guide/our-algorithm) for the exact formula). If you want the current funding number, you'll find it on the [Market Temperature](/market) page. To stress it again: funding is a thermometer for market lean, not an alarm clock telling you when to trade.
