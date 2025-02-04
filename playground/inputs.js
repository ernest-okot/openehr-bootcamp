import template from "./web_template.json" assert { type: "json" };

/**
 *
 * @param {typeof template} t
 */
function createForm(t) {
  return t.tree.children
    .map((node) => {
      const [cardinality] = node.cardinalities || [];
      if (
        node.nodeId &&
        cardinality?.max > 0 &&
        (cardinality?.excludeFromWebTemplate === false || true)
      ) {
        return {
          type: node.rmType,
          id: node.id,
          title: node.localizedName,
          repeat: cardinality?.max > 1,
          content: node.children.map(extractFields).filter(Boolean),
        };
      }
    })
    .filter(Boolean);
}

/**
 *
 * @param {(typeof template)["tree"]["children"][number]} node
 */
function extractFields(node) {
  if (node.inContext) return;

  return {
    type: node.rmType,
    name: node.name,
    // ...(node.aqlPath ? { path: node.aqlPath } : {}),
    // ...(node.cardinalities ? { cardinality: node.cardinalities } : {}),
    ...(node.children
      ? {
          content: node.children.map(extractFields).filter(Boolean),
        }
      : {}),
    // ...(node.inputs ? { inputs: node.inputs } : {}),
  };
}

console.dir(createForm(template), { depth: null });
