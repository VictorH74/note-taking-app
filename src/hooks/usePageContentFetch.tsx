import { PageContentT } from "@/types/page";
import React from "react";

export const usePageContentFetch = (pageId: string) => {
  const [pageContent, setPageContent] = React.useState<PageContentT | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // TODO: add abort controller to cancel fetch on unmount
    // const abortController = new AbortController();
    // const { signal } = abortController;

    const fetchPageContent = async () => {
      try {
        // TODO: Simulate fetching page content from an API or database
        // Replace this with actual fetch logic
        const data = {
          id: pageId,
          title: "Sample Page Title",
          blockList: [
            {
              id: "heading1-1",
              type: "heading1",
              text: "Sample 1 Heading",
            },
            {
              id: "heading2-1",
              type: "heading2",
              text: "Sample 2 Heading",
            },
            {
              id: "heading3-1",
              type: "heading3",
              text: "Sample 3 Heading",
            },
            {
              id: "paragraph-2",
              type: "paragraph",
              text: 'uma String <span style="font-weight:bold;">qualquer que será </span><span style="font-weight:bold;font-style:italic;">formatado no</span><span style="font-style:italic;"> meu app</span> notion <span style="font-style:italic;" data-token-index="5">clone usando a tag </span>&lt;span&gt;&nbsp;',
              // text: "uma String &;/B#start/qualquer que será /B#end/&;&;/B#start/&;/I#start/formatado no/I#end/&;/B#end/&;&;/I#start/ meu app/I#end/&; notion &;/I#start/clone/I#end/&; &;/B#start/&;/I#start/adicional/I#end/&;/B#end/&;",
            },
            {
              id: "paragraph-3",
              type: "paragraph",
              text: "This is a sample paragraph content. ",
            },
            {
              id: "numberedlistitem-4",
              type: "numberedlistitem",
              text: "Sample Numbered List Item 3",
            },
            {
              id: "bulletlistitem-1",
              type: "bulletlistitem",
              text: "Sample List Item 1",
            },
            {
              id: "checklistitem-1",
              type: "checklistitem",
              text: "Sample Check List Item 1",
              checked: true,
            },
            {
              id: "bulletlistitem-2",
              type: "bulletlistitem",
              text: 'Sample <span style="background-color:oklch(45.9% 0.187 3.815)">List</span> Item 2',
            },
            {
              id: "numberedlistitem-1",
              type: "numberedlistitem",
              text: "Sample Numbered List Item 1",
            },
            {
              id: "numberedlistitem-2",
              type: "numberedlistitem",
              text: "Sample Numbered List Item 2 ",
            },
            {
              id: "numberedlistitem-3",
              type: "numberedlistitem",
              text: "Sample Numbered List Item 4",
            },
            {
              id: "bulletlistitem-3",
              type: "bulletlistitem",
              text: "Sample List Item 3",
            },
            {
              id: "code-3",
              type: "code",
              content: `<span class="token keyword">export</span> <span class="token keyword">const</span> <span class="token function-variable function">compareStr</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">strA</span><span class="token operator">:</span> string<span class="token punctuation">,</span> <span class="token literal-property property">strB</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>strA<span class="token punctuation">.</span>length <span class="token operator">!==</span> strB<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">count</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">str</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> map <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> char <span class="token keyword">of</span> str<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      map<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>char<span class="token punctuation">,</span> <span class="token punctuation">(</span>map<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>char<span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> map<span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> mapA <span class="token operator">=</span> <span class="token function">count</span><span class="token punctuation">(</span>strA<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> mapB <span class="token operator">=</span> <span class="token function">count</span><span class="token punctuation">(</span>strB<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token punctuation">[</span>char<span class="token punctuation">,</span> count<span class="token punctuation">]</span> <span class="token keyword">of</span> mapA<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>mapB<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>char<span class="token punctuation">)</span> <span class="token operator">!==</span> count<span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>`,
              language: "typescript",
            },
          ],
        } as PageContentT;

        setPageContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();

    // return () => abortController.abort();
  }, [pageId]);

  return { pageContent, loading, error };
};
