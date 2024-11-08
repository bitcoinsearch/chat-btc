# 1.0.0 (2024-11-06)


### Bug Fixes

* abort typing on author query switch ([0a5f7af](https://github.com/bitcoinsearch/chat-btc/commit/0a5f7af24a54e9a7fc7c3a9df44fefcc6138e7d1))
* cache error leaking to answer ([0d51e25](https://github.com/bitcoinsearch/chat-btc/commit/0d51e25281837541b97ffd6488c7fdd4587ee771))
* cached answer, pass filter and order to supabase ([8aa2ab3](https://github.com/bitcoinsearch/chat-btc/commit/8aa2ab31e6495edaae842065831eb52348f61d4e))
* duplicate prompt calls ([b6c1ea8](https://github.com/bitcoinsearch/chat-btc/commit/b6c1ea8c2e7d3ee7060f411f1b8119f0d6be1c85))
* fixed encoding "undefined" string in url ([19f6dbf](https://github.com/bitcoinsearch/chat-btc/commit/19f6dbfa52bf00b3f07fb38d63a1d55b1b52e5af))
* handle catch error ([3622004](https://github.com/bitcoinsearch/chat-btc/commit/3622004ca4ddffb95e5d741060d005fe4c01540a))
* include holocat in author query of url params ([90de7de](https://github.com/bitcoinsearch/chat-btc/commit/90de7dedcabef948d46f486dc9c05c8b7e79acf6))
* local storage set ([c4ed581](https://github.com/bitcoinsearch/chat-btc/commit/c4ed5813338cd42eb56504c95e0b440f43d09687))
* mobile responsive ([bab1798](https://github.com/bitcoinsearch/chat-btc/commit/bab1798d7f73f2d67251f05fe1549f45a41cb670))
* moved stop generating button below chat container ([9405a3c](https://github.com/bitcoinsearch/chat-btc/commit/9405a3ca9d15de914ace08b47119fb7d32faf596))
* one CTA ([ebd12ef](https://github.com/bitcoinsearch/chat-btc/commit/ebd12ef48ea756c0ebdb230f15a9fba935c9491e))
* overwrite banner flex ([a1ed2ce](https://github.com/bitcoinsearch/chat-btc/commit/a1ed2ceae9d0fb555880d20f242a155f6dd7a24f))
* prevent error leak to chat ([36681a5](https://github.com/bitcoinsearch/chat-btc/commit/36681a5d73eb7650dfbb1cf13e375c6a4ade30c4))
* prevent invalid answers upload ([01fe1d1](https://github.com/bitcoinsearch/chat-btc/commit/01fe1d1e6deb741b41cb6fbde55f19dc134de9f9))
* remove analyzer from author search ([#20](https://github.com/bitcoinsearch/chat-btc/issues/20)) ([0269718](https://github.com/bitcoinsearch/chat-btc/commit/0269718c2aa9b336d45aa567226fb3ce7664153b))
* remove logs ([f9b2fef](https://github.com/bitcoinsearch/chat-btc/commit/f9b2fef6a70aa01d550fcd38bcfc38bcb40bc867))
* single prompt command ([bbd613f](https://github.com/bitcoinsearch/chat-btc/commit/bbd613f9294ea738bb66083e48eec856f37adae0))
* strict check error messages ([31ff815](https://github.com/bitcoinsearch/chat-btc/commit/31ff815367c0bbba1cb179ae6096779008110835))
* stuck button and infinite loading state ([cecaa11](https://github.com/bitcoinsearch/chat-btc/commit/cecaa11c5a5d7d267e28ee5673f2b918b8996ea1))
* update paywithwebln for auto payment ([0054fb4](https://github.com/bitcoinsearch/chat-btc/commit/0054fb418b9b4ad0a98b654f3dec200d53918737))
* use req url for fetch ([a63cc9d](https://github.com/bitcoinsearch/chat-btc/commit/a63cc9db1b3c10b32c96509871233d5069ce366a))


### Features

* abort on fetch and loading bug fix ([68d3733](https://github.com/bitcoinsearch/chat-btc/commit/68d373397aa67c9a9bd687e689f661f993ec5ead))
* add abort to client streamed cached answer ([075a953](https://github.com/bitcoinsearch/chat-btc/commit/075a9531f1c31c597bf88a119a330c50353c3028))
* add alby budget ([4fceb16](https://github.com/bitcoinsearch/chat-btc/commit/4fceb16366f07a570c19f159a44fbd4cc96a03bd))
* add follow up questions ([#63](https://github.com/bitcoinsearch/chat-btc/issues/63)) ([09bcf47](https://github.com/bitcoinsearch/chat-btc/commit/09bcf47d234286a7fa41339f5a22df25a807035d))
* add L402 middleware ([ea8a2d8](https://github.com/bitcoinsearch/chat-btc/commit/ea8a2d8f9ec258dfd2c798fb319203ebf928df2c))
* add pay per prompt v1 ([220406c](https://github.com/bitcoinsearch/chat-btc/commit/220406c30b4e1f84482a285934594b2fd0b8ece8))
* add scroll behaviour ([9a835b3](https://github.com/bitcoinsearch/chat-btc/commit/9a835b3e7264489b0ba34ccc42b3bee26901b731))
* add semantic-release automation ([#98](https://github.com/bitcoinsearch/chat-btc/issues/98)) ([314719b](https://github.com/bitcoinsearch/chat-btc/commit/314719bded7fb72ad935de9b30e11bf155c0eaaa))
* added queuer banner ([04dfa2d](https://github.com/bitcoinsearch/chat-btc/commit/04dfa2d868bf83217a63dc10bcde759349597b54))
* author config and layout ([0102c1a](https://github.com/bitcoinsearch/chat-btc/commit/0102c1a06827aa3d50868ded87cf67b716315abc))
* author images ([52ab161](https://github.com/bitcoinsearch/chat-btc/commit/52ab1615555122169f4eede83399351126c1a6e1))
* base autopay implementation ([6dc423e](https://github.com/bitcoinsearch/chat-btc/commit/6dc423e42eb2c6634a58ff6540d1da8e42852d04))
* base client stream abort ([c810042](https://github.com/bitcoinsearch/chat-btc/commit/c810042e1cf0e2d340f6bed94efc9d301e1ed9f0))
* base logic to stope generation ([7b503e3](https://github.com/bitcoinsearch/chat-btc/commit/7b503e3f050ece118931d35c4cda0355927fe554))
* dynamic homepage determined by author query ([5208d7e](https://github.com/bitcoinsearch/chat-btc/commit/5208d7ea3f0eb513004516799848a53bc5db2013))
* hijack and return scroll also disable chat on streamloading ([d25cab9](https://github.com/bitcoinsearch/chat-btc/commit/d25cab98aba14042d6c68a8dc8b759e404766273))
* home components ([daabbb2](https://github.com/bitcoinsearch/chat-btc/commit/daabbb2a91d7f030e64de011ab0c9075236cd9ad))
* info dialog and 1 freebie before payment ([cc1ca96](https://github.com/bitcoinsearch/chat-btc/commit/cc1ca9683347814f7e5aee4364080149313a5990))
* layout with navbar ([4e5a86d](https://github.com/bitcoinsearch/chat-btc/commit/4e5a86d8e1c573cafe46ed40a1e0e065f002e383))
* link to schat screen from author ([58787db](https://github.com/bitcoinsearch/chat-btc/commit/58787db1ef1c44e7bf722d496e69e3e67b3a352c))
* prevent input while generating answer ([0b06133](https://github.com/bitcoinsearch/chat-btc/commit/0b06133e01f259bfff6ebb5189c8e24e74f1f22c))
* prevent paywithwebln on mobile and refactor tiercard ([1a3a0a8](https://github.com/bitcoinsearch/chat-btc/commit/1a3a0a85726731ab51981017e05809702de508a9))
* reset abortref and clear messages on abort ([3770248](https://github.com/bitcoinsearch/chat-btc/commit/377024809dbd739fc4f88e11048a2aeae1190a7d))
* rm scrolling, sync top nav to scroll ([b175c8e](https://github.com/bitcoinsearch/chat-btc/commit/b175c8e0a2f0a17946d5e9501204e193a44f115d))
* separate chat screen ([66161f5](https://github.com/bitcoinsearch/chat-btc/commit/66161f527a256d2e603659eef4cb7d7f4d26b6b8))
* slice results and add auth to server endpoint ([debdbba](https://github.com/bitcoinsearch/chat-btc/commit/debdbbafc199ebcadb3506c40e2deba65c0682b9))
* stop generating UI ([fffaf71](https://github.com/bitcoinsearch/chat-btc/commit/fffaf715fbf014194773b6acd934830d8cbe1d7d))
* streaming completed ([3757c18](https://github.com/bitcoinsearch/chat-btc/commit/3757c18de3d5ba60c50d5d844f31947c69a4fd84))
* update query hook ([1b81b98](https://github.com/bitcoinsearch/chat-btc/commit/1b81b98c68123fb7c40632dad9eb74943db3d2d9))
