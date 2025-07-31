import { FORMATTING_STYLE, FormattingT } from "./constants";
import sanitizeHtml from "sanitize-html";

export const hasExistingBgColorStyle = (styles: string) => {
  return styles.match(new RegExp(/background-color:[^;]*(;|)/));
};
export const hasExistingTextColorStyle = (styles: string) => {
  return styles.match(new RegExp(/(^color:[^;]*(;|)|[^-]color:[^;]*)/));
};
export const replaceBgColorStyle = (styles: string, bgColorStyle: string) => {
  return styles.replaceAll(/background-color:[^;]*(;|)/g, bgColorStyle);
};
export const replaceTextColorStyle = (styles: string, colorStyle: string) => {
  return styles.replaceAll(/(^color:[^;]*(;|)|[^-]color:[^;]*)/g, colorStyle);
};

export const sanitizeText = (text: string) => {
  return sanitizeHtml(text, {
    allowedTags: ["span", "br"],
    allowedAttributes: {
      span: ["style", "class", "id"],
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

export const applyFocus = (id: string, at: "start" | "end" = "end") => {
  setTimeout(() => {
    const element = document.getElementById(id);
    const range = document.createRange();
    const selection = window.getSelection();

    if (!element || !selection) return;

    const el = element.getElementsByClassName("block-input").item(0);
    if (!el) return;

    if (el.childNodes.length > 0) {
      const caretPosData: Record<
        typeof at,
        { child: ChildNode; offset: number }
      > = {
        start: {
          child: el.firstChild!,
          offset: 0,
        },
        end: {
          child: el.lastChild!,
          offset: el.lastChild!.textContent?.length || 0,
        },
      };
      const { child, offset } = caretPosData[at];

      range.setStart(child, offset);
      range.collapse(true);

      selection.removeAllRanges();
      selection.addRange(range);

      return;
    }

    (el as HTMLElement).focus();
  }, 0);
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

// "//italic#start//clone//italic#end//"

// uma String <b>qualquer que será </b><i><b>formatado no</b></i><i> meu app</i> notion <i>clone</i> <i><b>adicional</b></i>
