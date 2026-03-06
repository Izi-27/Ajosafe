# AjoSafe Demo Script

## Full Script

Hello everyone. My name is [Your Name], and this is AjoSafe.

AjoSafe is a digital savings-circle platform inspired by the way many people across Africa already save together through Ajo, Esusu, thrift groups, and other rotating savings systems.

The problem we are solving is simple. Traditional group savings are powerful because they are familiar, social, and community-driven. But they also come with major risks. In many cases, one person collects the money, keeps the records, and controls the process. That creates room for disputes, poor transparency, missed payments, and in the worst case, one person disappearing with everyone else's funds.

AjoSafe is our answer to that problem.

We are building a platform that keeps the cultural strength of group savings, but replaces informal trust with transparent digital rules. Instead of relying on one collector, AjoSafe uses a smart contract on Flow to define the savings circle, record participation, and support contribution logic in a way that every member can understand and track.

At its core, AjoSafe stands for a few important values.

First, trust through rules, not personalities.

Second, transparency for every member in the circle.

Third, fairness and accountability in how savings groups are managed.

And fourth, inclusion. We are not building for only crypto-native users. We are building for ordinary people who already understand group savings and need a safer, easier, and more trustworthy way to participate.

So who is AjoSafe for?

AjoSafe is for family savings groups, women-led contribution circles, market associations, local cooperatives, church communities, neighborhood groups, and diaspora communities coordinating savings back home. It is especially useful for people who already believe in collective finance but want less risk, better structure, and clearer records.

What have we built so far in this hackathon?

We have built the core public web application using Next.js. Users can access a landing page, move into the app, create a savings circle, and view circle details from the dashboard experience.

On the blockchain side, we have built and deployed the AjoCircle smart contract on Flow testnet. That means the contract infrastructure for creating and managing circles is already live on-chain for this hackathon build.

We have also connected the frontend to Flow, so the application can interact with the deployed contract for circle creation and contribution actions.

For agreement and record storage, we have integrated a Filecoin storage path using the Synapse SDK approach. This gives us a way to preserve important off-chain group agreement data while still anchoring the financial logic on-chain.

In addition, we have improved validation and runtime safeguards in the app so that invalid circle setups, missing addresses, and configuration problems are handled more clearly.

So in summary, what is already implemented?

We have implemented the main web interface.

We have implemented the circle creation flow.

We have implemented the circle detail and contribution flow.

We have deployed the Flow contract to testnet.

We have integrated Flow transactions and queries from the frontend.

And we have integrated the Filecoin agreement storage path through Synapse-oriented server routes.

Now, what still needs to be completed before the end of the hack?

The biggest remaining work is final live verification and polish.

We need to complete a full end-to-end live test of circle creation with funded Synapse storage configuration.

We need to finalize the production environment configuration for Filecoin-backed uploads.

We also need to keep tightening the live user flow, improve messaging, and make sure the demo path is stable from start to finish.

There are also important features that are part of our bigger vision, but are not fully implemented in the current hackathon build.

One of those is walletless onboarding.

Walletless login matters because the average user should not have to understand seed phrases, browser extensions, or crypto setup before they can join a savings circle. In the future, AjoSafe should feel as easy as logging into a normal consumer app, while still benefiting from blockchain infrastructure underneath.

Another major future step is fiat onboarding, especially direct NGN deposits. This matters because most everyday users in Nigeria do not start with crypto. If we enable a clean path from naira into savings participation, onboarding becomes far more realistic for the people we actually want to serve.

That leads to the broader value proposition of AjoSafe.

We are not just building a blockchain app.

We are building infrastructure for safer community finance.

AjoSafe reduces collector risk.

It gives savings groups visibility into their rules and progress.

It creates a shared record of participation.

It makes group savings easier to explain, manage, and trust.

And it creates a path for informal finance to become more secure and more scalable without losing its social roots.

From a technical perspective, the current architecture is built around a Next.js frontend, a Flow smart contract layer, Flow Client Library integration for wallet interactions, and a Filecoin storage path through Synapse for agreement-related data.

This architecture allows us to keep the user-facing product simple, while separating on-chain financial rules from off-chain document storage.

Why does this project matter?

Because millions of people already use informal savings systems. The behavior already exists. The trust problem already exists. The disputes already exist. The opportunity is not to invent a new habit. The opportunity is to protect an existing one.

AjoSafe is about preserving the community model of Ajo while removing some of its biggest failure points.

Our long-term vision is to make this useful not only for crypto users, but for ordinary communities, cooperatives, and families who need transparent and dependable savings coordination.

By the end of this hackathon, our goal is to present a working, credible foundation for that future: a live product, a live contract, a clear user flow, and a roadmap toward walletless onboarding, fiat access, reminders, reputation, and stronger member coordination.

Thank you. This is AjoSafe.

## Short Closing Variant

AjoSafe brings traditional community savings into a more transparent digital system. We use Flow for on-chain savings-circle logic, Filecoin through Synapse for agreement storage, and a web app that helps groups create, track, and manage circles with less risk and more accountability. Our hackathon build delivers the foundation, and our roadmap pushes toward walletless onboarding, fiat access, and mainstream adoption.
