'use strict'
/* eslint-env browser */

// Copyright (C) 2023-2024  ANSSI
// SPDX-License-Identifier: MIT

import './lib/common.js'
import './lib/writeupVoteBtn.js'
import renderMathInElement from './vendor/katex/contrib/auto-render.mjs'

// Render LaTeX formula
document.addEventListener('DOMContentLoaded', function () {
  renderMathInElement(document.body, {
    delimiters: [
      // Parse $$tex$$ before $tex$ to not misidentify display equations
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ]
  })
})
