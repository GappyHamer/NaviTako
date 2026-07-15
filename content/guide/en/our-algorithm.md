---
title: How the Octopus Draws Its Prophecy — The Algorithm Story
description: The big picture of how the octopus tilts the odds ever so slightly with real market indicators to pick long or short — and why it's still entertainment, not prediction.
order: 10
---

It's rare for an oracle to talk about its own inner workings, but this oracle is a little different. This piece introduces, in **broad strokes**, how the octopus picks between long and short. By the end, two things should be clear: the octopus is not a pure dice roll, and even so, this is entertainment, not prediction.

> The detailed calculations and weights are still being refined, so for now we're only revealing the principles in the abstract. As we polish the indicators further, we'll open up another layer at a time.

## The five things the octopus reads

When you press the button, the server briefly reads five indicators from the real market (cached briefly; sources are public data).

1. **Market sentiment** — whether people are gripped by fear right now or drunk on greed ([Fear & Greed Index](/guide/fear-greed-index))
2. **Funding lean** — which way the futures market, long or short, is overheating ([funding rate](/guide/funding-rate))
3. **The weight of the whales** — which side the top traders are standing on
4. **The crowd's lean** — whether the majority of accounts are piled onto one side ([long/short ratio](/guide/long-short-ratio))
5. **Short-term momentum** — whether the recent flow is heading up or down

What each indicator means is covered in more detail in the individual guides linked above.

## Gathering the indicators into a single "current"

The octopus turns each indicator into a single directional signal: "does this favor long, or short?" Two attitudes are mixed in here. For things like sentiment and the crowd, it **fades the side everyone has piled onto**; for things like the whales and the trend, it **follows the side carrying the weight.** Combining these signals, each with a different weight, produces one **current** — is the market tilting long right now, or short?

Exactly how each indicator is quantified and with what weight they're blended is still very much a work in progress, so we're not disclosing it now. Please just remember the broad shape of the direction — that is, **what it fades and what it follows.**

External data can drop at any time. If some indicators go missing, it rebalances and recomputes with what's left, and if all five fail, the octopus switches to a **flat coin-flip luck mode** (a badge shows up on screen). In any case, the button never stops.

## It only tilts the odds slightly — it never locks in

This current nudges the probability of a long coming up **slightly** to one side. But there's one firm principle here. No matter how strong the current, the octopus **never locks in either side at 100%.** Even at the strongest long signal, it always leaves room for a short to jump out, and vice versa — just as the real market always does.

That's why the result screen shows neither probabilities nor indicator values. Instead it shows only current-phrases like "a tense tug-of-war" or "leaning slightly long." The moment it hands you a number, this piece of entertainment could be mistaken for a prediction tool. If you're curious about the market mood right now, we've put an educational indicator dashboard on the separate [Market Temperature](/market) page.

## Why this isn't "prediction"

Let me be honest. There is no statistical evidence that these five indicators hit future prices. The direction of whether to fade or follow each indicator only captures long-standing conventions among market participants and tendencies observed over a few cycles, and the weights are values the operator set by feel. Even if some indicator truly held an edge, a single draw pressed down so as never to lock in one side ends up being entertainment close to a coin flip.

And yet the reason we reveal the principles is one thing: **knowing the framework of the fun you're enjoying** is entirely different from believing in it blind. Please enjoy the octopus's prophecy as content shared for a laugh in the community, and always make your investment decisions with your own research and responsibility. The octopus would want that most of all.
