'use strict'

// Copyright (C) 2023-2024  ANSSI
// SPDX-License-Identifier: MIT

import { api as apiPath } from '@params'

/**
 * Hackropole API client
 *
 * Handle API access and auth.
 * This code should never interact with browser DOM.
 */
export default class HackropoleApi {
  static apiUrl = `${apiPath}api/hackropole`

  static isLogged () {
    return 'auth' in window.localStorage
  }

  /**
   * Call API to get URL for authentication providers
   * @param {{redirect_uri: String}} params - The parameters needed to resolve the URL
   * @returns {Promise<{name: String, url: String}[]>} List of providers
   */
  static async authorize (params) {
    const response = await fetch(this.apiUrl + '/auth/authorize', {
      method: 'post',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params)
    })
    if (!response.ok) {
      throw Error('autorize failed')
    }

    const data = await response.json()
    return data
  }

  /**
   * Call API to login and return an access token
   *
   * This occurs after Github has redirected us and given a temporary code.
   * We need to send the code back to the API to get an AccessToken in exchange.
   *
   * @param {Object} params - The parameters returned by the provider and the provider name
   */
  static async login (params) {
    const response = await fetch(this.apiUrl + '/auth/authenticate', {
      method: 'post',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params)
    })
    if (!response.ok) {
      throw Error('login failed')
    }

    const data = await response.json()
    window.localStorage.setItem('auth', JSON.stringify(data))
  }

  /**
   * Call API to refresh the access token
   *
   * This occurs when the access token is expired.
   */
  static async refresh () {
    const auth = JSON.parse(window.localStorage.getItem('auth'))
    const response = await fetch(this.apiUrl + '/auth/refresh', {
      method: 'post',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(auth)
    })
    if (!response.ok) {
      throw Error('login failed')
    }

    const data = await response.json()
    window.localStorage.setItem('auth', JSON.stringify(data))

    return data
  }

  /**
   * Call API and handle login error
   * @param {string} ep - Endpoint URL
   * @param {Object} params - The parameters to pass to API
   * @param {boolean} hasData - Whether return data is expected
   * @returns {Promise<any>} The API call result
   */
  static async api (ep, params = {}, hasData = true) {
    const auth = JSON.parse(window.localStorage.getItem('auth'))
    const headers = new Headers({ 'Content-Type': 'application/json' })
    let response = await fetch(this.apiUrl + ep, {
      method: 'post',
      headers,
      body: JSON.stringify({
        ...auth,
        ...params
      })
    })
    if (response.status === 401) {
      const auth = await this.refresh()
      response = await fetch(this.apiUrl + ep, {
        method: 'post',
        headers,
        body: JSON.stringify({
          ...auth,
          ...params
        })
      })
    }
    if (!response.ok) {
      throw Error(`API returned ${response.status}`)
    }
    if (hasData) {
      const data = await response.json()
      return data
    }
  }

  /**
   * Call API to retrieve all user data
   * @returns {Promise<{
   *   name: String,
   *   solves: {challenge: String, date: String, flag: String}[],
   *   solutions_pending: {challenge: String, url: String, date: String}[],
   *   solutions_rejected: {challenge: String, url: String, date: String}[],
   *   solutions_accepted: {challenge: String, date: String, uuid: String}[],
   *   solution_votes: String[],
   *   challenge_votes: String[]
   * }>} User data
   */
  static async getSelfUserData () {
    return await this.api('/user/self')
  }

  /**
   * Call API to delete all user data
   */
  static async deleteUserData () {
    await this.api('/user/delete', {}, false)
  }

  /**
   * Call API to vote/unvote a challenge.
   * @param {String} challenge - Challenge identifier, e.g. "fcsc2019-crypto-2tp"
   * @returns {Promise<String[]>} List of currently voted challenges
   */
  static async voteChallenge (challenge) {
    return await this.api('/vote/challenge',
      {
        challenge
      })
  }

  /**
   * Call API to vote/unvote a writeup.
   * @param {String} solution - Write-up UUID
   * @returns {Promise<String[]>} List of currently voted write-ups
   */
  static async voteSolution (solution) {
    return await this.api('/vote/solution',
      {
        solution
      })
  }

  /**
   * Call API to flag a challenge.
   * @param {String} challenge - Challenge identifier, e.g. "fcsc2019-crypto-2tp"
   * @param {String} flag - Flag
   * @returns {Promise<{challenge: String, date: String, flag: String}[]>} List of flagged challenges
   */
  static async submission (challenge, flag) {
    return await this.api('/submit_flag',
      {
        challenge,
        flag
      })
  }

  /**
   * Call API to submit a new writeup for review.
   * @param {String} challenge - Challenge identifier, e.g. "fcsc2019-crypto-2tp"
   * @param {String} url - URL to the writeup
   * @returns {Promise<{challenge: String, url: String, date: String}[]>} List of submitted write-ups in pending state
   */
  static async submitWriteUp (challenge, url) {
    return await this.api('/submit_solution',
      {
        challenge,
        url
      })
  }
}
