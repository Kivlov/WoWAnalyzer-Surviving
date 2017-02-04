# Holy Paladin mastery effectiveness calculator

Run it:

[https://martijnhols.github.io/MasteryEffectivenessCalculator/build/index.html](https://martijnhols.github.io/MasteryEffectivenessCalculator/build/index.html)

# TODO

 * Rank mastery effectiveness with colors like WCL (100% = legendary, 85+ is epic, etc)
 * Get player names and merge them with events
 * -> show mastery effectiveness per player (so you can shout at your hunters)
 * Time per heal
 * Add support for BotLB (a lot of work)
 * URL routing (this is probably most handy)
 * Mobile support (lol people using these kind of tools on smartphones - what happened to these kids?!)

I no longer have any plans to remove the need for an API key. I wanted to make a proxy to prevent abuse of my API key but with a proxy they
could still abuse my API key by abusing my proxy which would be double bad. I could just hardcode my API key and reset when someone starts
abusing it, but then the harm would have been done. Letting the user enter his API key seems the best for now and so far I don't think
anybody had any difficulty finding his.

# License

Contact me (e.g. make a ticket) if you want to use my code for anything. I haven't decided what license to use yet.
