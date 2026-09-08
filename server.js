const express = require('express');
const app = express();
const port = 3000;

let bricks = [];

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});



//---------------------switching to express ^^^-----------------------------------
const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000


const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }else if( request.method === 'DELETE' ){
    handleDelete( request, response )
  }
})

const handleGet = function( request, response ) {
  if( request.url === '/bricks' ) {
    response.writeHead( 200, { 'Content-Type': 'application/json' })
    response.end( JSON.stringify( bricks ) )
    return
  }

  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  }else{
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    const brick = JSON.parse( dataString )
    bricks.push( brick )

    response.writeHead( 200, "OK", {'Content-Type': 'application/json' })

    response.end( JSON.stringify( brick ) )
  })
}

const handleDelete = function( request, response ) {
  if( request.url === '/bricks' ) {
    bricks.length = 0
    response.writeHead( 200, { 'Content-Type': 'application/json' })
    response.end( JSON.stringify( bricks ) )
  }
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )
