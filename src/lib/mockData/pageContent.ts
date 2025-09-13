import { PageContentT } from "@/types/page";

export const pageContentMock = {
  id: "cotent-1",
  parentId: "collection-456",
  ownerId: "user-123",
  title: "Sample Page Title",
  blockSortIdList: [],
  blockList: [
    {
      id: "heading1-1",
      type: "heading1",
      text: "Paragraphs",
    },
    {
      id: "paragraph-2",
      type: "paragraph",
      text: '<span style="color:oklch(78.9% 0.154 211.53);font-weight:bold;font-style:italic;text-decoration-line:line-through;">uma String qualquer que será formatado no meu app notion clone usando a tag &lt;span&gt;&nbsp;</span>',
    },
    {
      id: "paragraph-3",
      type: "paragraph",
      text: '<span style="color:oklch(71.4% 0.203 305.504);border-bottom:0.05em solid;text-decoration-line:line-through;">This is a sample paragraph content. </span>',
    },
    {
      id: "heading2-1",
      type: "heading2",
      text: "Numbered List",
    },
    {
      id: "numberedlistitem-4",
      type: "numberedlistitem",
      text: '<span style="color:oklch(70.7% 0.165 254.624);">Sample Numbered List Item 3</span>',
    },
    {
      id: "numberedlistitem-1",
      type: "numberedlistitem",
      text: '<span style="color:oklch(71.4% 0.203 305.504);">Sample Numbered List Item 1</span>',
    },
    {
      id: "numberedlistitem-2",
      type: "numberedlistitem",
      text: '<span style="color:oklch(85.2% 0.199 91.936);">Sample Numbered List Item 2 </span>',
    },
    {
      id: "numberedlistitem-3",
      type: "numberedlistitem",
      text: '<span style="color:oklch(78.9% 0.154 211.53);">Sample Numbered List Item 4</span>',
    },
    {
      id: "heading3-1",
      type: "heading3",
      text: "Bullet And Check List",
    },
    {
      id: "checklistitem-1",
      type: "checklistitem",
      text: '<span style="background-color:oklch(47% 0.157 37.304);">Sample Check List Item 1</span>',
      checked: false,
    },
    {
      id: "bulletlistitem-1",
      type: "bulletlistitem",
      text: '<span style="background-color:oklch(45% 0.085 224.283);">Sample List Item 1</span>',
    },
    {
      id: "bulletlistitem-2",
      type: "bulletlistitem",
      text: '<span style="background-color:oklch(44.4% 0.177 26.899);">Sample List Item 2</span>',
    },
    {
      id: "bulletlistitem-3",
      type: "bulletlistitem",
      text: '<span style="background-color:oklch(44.8% 0.119 151.328)">Sample List Item</span>',
    },
    {
      id: "code-3",
      type: "code",
      content:
        '<span class="token keyword">export</span> <span class="token keyword">const</span> <span class="token function-variable function">compareStr</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">strA</span><span class="token operator">:</span> string<span class="token punctuation">,</span> <span class="token literal-property property">strB</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span>strA<span class="token punctuation">.</span>length <span class="token operator">!==</span> strB<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>\n\n  <span class="token keyword">const</span> <span class="token function-variable function">count</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">str</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> map <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> char <span class="token keyword">of</span> str<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      map<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>char<span class="token punctuation">,</span> <span class="token punctuation">(</span>map<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>char<span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">return</span> map<span class="token punctuation">;</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n  <span class="token keyword">const</span> mapA <span class="token operator">=</span> <span class="token function">count</span><span class="token punctuation">(</span>strA<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token keyword">const</span> mapB <span class="token operator">=</span> <span class="token function">count</span><span class="token punctuation">(</span>strB<span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n  <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token punctuation">[</span>char<span class="token punctuation">,</span> count<span class="token punctuation">]</span> <span class="token keyword">of</span> mapA<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span>mapB<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>char<span class="token punctuation">)</span> <span class="token operator">!==</span> count<span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>',
      language: "typescript",
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as PageContentT;
