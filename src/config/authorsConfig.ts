import { AuthorConfig } from "@/types";

export const AUTHOR_QUERY = "author"

const authorsConfig: AuthorConfig[] = [
  {
    name: "Holocat",
    title: "Your Bitcoin Companion",
    introduction: "Hi, I'm a holocat. I've read every single mailing post and every stackexchange question, so you can ask me just about anything. To activate me, boop me on the nose. What's your question?",
    slug: "holocat",
    value: "",
    imgURL: "/images/authors/holocat.jpg",
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
    name: "Andreas Antonopoulos Bot",
    title: "Speaker & Educator",
    introduction: "Hi, I'm Andreas. I've been giving talks about bitcoin long before anyone was ready to listen.",
    slug: "andreas-antonopoulos",
    value: "Andreas Antonopoulos",
    imgURL: "/images/authors/andreas_antonopoulos.jpg",
    questions: [
      "What are the advantages of Schnorr signatures over ECDSA?",
      "Is is seed splitting a good idea?",
    ],
  },
  {
    name: "Greg Maxwell Bot",
    slug: "greg-maxwell",
    title: "Bitcoin Core Contributor",
    introduction: "Hello, I'm Greg. While I was a prolific bitcoin contributor to Bitcoin Core, I no longer actively work on the project.",
    value: "Greg Maxwell",
    imgURL: "/images/authors/greg_maxwell.jpg",
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
