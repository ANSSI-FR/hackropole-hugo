# Hugo Hackropole theme

<!--
Copyright (C) 2023-2024  ANSSI
SPDX-License-Identifier: MIT
-->

A [Hugo](https://gohugo.io/) theme to host [Capture-The-Flag](https://en.wikipedia.org/wiki/Capture_the_flag_(cybersecurity)) (CTF) challenges as a static website.

You may test a demo of this theme on [Hackropole](https://hackropole.fr/) website.

**Features:**

  * Lightweight.
  * Secure (no server-side code required, hardened [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)).
  * Usable without JavaScript.
  * CSS based on Bootstrap 5 with automatic dark mode.
  * No NodeJS tools required to build.
  * Render write-ups Markdown with a GitHub/Gitlab-like style.

**Free software used:**

  * [Hugo](https://gohugo.io/) site generator
  * [Bootstrap 5](https://github.com/twbs/bootstrap/) stylesheets
  * [KaTeX](https://github.com/KaTeX/KaTeX/) engine (math formula rendering)
  * [Solarized](https://ethanschoonover.com/solarized/) color theme

## Quick start

To get started, you should copy the content of `./exampleSite/`.
Then, you should be able to use this theme as any other Hugo theme:
```
hugo new site my-ctf-website
cd my-ctf-website
git clone https://github.com/ANSSI-FR/hackropole-hugo.git themes/hackropole
rm hugo.toml && cp -r themes/hackropole/exampleSite/* .
hugo serve
```
