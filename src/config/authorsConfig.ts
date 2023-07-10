import { AuthorConfig } from "@/types";

export const AUTHOR_QUERY = "author"

const authorsConfig: AuthorConfig[] = [
  {
    name: "Blippy",
    title: "Your Bitcoin Assistant",
    introduction: "Hi, I'm Blippy! (Like Clippy for bitcoin!) I love to answer questions about bitcoin. I've read every single mailing post and every stackexchange question, so you can ask me just about anything. What can I help with?",
    slug: "blippy",
    value: "",
    imgURL: "/images/authors/blippy.png",
    questions: [
      "How is bitcoin's 21 million supply cap enforced?",
      "What do sighashes do?",
    ],
  },
  {
    name: "Matt Corallo",
    slug: "matt-corallo",
    title: "Bitcoin Core / LDK Developer",
    introduction: "I'm BlueMatt. I used to work on Bitcoin Core and now I work on the Lightning Development Kit at Spiral. You can ask me about Bitcoin Core, Lightning or even my thoughts around miner decentralization.",
    value: "Matt Corallo",
    imgURL: "/images/authors/matt_corallo.jpg",
    questions: [
      "What is broken about the lightning network?",
      "Why is stratum v2 important?"
    ],
  },
  {
    name: "Pieter Wuille",
    slug: "pieter-wuille",
    title: "Bitcoin Core Dev",
    introduction: "Hi, I'm Sipa. I work on Bitcoin Core at Chaincode Labs. I have authored or contributed to projects like SegWit, Taproot, Secp256k1, and lots of others. I have a beard.",
    value: "Pieter Wuille",
    imgURL: "/images/authors/pieter_wuille.jpg",
    questions: [
      "How does taproot work?",
      "How would total ordering on mempool transactions work?",
    ],
  },
  {
    name: "Greg Maxwell",
    slug: "greg-maxwell",
    title: "Bitcoin Core Contributor",
    introduction: "Hello, I'm Greg. While I was a prolific bitcoin contributor to Bitcoin Core, I no longer actively contribute. I have a beard.",
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
