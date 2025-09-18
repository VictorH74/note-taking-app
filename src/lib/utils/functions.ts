import {
  BLOCK_INPUT_CLASSNAME,
  FORMATTING_STYLE,
  FormattingT,
  INLINE_LINK_PREVIEW_CLASSNAME,
} from "./constants";
import sanitizeHtml from "sanitize-html";

export const hasExistingTextColorStyle = (styles: string) => {
  return styles.match(new RegExp(/(([^-])color|^color):[^;]*;/));
};
export const replaceTextColorStyle = (styles: string, colorStyle: string) => {
  return styles.replace(/(([^-])color|^color):[^;]*;/, "$2".concat(colorStyle));
};

export const hasExistingBgColorStyle = (styles: string) => {
  return styles.match(new RegExp(/background-color:[^;]*(;|)/));
};
export const replaceBgColorStyle = (styles: string, bgColorStyle: string) => {
  return styles.replaceAll(/background-color:[^;]*(;|)/g, bgColorStyle);
};

export const setInputUrlClickHandler = (inputEl: HTMLElement, href: string) => {
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  inputEl.blur();
  a.click();
};

export const sanitizeText = (text: string) => {
  return sanitizeHtml(text, {
    allowedTags: ["span", "br", "a", "img"],
    allowedAttributes: {
      span: ["style", "class", "id"],
      a: ["style", "class", "id", "href"],
      img: ["style", "class", "src", "alt"],
    },
    allowedStyles: {
      "*": {
        "font-weight": [/^(bold|normal|700|600)$/],
        "font-style": [/^(italic|normal|700|600)$/],
        color: [/^oklch\([0-9.% ,]*\)/],
        "background-color": [/^oklch\([0-9.% ,]*\)/],
        "text-decoration-line": [/[a-z-]*/],
        "text-decoration": [/[a-z-]*/],
        width: [/^([0-9]{1,4}px|[\d]{1,2}(.[\d]{1,2}|)(rem|em))$/],
        height: [/^([0-9]{1,4}px|[\d]{1,2}(.[\d]{1,2}|)(rem|em))$/],
        "border-bottom": [
          /^([0-9]{1,4}px|[\d]{1,2}(.[\d]{1,2}|)(rem|em)) [a-z]*$/,
        ],
        "border-radius": [/^#[0-9]{0-3}(px|rem|em)$/],
        "vertical-align": [
          /^(-|)([0-9]{1,4}px|[\d]{1,2}(.[\d]{1,2}|)(rem|em))$/,
        ],
        "margin-inline-end": [
          /^(-|)([0-9]{1,4}px|[\d]{1,2}(.[\d]{1,2}|)(rem|em))$/,
        ],
        display: [/^[a-z]*/],
      },
    },
  });
};

export const compareStr = (strA: string, strB: string) => {
  if (strA.length !== strB.length) return false;

  const count = (str: string) => {
    const map = new Map();
    for (const char of str) {
      map.set(char, (map.get(char) || 0) + 1);
    }
    return map;
  };

  const mapA = count(strA);
  const mapB = count(strB);

  for (const [char, count] of mapA) {
    if (mapB.get(char) !== count) return false;
  }

  return true;
};

export const getElementFirstBlockInput = (id: string) => {
  const element = document.getElementById(id);
  return element!.getElementsByClassName(BLOCK_INPUT_CLASSNAME).item(0);
};

export const applyFocus = (el: Element, at: "start" | "end" = "end") => {
  setTimeout(() => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();

    if (
      at == "end" &&
      el.childNodes.length > 0 &&
      !(el.childNodes.length == 1 && !el.childNodes.item(0).textContent)
    ) {
      range.setStartAfter(el.lastChild!);
      range.collapse(true);

      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    (el as HTMLElement).focus();
  }, 0);
};

export const applyFocusByIndex = (el: Element, offset: number) => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();

  if (el.childNodes.length > 0) {
    const data = getNodeFromIndex(el, offset);

    let targetNode: ChildNode;
    if (data) {
      targetNode = data.node;
      offset = data.offset;
    } else {
      targetNode = el.lastChild!;
      offset = el.lastChild!.textContent?.length || 0;
    }

    if (isInlineLinkPreviewNode(targetNode)) {
      range.setStartAfter(targetNode);
    } else {
      range.setStart(
        targetNode.nodeType == Node.ELEMENT_NODE
          ? targetNode.firstChild!
          : targetNode,
        offset
      );
    }

    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    return;
  }

  (el as HTMLElement).focus();
};

export const isInlineLinkPreviewNode = (node: Node) => {
  if (
    node.nodeType == Node.ELEMENT_NODE &&
    (node as HTMLElement).classList.contains(INLINE_LINK_PREVIEW_CLASSNAME)
  )
    return true;
  return false;
};

export const getNodeFromIndex = (elementNode: Node, offset: number) => {
  if (elementNode.childNodes.length > 0) {
    let targetNode: ChildNode | null = null;
    for (let i = 0; i < elementNode.childNodes.length; i++) {
      const node = elementNode.childNodes[i];
      const nodeTextLength = node.textContent?.length || 0;

      if (nodeTextLength >= offset) {
        targetNode = node;
        break;
      }
      offset -= nodeTextLength;
    }

    if (targetNode) return { node: targetNode, offset };
  }

  return null;
};

export const formatText = (text: string): string => {
  const boldStartRegex = new RegExp("/B#start/");
  const boldEndRegex = new RegExp("/B#end/");
  const italicStartRegex = new RegExp("/I#start/");
  const italicEndRegex = new RegExp("/I#end/");

  const formattingList: Set<FormattingT> = new Set();
  const formattedDataList: string[] = [];

  let tokenIndex = 0;

  text.split("&;").forEach((token) => {
    if (token.match(boldStartRegex)) formattingList.add("bold");
    if (token.match(italicStartRegex)) formattingList.add("italic");

    const cleanToken = token.replaceAll(/\/(B|I)#(start|end)\//g, "");

    if (cleanToken != "") {
      if (formattingList.size > 0) {
        // const formattedToken = formattingList.keys().reduce((acc, format) => {
        //   return formattingTag[format][0] + acc + formattingTag[format][1];
        // }, cleanToken);

        formattedDataList.push(
          `<span style="${Array.from(formattingList)
            .map((format) => FORMATTING_STYLE[format][0])
            .join("")}" data-token-index="${tokenIndex}">${cleanToken}</span>`
        );
      } else {
        formattedDataList.push(cleanToken);
      }
      tokenIndex++;
    }

    if (token.match(boldEndRegex)) formattingList.delete("bold");
    if (token.match(italicEndRegex)) formattingList.delete("italic");
  });

  return formattedDataList.join("");
};

export const getCaretIndex = (element: Element) => {
  const sel = window.getSelection();
  if (!sel) return -1;

  const range = sel.getRangeAt(0).cloneRange();
  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
};

export const isValidUrl = (input: string): string | null => {
  function hasValidHostname(hostname: string): boolean {
    // Verifica se é IP válido (IPv4 simples)
    const ipv4Pattern =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    if (ipv4Pattern.test(hostname)) return true;
    // Verifica se hostname tem pelo menos um ponto e um TLD válido (2+ letras)
    const domainPattern = /^([a-z\d-]+\.)+[a-z]{2,}$/i;
    return domainPattern.test(hostname);
  }
  try {
    const url = new URL(input);
    if (url.protocol === "http:" || url.protocol === "https:") {
      if (hasValidHostname(url.hostname)) {
        return url.href;
      }
      return null;
    }
    return null;
  } catch {
    // Tenta adicionar http:// e testar
    try {
      const url = new URL("http://" + input);
      if (hasValidHostname(url.hostname)) {
        return url.href;
      }
      return null;
    } catch {
      return null;
    }
  }
};
