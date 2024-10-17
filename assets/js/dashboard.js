'use strict'
/* eslint-env browser */

// Copyright (C) 2023-2024  ANSSI
// SPDX-License-Identifier: MIT

import './lib/sortable.js'
import './lib/common.js'
import './lib/challengeVoteBtn.js'
import './lib/writeupVoteBtn.js'
import Modal from './vendor/bootstrap/modal.js'
import Toast from './vendor/bootstrap/toast.js'
import * as params from '@params'
import HackropoleApi from './lib/api.js'

/**
 * Update flags and solutions status from local storage state
 */
function refreshFlags () {
  /** @type {{challenge: String, date: String, flag: String}[]} */
  const flags = JSON.parse(window.localStorage.getItem('flags'))
  const challengesFlagged = flags.map((f) => f.challenge)
  document.querySelectorAll('#flags-table tr[data-challenge]').forEach((el) => {
    if (challengesFlagged.includes(el.dataset.challenge)) {
      el.classList.remove('d-none')
      el.firstElementChild.dataset.sort = -challengesFlagged.indexOf(el.dataset.challenge)
    } else {
      el.remove()
    }
  })

  // Show flags status badges
  flags.forEach((flag) => {
    document.querySelectorAll(`[data-challenge="${flag.challenge}"] .badge-flag`).forEach((el) => {
      const d = new Date(flag.date)
      el.textContent = d.toLocaleDateString('fr-CA') + ', ' + d.toLocaleTimeString('en-GB')
      el.classList.remove('invisible')
      el.closest('td').setAttribute('data-sort', flag.date)
    })
  })

  // Show write-ups status
  const categories = ['pending', 'rejected', 'accepted']
  categories.forEach((cat) => {
    /** @type {{challenge: String}[]} */
    const solutions = JSON.parse(window.localStorage.getItem('solutions_' + cat))
    solutions.forEach((solution) => {
      // Show solutions status
      document.querySelectorAll(`[data-challenge="${solution.challenge}"] .badge-solution`).forEach((el) => {
        switch (cat) {
          case 'accepted':
            el.querySelector('.text-bg-success').classList.remove('d-none')
            el.closest('td').setAttribute('data-sort', '3')
            break
          case 'pending':
            el.querySelector('.text-bg-warning').classList.remove('d-none')
            el.closest('td').setAttribute('data-sort', '2')
            break
          case 'rejected':
            el.querySelector('.text-bg-danger').classList.remove('d-none')
            el.closest('td').setAttribute('data-sort', '1')
            break
        }
      })
    })
  })

  // Trigger sortable
  document.querySelector('#flags-table thead tr th').click()
}

/**
 * Update votes status from local storage state
 */
function refreshVotes () {
  /** @type {String[]} */
  const challengesVotes = JSON.parse(window.localStorage.getItem('challenge_votes'))
  if (challengesVotes.length) {
    document.getElementById('section-votes-challenges').classList.remove('d-none')
    document.querySelectorAll('#votes-challenges tr[data-challenge]').forEach((el) => {
      if (challengesVotes.includes(el.dataset.challenge)) {
        el.classList.remove('d-none')
      } else {
        el.remove()
      }
    })
  }

  /** @type {String[]} */
  const solutionsVotes = JSON.parse(window.localStorage.getItem('solution_votes'))
  if (solutionsVotes.length) {
    document.getElementById('section-votes-solutions').classList.remove('d-none')
    document.querySelectorAll('#votes-solutions tr[data-solution]').forEach((el) => {
      if (solutionsVotes.includes(el.dataset.solution)) {
        el.classList.remove('d-none')
      } else {
        el.remove()
      }
    })
  }
}

window.addEventListener('load', () => {
  document.getElementById('refresh').addEventListener('click', (event) => {
    event.preventDefault()
    if (HackropoleApi.isLogged()) {
      HackropoleApi.getSelfUserData().then((userData) => {
        window.localStorage.setItem('username', userData.name)
        window.localStorage.setItem('flags', JSON.stringify(userData.solves))
        window.localStorage.setItem('solutions_pending', JSON.stringify(userData.solutions_pending))
        window.localStorage.setItem('solutions_rejected', JSON.stringify(userData.solutions_rejected))
        window.localStorage.setItem('solutions_accepted', JSON.stringify(userData.solutions_accepted))
        window.localStorage.setItem('challenge_votes', JSON.stringify(userData.challenge_votes))
        window.localStorage.setItem('solution_votes', JSON.stringify(userData.solution_votes))
        document.location.reload()
      }).catch(() => {
        const toast = new Toast(document.getElementById('toast-api-error'))
        toast.show()
      })
    }
  })

  document.getElementById('download-data').addEventListener('click', (event) => {
    event.preventDefault()
    if (HackropoleApi.isLogged()) {
      HackropoleApi.getSelfUserData().then((userData) => {
        const encodedJson = new TextEncoder().encode(JSON.stringify(userData))
        const blob = new Blob([encodedJson], { type: 'application/json;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.classList.add('d-none')
        a.href = url
        a.download = 'hackropole.json'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }).catch(() => {
        const toast = new Toast(document.getElementById('toast-api-error'))
        toast.show()
      })
    }
  })

  const modal = new Modal('#modal-delete', {})
  document.getElementById('delete').addEventListener('click', (event) => {
    event.preventDefault()
    modal.show()
  })

  document.getElementById('delete-confirm').addEventListener('click', () => {
    modal.hide()
    HackropoleApi.deleteUserData().then(() => HackropoleApi.logout()).catch(() => {
      const toast = new Toast(document.getElementById('toast-api-error'))
      toast.show()
    })
  })

  if (HackropoleApi.isLogged()) {
    const username = window.localStorage.getItem('username')
    document.getElementById('username-title').textContent = username
    refreshFlags()
    refreshVotes()
  } else {
    // User should be logged in to access dashboard
    document.location = params.home_url
  }
})
