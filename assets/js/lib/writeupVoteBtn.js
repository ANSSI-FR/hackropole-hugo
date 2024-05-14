'use strict'
/* eslint-env browser */

// Copyright (C) 2023-2024  ANSSI
// SPDX-License-Identifier: MIT

import Toast from '../vendor/bootstrap/toast.js'
import HackropoleApi from './api.js'

/**
 * Update write-up vote buttons status from local storage state
 */
function refreshWriteUpVote () {
  /** @type {String[]} */
  let votes = []
  if (HackropoleApi.isLogged()) {
    votes = JSON.parse(window.localStorage.getItem('solution_votes'))
  }
  document.querySelectorAll('a.writeup-vote-btn').forEach((el) => {
    if (!(el instanceof HTMLAnchorElement)) {
      return
    }
    const active = votes.includes(el.dataset.writeup)
    el.classList.toggle('text-opacity-25', !active)
    el.setAttribute('title', active ? el.dataset.titleActive : el.dataset.titleInactive)
    if (el.parentElement instanceof HTMLTableCellElement) {
      el.parentElement.setAttribute('data-sort', active ? '1' : '0')
    }
  })
}

window.addEventListener('load', () => {
  refreshWriteUpVote()

  // On write-up vote button click, toggle vote
  document.querySelectorAll('a.writeup-vote-btn').forEach((el) => {
    if (!(el instanceof HTMLAnchorElement)) {
      return
    }
    el.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopImmediatePropagation()
      if (HackropoleApi.isLogged()) {
        const writeup = el.dataset.writeup
        HackropoleApi.voteSolution(writeup).then((d) => {
          window.localStorage.setItem('solution_votes', JSON.stringify(d || []))
          refreshWriteUpVote()
        }).catch(() => {
          const toast = new Toast(document.getElementById('toast-api-error'))
          toast.show()
        })
      } else {
        const toast = new Toast(document.getElementById('toast-api-need-login'))
        toast.show()
      }
    })
  })
})
