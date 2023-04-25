"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[95],{5318:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>g});var a=n(7378);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(n),d=r,g=u["".concat(s,".").concat(d)]||u[d]||m[d]||o;return n?a.createElement(g,i(i({ref:t},c),{},{components:n})):a.createElement(g,i({ref:t},c))}));function g(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:r,i[1]=l;for(var p=2;p<o;p++)i[p]=n[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},8350:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>m,frontMatter:()=>o,metadata:()=>l,toc:()=>p});var a=n(5773),r=(n(7378),n(5318));const o={},i="Built-in Message types",l={unversionedId:"react/messages",id:"react/messages",title:"Built-in Message types",description:"To add your own messages, follow the customization guide.",source:"@site/docs/react/messages.md",sourceDirName:"react",slug:"/react/messages",permalink:"/react/messages",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Built-in Actions in React",permalink:"/react/actions"}},s={},p=[{value:"<code>text</code>",id:"text",level:2},{value:"<code>embed</code>",id:"embed",level:2},{value:"<code>image</code>",id:"image",level:2},{value:"<code>links</code>",id:"links",level:2}],c={toc:p},u="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"built-in-message-types"},"Built-in Message types"),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"To add your own messages, follow the ",(0,r.kt)("a",{parentName:"p",href:"/react/custom"},"customization guide"),".")),(0,r.kt)("p",null,"Currently, React package of BotUI supports the following ",(0,r.kt)("inlineCode",{parentName:"p"},"messageType"),"s:"),(0,r.kt)("h2",{id:"text"},(0,r.kt)("inlineCode",{parentName:"h2"},"text")),(0,r.kt)("p",null,"Default type: Shows the text using the ",(0,r.kt)("inlineCode",{parentName:"p"},"data.text")," property:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"botui.message.add({ text: 'hello, what is your name?' })\n")),(0,r.kt)("h2",{id:"embed"},(0,r.kt)("inlineCode",{parentName:"h2"},"embed")),(0,r.kt)("p",null,"Shows an ",(0,r.kt)("inlineCode",{parentName:"p"},"<iframe>")," using the ",(0,r.kt)("inlineCode",{parentName:"p"},"data.src"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"botui.message.add({ src: 'the url' }, { messageType: 'embed' })\n")),(0,r.kt)("h2",{id:"image"},(0,r.kt)("inlineCode",{parentName:"h2"},"image")),(0,r.kt)("p",null,"Shows an ",(0,r.kt)("inlineCode",{parentName:"p"},"<img>")," using the ",(0,r.kt)("inlineCode",{parentName:"p"},"data.src"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"botui.message.add({ src: 'the url' }, { messageType: 'image' })\n")),(0,r.kt)("p",null,"For both the ",(0,r.kt)("inlineCode",{parentName:"p"},"image")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"embed"),", you can pass additional properties in the ",(0,r.kt)("inlineCode",{parentName:"p"},"data")," to have them added as attributes to the respective tag. For example, you can add an ",(0,r.kt)("inlineCode",{parentName:"p"},"alt")," attribute to the ",(0,r.kt)("inlineCode",{parentName:"p"},"img")," tag as:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"botui.message.add(\n  { src: 'the url', alt: 'some text for alt' },\n  { messageType: 'image' }\n)\n")),(0,r.kt)("h2",{id:"links"},(0,r.kt)("inlineCode",{parentName:"h2"},"links")),(0,r.kt)("p",null,"Shows a list of ",(0,r.kt)("inlineCode",{parentName:"p"},"<a>")," tags:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"botui.message.add(\n  {\n    links: [\n      {\n        text: 'the url',\n        href: 'https://example.com',\n        /* any other <a> tag attributes you want to add. e.g:\n  target: 'blank'\n   */\n      },\n      {\n        text: 'another url',\n        href: 'https://example.com',\n      },\n    ],\n  },\n  { messageType: 'links' }\n)\n")))}m.isMDXComponent=!0}}]);