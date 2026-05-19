# add-network

## Purpose

Add support for a new ad network SDK wrapper in `core/networks/` and register it in `config.js`.

## When to use

- Add a new ad platform integration
- Support another network in production builds
- Extend the builder for a new placement format

## Triggers

- "add a new network"
- "support a new ad platform"

## What it does

- Creates `core/networks/<NetworkName>.js` extending the base `Network` class
- Implements network-specific SDK init and `complete()` logic
- Adds the new network to `config.networks`
- Imports and wires the network in `core/framework/App.js`
