// Copyright (C) 2023-2024  ANSSI
// SPDX-License-Identifier: MIT

/**
 * Sort table
 * @param {HTMLTableCellElement} headEl - <th> element clicked
 */
function sortTable (headEl) {
  // Ascending order by default, inverse on click
  const directionUp = !headEl.classList.contains('dir-u')
  headEl.parentNode.querySelectorAll('th').forEach((e) => e.classList.remove('dir-u', 'dir-d'))
  headEl.classList.add(directionUp ? 'dir-u' : 'dir-d')

  // Clone table and sort clone
  const tableBody = headEl.closest('table').tBodies[0]
  const rows = Array.from(tableBody.rows).slice(0)
  const cellId = Array.from(headEl.parentNode.children).indexOf(headEl)
  const getSortValue = (el) => (el.getAttribute('data-sort') || el.innerText)
  rows.sort((row1, row2) => {
    const val1 = getSortValue((directionUp ? row1 : row2).cells[cellId])
    const val2 = getSortValue((directionUp ? row2 : row1).cells[cellId])
    return isNaN(val1 - val2) ? val1.localeCompare(val2) : val1 - val2
  })

  // Replace with new table body
  const newTableBody = tableBody.cloneNode()
  while (rows.length) {
    newTableBody.appendChild(rows.splice(0, 1)[0])
  }
  tableBody.parentNode.replaceChild(newTableBody, tableBody)
}

window.addEventListener('load', () => {
  document.querySelectorAll('table[data-sortable] th').forEach((el) => {
    el.addEventListener('click', (e) => sortTable(e.currentTarget))
  })
})
