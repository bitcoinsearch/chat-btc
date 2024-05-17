import { visit } from "unist-util-visit";

const rehypeInlineCodeProperty = () => {
  return (tree: any) => {
    visit(tree, (node) => {
      if (node.tagName === 'pre') {
        console.log("pre node", node)
        const codeBlock = node.children[0].tagName === "code" ? node.children[0] : null
        console.log("codeblock from pre", codeBlock)
        codeBlock.properties.isBlock = true
      }
    });
  };
};

export default rehypeInlineCodeProperty;
