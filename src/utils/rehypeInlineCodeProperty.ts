import { visit } from "unist-util-visit";

const rehypeInlineCodeProperty = () => {
  return (tree: any) => {
    visit(tree, (node) => {
      if (node.tagName === 'pre') {
        const codeBlock = node.children[0].tagName === "code" ? node.children[0] : null
        codeBlock.properties.isBlock = true
      }
    });
  };
};

export default rehypeInlineCodeProperty;
