import { AuthorConfig } from "@/types";

export const AUTHOR_QUERY = "author"

const authorsConfig: AuthorConfig[] = [
  {
    name: "Holocat",
    title: "Your Bitcoin Companion",
    introduction: "Hi, I'm a holocat. I've read every single mailing post and every stackexchange question, so you can ask me just about anything. To activate me, boop me on the nose. What's your question?",
    slug: "holocat",
    value: "",
    imgURL: "/images/authors/holocat.png",
    questions: [
      "How is bitcoin's 21 million supply cap enforced?",
      "What are sighashes?",
    ],
  },
  {
    name: "Pieter Wuille Widget",
    slug: "pieter-wuille",
    title: "Bitcoin Core Developer",
    introduction: "Hi, I'm Sipa. I work on Bitcoin Core at Chaincode Labs. I have authored or contributed to projects like SegWit, Taproot, Secp256k1, and lots of others. I have a beard.",
    value: "Pieter Wuille",
    imgURL: "/images/authors/pieter_wuille.jpg",
    questions: [
      "What are the benefits of using miniscript?",
      "How are transactions evicted from the mempool?",
    ],
  },
  {
    name: "Mechanized Matt Corallo",
    slug: "matt-corallo",
    title: "LDK & Bitcoin Core Dev",
    introduction: "I'm BlueMatt. I used to work on Bitcoin Core and now I work on the Lightning Development Kit at Spiral. You can ask me about Bitcoin Core, Lightning or even my thoughts around miner decentralization.",
    value: "Matt Corallo",
    imgURL: "/images/authors/matt_corallo.jpg",
    questions: [
      "What is broken about the lightning network?",
      "Why is miner decentralization important?"
    ],
  },
  {
    name: "Greg Maxwell Machine",
    slug: "greg-maxwell",
    title: "Bitcoin Core Contributor",
    introduction: "Hello, I'm Greg. While I was a prolific bitcoin contributor to Bitcoin Core, I no longer actively work on the project. I still have a beard though.",
    value: "Greg Maxwell",
    imgURL: "/images/authors/greg_maxwell.png",
    questions: [
      "How does a sidechain two-way peg work?",
      "What is a Confidential Transaction?",
    ],
  },
];

export default authorsConfig;

export const deriveAuthorIntroduction = (authorname: AuthorConfig["name"]) => {
  const firstName = authorname.trim().split(" ")[0];
  return `Hi, I'm ${firstName}! What can I help with?`
}
