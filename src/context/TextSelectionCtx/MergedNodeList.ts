type MatchesAditionalT = {
  adicionalCondition?: boolean;
  aditionalAction?: () => void;
};

export class MergedNodeList {
  list: Node[] = [];

  constructor(list: Node[]) {
    this.list = list;
  }

  //   toHTMLStr() {}

  static Builder = class {
    #onBeforeMerging: ((clonedNode: Node, originalNode: Node) => Node) | null =
      null;
    #onMergingFail: ((clonedNode: Node) => void) | null = null;

    #nodes: NodeListOf<ChildNode> | null = null;
    #onMatchesAsElement: (
      prevNode: Node,
      clonedNode: Node
    ) => MatchesAditionalT = () => ({
      adicionalCondition: true,
      aditionalAction: () => {},
    });
    #onMatchesAsText: (prevNode: Node, clonedNode: Node) => MatchesAditionalT =
      () => ({
        adicionalCondition: true,
        aditionalAction: () => {},
      });

    constructor(nodes: NodeListOf<ChildNode>) {
      this.#nodes = nodes;
    }

    onBeforeMerging(func: (clonedNode: Node, originalNode: Node) => Node) {
      this.#onBeforeMerging = func;
      return this;
    }

    onMatchesAsElement(
      func: (prevNode: Node, clonedNode: Node) => MatchesAditionalT
    ) {
      this.#onMatchesAsElement = func;
      return this;
    }

    onMatchesAsText(
      func: (prevNode: Node, clonedNode: Node) => MatchesAditionalT
    ) {
      this.#onMatchesAsText = func;
      return this;
    }

    onMergingFail(func: (clonedNode: Node) => void) {
      this.#onMergingFail = func;
      return this;
    }

    build() {
      const isElement = (node: Node) => node.nodeType == Node.ELEMENT_NODE;
      const isTextNode = (node: Node) => node.nodeType == Node.TEXT_NODE;
      const getTextNodeSerializedStr = (textNode: Node) =>
        new XMLSerializer().serializeToString(textNode);

      const mergeableNodeList: Node[] = [];

      this.#nodes!.forEach((node) => {
        let clonedNode = node.cloneNode(true);

        if (clonedNode.textContent == ``) return;

        if (this.#onBeforeMerging)
          clonedNode = this.#onBeforeMerging(clonedNode, node);

        if (mergeableNodeList.length > 0) {
          const prevNode = mergeableNodeList.at(-1)!;

          if (isElement(prevNode) && isElement(clonedNode)) {
            const { adicionalCondition, aditionalAction } =
              this.#onMatchesAsElement(prevNode, clonedNode);

            if (adicionalCondition || adicionalCondition == undefined) {
              (prevNode as HTMLElement).innerHTML += (
                clonedNode as HTMLElement
              ).innerHTML;
              if (aditionalAction != undefined) aditionalAction();
              return;
            }
          }

          if (isTextNode(prevNode) && isTextNode(clonedNode)) {
            const { adicionalCondition, aditionalAction } =
              this.#onMatchesAsText(prevNode, clonedNode);

            if (adicionalCondition || adicionalCondition == undefined) {
              prevNode.textContent += getTextNodeSerializedStr(clonedNode);
              if (aditionalAction != undefined) aditionalAction();
              return;
            }
          }
        }

        if (this.#onMergingFail) this.#onMergingFail(clonedNode);

        mergeableNodeList.push(clonedNode);
      });

      return new MergedNodeList(mergeableNodeList);
    }
  };
}
