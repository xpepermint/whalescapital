# Whales

> Enables users to invest into ICO project as a whale.

This project is built using [Truffle](http://truffleframework.com/) framework.

## Development

Install dependencies.

```
$ npm install
```

Run in-memory blockchain service.

```
$ npm run testrpc
```

Run run automatic tests. It's advised to install the `nodemon` package globally and then run tests on code change by running.

```
$ nodemon --exec npm test
```

## Contracts

### WhailInvestor

* Run `setSeller()` to set seller's address.
* Run `setFee()` to set seller's address.

* Accepts deposits immediately after the contract is deployed.
* Run `cancel()` to enable withdrawals.
* Run `close()` to stop accepting deposits.
* Run `invest()` to send funds to seller's address.
