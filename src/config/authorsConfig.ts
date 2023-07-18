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
    name: 'Matt Corallo Bot',
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
    name: "Andrew Chow Bot",
    title: "Bitcoin Core Maintainer",
    introduction: "Hi, I'm achow. I'm a Bitcoin Core maintainer and work on the Hardware Wallet Interface. My focus is on wallet functionality and interoperability between different wallet software.",
    slug: "achow",
    value: "Andrew Chow",
    imgURL: "/images/authors/andrew_chow.png",
    questions: [
      "What are Partially Signed Bitcoin Transactions used for?",
      "What are the advantages of descriptor wallets over legacy wallets?",
    ],
  },
  {
    name: "Greg Maxwell Bot",
    slug: "greg-maxwell",
    title: "Bitcoin Core Contributor",
    introduction: "Hello, I'm Greg. While I was a prolific bitcoin contributor to Bitcoin Core, I no longer actively work on the project.",
    value: "Greg Maxwell",
    imgURL: "/images/authors/greg_maxwell.png",
    questions: [
      "What benefits does Graftroot offer over Taproot?",
      "What is a Confidential Transaction?",
    ],
  },
];

export default authorsConfig;

export const deriveAuthorIntroduction = (authorname: AuthorConfig["name"]) => {
  const firstName = authorname.trim().split(" ")[0];
  return `Hi, I'm ${firstName}! What can I help with?`
}
