---
title: What Is the Kimchi Premium? Korea's Own Price Gap
description: The structural reasons the Kimchi Premium exists, historical cases, and how to read it as a Korean market sentiment gauge.
order: 6
---

The first time you learn that the same Bitcoin trades at a different price on Upbit than on Binance, it makes you tilt your head. When a Korean exchange's price sits above overseas exchanges, that gap is called the **Kimchi Premium** (kimp for short). If it's trading 5% pricier than abroad, that's "5% kimp." When Korea goes cheaper instead, it's called a **reverse premium (yeokp).**

## Why it doesn't vanish — the wall that blocks arbitrage

By the law of one price, a gap like this should disappear instantly through arbitrage — buy cheap abroad, sell dear in Korea. But in reality there's a wall blocking that loop.

- **Capital controls**: Under Korea's foreign exchange law, individuals face limits and reporting duties on overseas remittances. Large won transfers aimed at capturing kimp get blocked at the bank stage or become a legal problem.
- **Friction moving between exchanges**: Moving coins from abroad into Korea to sell is possible, but sending the resulting won back overseas to repeat the loop is blocked, so the arbitrage is one-and-done.
- **Travel Rule and KYC**: Fund-tracking regulations impose constraints and delays on the transfers between exchanges themselves.
- **The won market's isolation**: The won isn't a currency used in international settlement, so global market makers can't instantly absorb price gaps in the won market.

In short, the kimp is a pressure gauge created by **liquidity trapped inside Korea** and **the intensity of Korean investors' demand.**

## The extremes history has shown

The history of the kimp is the history of Korean market overheating. During the late-2017-to-early-2018 mania, the kimp shot up to an unprecedented level **above 50%**, and not long after the market slid into a long bear phase. In April 2021 too, a crash came right after the kimp widened to around 20%. Conversely, at frozen bear-market bottoms, the kimp often sank to near 0% or into negative territory (reverse premium).

Because of this pattern, the kimp is often read like a Korea-only [Fear & Greed Index](/guide/fear-greed-index): **high kimp = Korean retail buying fervor is overheated**, **reverse premium = the Korean market has gone completely cold.** Of course, global money is what moves the global price, so the kimp is less a directional indicator for the world market than "Korea's thermometer."

## Things to watch when looking at the kimp

First, **the exchange rate is half the variable.** Calculating the kimp requires going through the won/dollar rate, so if that rate swings sharply, the kimp figure can lurch regardless of coin demand. Second, **it differs by coin.** If Bitcoin's kimp is low but one particular altcoin's kimp spikes, it may reflect a domestic supply-demand event (a listing, a theme, etc.) for that coin. Third, **actually attempting kimp arbitrage** carries serious legal and practical risk for individuals because of the regulatory wall described above. Reading it as an indicator and diving in yourself are completely different matters.

## Where and how to check it

You can calculate the kimp yourself: `(domestic won price ÷ (overseas dollar price × won/dollar rate) − 1) × 100`. For example, at 140 million won on Upbit, 100,000 dollars on Binance, and a rate of 1,350 won, the kimp is about 3.7%. You don't have to calculate it every time, of course — several Korean services aggregate the kimp in real time, so a quick search finds it easily. While you're at it, comparing the Bitcoin kimp and altcoin kimp side by side helps tell whether domestic demand is a market-wide fervor or a single coin's event.

## Wrapping up

The Kimchi Premium is a graph drawn by Korean investors' psychology on top of the structural wall of capital controls. An extremely wide kimp has often read as a signal of overheating and a deep reverse premium as a signal of cooling, but that's a probabilistic tendency, not a law. For the record, the octopus on this site does not factor the kimp into its math — the five indicators the octopus actually reads are in the [full algorithm reveal](/guide/our-algorithm).
