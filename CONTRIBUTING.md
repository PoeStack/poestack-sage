## **Did you find a bug?**

* **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/PoeStack/poestack-sage/issues).

* If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/PoeStack/poestack-sage/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, screenshots/videos of the issue and/or log files will greatly help the team help you. If the bug was in a plugin please include the plugin name in brackets in the issue title like `[Stash Tab Plugin] Failing to load cluster jewels` so we can get the right people looking at the issue.

## **Would you like to create a plugin?**


## **Would you like to add something to the core library?**
It is best practice to [open an issue](https://github.com/PoeStack/poestack-sage/issues/new) and mark it as an enhancement then describe what you plan on adding and what use-cases it will address. This gives other people including the maintainers an opportunity to provide feedback before you've committed your time to building the feature. Additions to the core library are held to a higher standard than plugins since maintenance on the core library is mainly handled by a small group of people and these changes effect the entire ecosystem.

Additions to the core library should adhere to the following ideas:
- We want the core library to contain a feature set that provides all the useful building blocks to create POE plugins.
- We would like this feature set to be deep level enough that experienced people are not held back but simple enough that creating simple plugins doesn't require a PHD in PoeStack.
- There will come a time when there are many more plugins and plugin developers than there are core maintainers. This imbalance needs to be considered when choosing what features should be supported by the core library and what should be left to plugin developers. We want the core library to contain the truly common functionality, trying to support the use-cases of every plugin in the core library will eventually overburden the maintainers and lead to a poor development experience for everyone.
- Features added to the core library need to be well-designed to reduce edge cases. We want people using the core library to be confident it works consistently. This doesn't mean features can't be complex or take time to understand but once that understanding is acquired they need to be consistent. If a feature is so complex or has so many potential use-cases that it cannot be built in a way that minimizes edge-cases or create a consistent experience that might be a sign that it should not be a feature of the core library and should be left to the plugins to implement.
- Each feature added to the core library should have a compelling reason for its addition. Our goal should be that each feature of the core library is widely used if something only has a few uses cases and especially if it is also complex it will add technical debt and increased maintenance/backward compatibility concerns to each future feature. If no compelling wide use case can be made for a feature it should not be added to the core library.
