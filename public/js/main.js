// FRONT-END (CLIENT) JAVASCRIPT HERE
const bricks = []
let brickID = 0
let selectedBrickID = -1

function displayBrick( brick ) {
  const brickElement = document.createElement( 'div' )

  brickElement.dataset.id = brick.id
  brickElement.classList.add( 'brick' )

  const titleElement = document.createElement( 'h3' )
  titleElement.textContent = brick.title

  const bodyElement = document.createElement( 'p' )
  bodyElement.textContent = brick.body

  brickElement.appendChild( titleElement )
  brickElement.appendChild( bodyElement )

  brickElement.addEventListener( 'click', brickClicked )

  const wall = document.getElementById("brickWall")
  if (!wall) {
    return
  }

  wall.appendChild( brickElement )
  if (brick.parentID !== -1) {
    parentBrick = bricks.find(parentBrick => Number(parentBrick.id) == brick.parentID)
    parentBrickElement = document.querySelector(`.brick[data-id='${parentBrick.id}']`)
    drawLine( brickElement, parentBrickElement )
  }

  console.log( 'brickElement:', brickElement )
}

async function loadBricks() {
  const response = await fetch( 'api/bricks' )
  const serverBricks = await response.json()

  if (serverBricks.length > 0) {
    bricks.push( ...serverBricks )
    bricks.forEach( displayBrick )
  }
}

function brickClicked( event ){
  const brickElement = event.currentTarget
  selectedBrickID = brickElement.dataset.id
  const selectedBrick = bricks.find( function( brick ) {
    return String( brick.id ) === selectedBrickID
  })

  document.querySelectorAll( '.brick.selected' ).forEach( function( element ) {
    element.classList.remove( 'selected' )
  })
  brickElement.classList.add( 'selected' )

  console.log( 'selectedBrickID:', selectedBrickID )
  console.log( 'Selected brick', selectedBrick )

}

function drawLine(brick1, brick2) {
  console.log('Drawing line between', brick1, 'and', brick2)
  const svg = document.getElementById('connection')
  const wall = document.getElementById('brickWall')

  const rect1 = brick1.getBoundingClientRect()
  const rect2 = brick2.getBoundingClientRect()
  const wallRect = wall.getBoundingClientRect()

  const x1 = rect1.left - wallRect.left + rect1.width / 2
  const y1 = rect1.top - wallRect.top / 2 + rect1.height
  const x2 = rect2.left - wallRect.left + rect2.width / 2
  const y2 = rect2.top - wallRect.top / 2 + rect2.height

  console.log('Coordinates:', x1, y1, x2, y2)

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  const curveAmount = -100 * (x2-x1)/rect1.width  // Adjust this value to control the curve amount

  const controlX = midX
  const controlY = midY + curveAmount

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

  path.setAttribute('d', `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`)
  path.setAttribute('stroke', 'white')
  path.setAttribute('fill', 'transparent')
  path.setAttribute('stroke-width', '3')

  svg.appendChild(path)
}

async function clearWall(){
  brickID = 0
  selectedBrickID = -1

  const svg = document.getElementById('connection')
  svg.innerHTML = ''
  const body = JSON.stringify({ setOfBricks: bricks })

  const response = await fetch( 'api/bricks', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  if( response.ok ) {
    const wall = document.querySelector( '#brickWall' )
    wall.innerHTML = ''
    bricks.length = 0
    bricks = []
  }
  
}

const clearWallButton = document.getElementById('clearWall')
if (clearWallButton) {
  clearWallButton.addEventListener('click', clearWall)
}

function createBrick( title, body ) {
  let newBrick = {
    id: brickID++,
    title: title,
    body: body,
    parentID: selectedBrickID
  }
  console.log( 'newBrick:', newBrick )
  return newBrick
}

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const form = event.currentTarget

  console.log("Button", form.id, "clicked")

  const formData = new FormData( form )
  if(form.id === "loginForm"){
    const username = formData.get('username')
    const password = formData.get('password')

    const body = JSON.stringify({ username, password })

    const response = await fetch('api/login', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })

    console.log("login attempted, U:" , username, "P:", password)
    const text = await response.text()
    console.log(text)
    return
  } else{
    brickID = bricks.length

    const brick = createBrick(
      formData.get( 'title' ),
      formData.get( 'body' )
    )

    bricks.push( brick )
    displayBrick( brick )
    //console.log( 'bricks:', bricks )

    const body = JSON.stringify( brick )

    const response = await fetch( 'api/bricks', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body 
    })

    const text = await response.text()

    console.log( 'text:', text )

    if (form.id === 'firstBrickForm') {
      window.location.href = 'wall.html'
    }
  }
}

window.onload = function() {
  loadBricks()

  const forms = document.querySelectorAll( 'form' )

  forms.forEach( function( form ) {
    form.addEventListener( 'submit', submit )
  })

}
