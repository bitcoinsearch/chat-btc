export const responseData = `Pay-to-Taproot (P2TR) is a type of ScriptPubKey that locks Bitcoin to a script, which can then be unlocked by either a public key or a Merkelized Alternative Script Tree (MAST). This allows for multiple ways to spend the Bitcoin. Essentially, a P2TR output initially locks Bitcoin to a single Schnorr public key, referred to as Q. However, this public key Q is actually an aggregate of a public key P and another public key M, which is derived from the Merkle root of a list of other ScriptPubKeys [0].

Bitcoin in a P2TR output can be spent in two main ways:

1. **Key Path**: By publishing a signature corresponding to public key P.
2. **Script Path**: By satisfying one of the scripts contained in the Merkle tree.

This dual functionality combines the features of Pay-to-Script-Hash (P2SH) and Pay-to-Public-Key (P2PK) scripts, allowing the owner more flexibility in choosing how to spend their funds. One of the significant advantages of P2TR is its enhancement of user privacy. Only the method used to spend the P2TR output needs to be revealed, while unused alternatives remain private. This undermines many chain analysis heuristics, making all P2TR outputs appear similar and preserving user anonymity [0][4].

Moreover, thanks to Schnorr key aggregation, the public key P can represent a multisig setup without disclosing whether it is indeed a multisig key or a single key. This further adds to the privacy benefits and makes P2TR outputs indistinguishable from each other on the blockchain [0].

--{{ What are the primary benefits of using Pay-to-Taproot (P2TR)? }}--

--{{ How does Pay-to-Taproot (P2TR) enhance user privacy? }}--

--{{ What is the significance of Schnorr key aggregation in P2TR? }}--

--{{ How does Taproot improve scalability and privacy for complex transactions? }}--

[0]: https://river.com/learn/terms/p/pay-to-taproot-p2tr/
[1]: https://bitcoin.stackexchange.com/questions/96025#96567
[2]: https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-October/016461.html
[3]: https://bitcoinops.org/en/topics/client-side-validation
[4]: https://bitcoin.stackexchange.com/questions/106445#106449
[5]: https://bitcointalk.org/index.php?topic=5265696.msg54904056#msg54904056`;

export const responseDataBody = `Pay-to-Taproot (P2TR) is a type of ScriptPubKey that locks Bitcoin to a script, which can then be unlocked by either a public key or a Merkelized Alternative Script Tree (MAST). This allows for multiple ways to spend the Bitcoin. Essentially, a P2TR output initially locks Bitcoin to a single Schnorr public key, referred to as Q. However, this public key Q is actually an aggregate of a public key P and another public key M, which is derived from the Merkle root of a list of other ScriptPubKeys [0].

Bitcoin in a P2TR output can be spent in two main ways:

1. **Key Path**: By publishing a signature corresponding to public key P.
2. **Script Path**: By satisfying one of the scripts contained in the Merkle tree.

This dual functionality combines the features of Pay-to-Script-Hash (P2SH) and Pay-to-Public-Key (P2PK) scripts, allowing the owner more flexibility in choosing how to spend their funds. One of the significant advantages of P2TR is its enhancement of user privacy. Only the method used to spend the P2TR output needs to be revealed, while unused alternatives remain private. This undermines many chain analysis heuristics, making all P2TR outputs appear similar and preserving user anonymity [0][4].

Moreover, thanks to Schnorr key aggregation, the public key P can represent a multisig setup without disclosing whether it is indeed a multisig key or a single key. This further adds to the privacy benefits and makes P2TR outputs indistinguishable from each other on the blockchain [0].`

export const responseDataFUQ = `--{{ What are the primary benefits of using Pay-to-Taproot (P2TR)? }}--

--{{ How does Pay-to-Taproot (P2TR) enhance user privacy? }}--

--{{ What is the significance of Schnorr key aggregation in P2TR? }}--

--{{ How does Taproot improve scalability and privacy for complex transactions? }}--`

export const responseDataLinks = `[0]: https://river.com/learn/terms/p/pay-to-taproot-p2tr/
[1]: https://bitcoin.stackexchange.com/questions/96025#96567
[2]: https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-October/016461.html
[3]: https://bitcoinops.org/en/topics/client-side-validation
[4]: https://bitcoin.stackexchange.com/questions/106445#106449
[5]: https://bitcointalk.org/index.php?topic=5265696.msg54904056#msg54904056`