export const tabGroupColors = {
  grey: "#dadce0",
  blue: "#8ab4f8",
  red: "#f28b82",
  yellow: "#fdd663",
  green: "#81c995",
  pink: "#ff8bcb",
  purple: "#c58af9",
  cyan: "#78d9ec",
  orange: "#fcad70",
}

export class ColorButton extends HTMLElement {
  /** 
   * This component lets the user select which "tabGroup" color they want (there's only 9 available)
   * https://developer.chrome.com/docs/extensions/reference/tabGroups/#type-Color
   * 
   * I ended up not using this component, because I thought tabGroups were too distracting 
   */

  constructor() {
    super()
    this.attachShadow({ mode: "open", delegatesFocus: true })
    this.shadowRoot.innerHTML = `${this.css}${this.html}`

    // grab elements
    this.colorBtn = this.shadowRoot.querySelector('#color-btn')
    this.colorGrid = this.shadowRoot.querySelector('.color-grid')
    this.colorGridCells = this.shadowRoot.querySelectorAll('.color-grid button')

    // other stuff
    this.gridOpen = false
    this.setAttribute('color', 'grey')
  }

  get css() {
    return /*html*/`
      <style>
        #color-btn {
          display: grid;
          justify-content: center;
          align-content: center;

          cursor: pointer;
          background-color: #dadce0;

          width: 1.3em;
          height: 1.3em;

          border-radius: 2em;
          position: relative;

          transition: background-color 0.3s;
        }

        .color-grid {
          display: inline-grid;
          grid-template: repeat(3, 1fr) / repeat(3, 1fr);

          position: relative;
          z-index: 100;

          transform: scale(0);
          transition: transform 0.3s;
        }

        .color-grid button {
          cursor: pointer;
          height: 2.5em;
          width: 2.5em;
          border: none;
        } 

        .reveal {
          transform: scale(1);
          transition: all 0.3s;
        }
      </style>
    `
  }

  get html() {
    // You can't nest a <button> in a <button>, so I had to use a div instead.
    return /*html*/`
    <div class="container" style="display: flex; align-items: center; height: 100%;">
      <div 
        id="color-btn" 
        tabindex="0" 
        role="button" 
        aria-haspopup="true" 
        aria-expanded="${this.gridOpen}"
        aria-label="Pick the color for your new session"
      >
        <div class="color-grid" aria-labelledby="color-btn">
          <button style="background-color: #dadce0; border-top-left-radius: 5px" tabindex="-1" aria-label="grey"></button>
          <button style="background-color: #8ab4f8;" tabindex="-1" aria-label="blue"></button> 
          <button style="background-color: #f28b82; border-top-right-radius: 5px;" data-color="red" tabindex="-1" aria-label="red"></button>
          <button style="background-color: #fdd663;" tabindex="-1" aria-label="yellow"></button>
          <button style="background-color: #81c995;" tabindex="-1" aria-label="green"></button>
          <button style="background-color: #ff8bcb;" tabindex="-1" aria-label="pink"></button>
          <button style="background-color: #c58af9; border-bottom-left-radius: 5px;" tabindex="-1" aria-label="purple"></button>
          <button style="background-color: #78d9ec;" tabindex="-1" aria-label="cyan"></button>
          <button style="background-color: #fcad70; border-bottom-right-radius: 5px;" tabindex="-1" aria-label="orange"></button>
        </div>
      </div>
    </div>
    `
  }

  connectedCallback() {
    this.colorBtn.addEventListener('click', this.toggleGrid)
    this.colorBtn.addEventListener('keydown', this.toggleGridViaKeydown)
    this.colorGrid.addEventListener('click', this.selectColor)
    this.colorGrid.addEventListener('keydown', this.selectColorViaKeydown)
  }

  disconnectedCallback() {
    this.colorBtn.removeEventListener('click', this.toggleGrid)
    this.colorBtn.removeEventListener('keydown', this.toggleGridViaKeydown)
    this.colorGrid.removeEventListener('click', this.selectColor)
    this.colorGrid.removeEventListener('keydown', this.selectColorViaKeydown)
  }

  toggleGrid = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.colorGrid.classList.toggle('reveal')

    const gridCells = this.colorGridCells
    const firstGridCell = gridCells[0]

    // if the grid is open
    if (firstGridCell.getAttribute('tabindex') === "0") {
      document.removeEventListener('click', this.toggleGrid)
      document.removeEventListener('keydown', this.toggleGridViaEscape)

      gridCells.forEach((cell) => { cell.setAttribute('tabindex', '-1') })
      // @ts-ignore
      this.colorBtn.focus()
      this.gridOpen = false
    } else {
      gridCells.forEach((cell) => { cell.setAttribute('tabindex', '0') })
      document.addEventListener('click', this.toggleGrid)
      document.addEventListener('keydown', this.toggleGridViaEscape)
      this.gridOpen = true
    }
  }

  toggleGridViaKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') this.toggleGrid(event)
  }

  toggleGridViaEscape = (event) => {
    if (event.key === "Escape") this.toggleGrid(event)
  }

  selectColor = (event) => {
    event.stopPropagation()
    const chosenColor = event.target.getAttribute('aria-label')
    const chosenColorCode = event.target.style.backgroundColor

    this.setAttribute('color', chosenColor)
    // @ts-ignore
    this.colorBtn.style.backgroundColor = chosenColorCode

    this.toggleGrid(event)
  }

  selectColorViaKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') this.selectColor(event)
  }
}

customElements.define('color-btn', ColorButton)
