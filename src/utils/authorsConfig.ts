export type AuthorConfig = {
  name: string;
  title: string;
  slug: string;
  value: string;
  imgURL: string;
  questions: string[];
};
const authorsConfig: AuthorConfig[] = [
  {
    name: "Blippy",
    title: "Your Bitcoin Assistant",
    slug: "blippy",
    value: "",
    imgURL: "",
    questions: [
      "How is bitcoin's 21 million supply cap enforced?",
      "What is bitcoin mining?",
    ],
  },
  {
    name: "Matt Corallo",
    slug: "matt-corallo",
    title: "Bitcoin Core / LDK Dev",
    value: "Matt Corallo",
    imgURL: "",
    questions: ["Why is lightning broken?", "How do mining pools work?"],
  },
  {
    name: "Pieter Wiulle",
    slug: "pieter-wiulle",
    title: "Bitcoin Core Dev",
    value: "Pieter Wiulle",
    imgURL: "",
    questions: [
      "How does taproot work?",
      "How would total ordering on mempool transactions work?",
    ],
  },
  {
    name: "Greg Maxwell",
    slug: "greg-maxwell",
    title: "Bitcoin Core Contributor",
    value: "Greg Maxwell",
    imgURL: "",
    questions: [
      "How does a sidechain two-way peg work?",
      "What is a Confidential Transaction?",
    ],
  },
];

export default authorsConfig;
