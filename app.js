// Otetaan tarvittavat moduulit käyttöön require-toimonnolla
var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");

var app = express();

// Otetaan EJS käyttöön ja body parser käyttöön app-nimisessä express-sovelluksessa
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))

// Määritellään portti, jota kuunnellaan
const port = process.env.PORT || 3001;

// Sallitaan expressin tarjota staattisia sisältöjä projektin hakemistosta
app.use(express.static("./"));

// Tehdään reitti kotisivulle
app.use(express.static("./public"));

// Reitti uuden viestin lähettämiseen
app.get('/newmessage', function (req, res) {
  res.sendFile(__dirname + '/public/form.html');
});

//Reitti lähetetyn viestin käsittelyyn
app.post("/newmessage", function(req, res) {

  // Määritellään json-tiedosto jonne lomakkeen tiedot tallennetaan
  var data = require('./messages.json');
    
  console.log(req.body);
  var username = req.body.username;
  var country = req.body.country;
  var message = req.body.message;

  // Määritellään mitä tietoja lähetetään jsoniin
  data.push({
    "username" : req.body.username,
    "country" : req.body.country,
    "message" : req.body.message
  })

  var jsonStr = JSON.stringify(data);

  // Lomakkeen tiedot kirjoitetaan json-tiedostoon
  fs.writeFile('messages.json', jsonStr, (err) => {
    if (err) throw err;
    console.log("message saved");
  });
  
});

// Luodaan reitti vieraskirjaan
app.get("/guestbook", function(req, res) {
  const data = require('./messages.json');
  res.render('pages/guestbook',  { data });
});

// Luodaan reitti ajax-message sivulle
app.get("/ajaxmessage", function(req, res) {
  res.sendFile(__dirname + '/public/ajax.html');
});

// POST-tyyppiseen sivupyyntöön reagoiva reitti
app.post("/ajaxmessage", function(req, res) {

  var username = req.body.username;
  var country = req.body.country;
  var message = req.body.message;

  // Haetaan jälleen json-muotoista dataa (vieraskirjan sisältö)
  var data = require('./messages.json');

  // Luodaan taulukko jonne data json-tiedostosta lisätään
  var results = '<table border="1">';

  // Lisätään taulukkoon otsikot
  results+=
  '<tr>' +
  '<th>'+ "Username" + '</th>' +
  '<th>'+ "Country" + '</th>' +
  '<th>'+ "Message" + '</th>' +
  '</tr>'

  // Käydään json-tiedosto läpi ja tallennetaan data taulukkoon
  for (var i = 0; i < data.length; i++) {
    results+=
    '<tr>' +
    '<td>'+ data[i].username + '</td>' +
    '<td>'+ data[i].country + '</td>' +
    '<td>'+ data[i].message + '</td>' +
    '</tr>'
  }
  
  // Ajetaan näytölle viesti, taulukkoon kirjoitetut tiedot ja vieraskirjan datasta muodostettu taulukko
  res.send( "Ajax sent this data you filled in the form!" + "<br>" + "Username: " + username + " & country: " + country + " & message: " + message + "<br>" + "Here are the messages in guestbook: " + "<br>" + results);

});

// Oletusreitti joka tarjoillaan, mikäli muihin ei päädytty.
app.get("*", function(req, res) {
  res.send("Cant find the requested page", 404);
});

// Palvelin kuuntelee määriteltyä porttia
app.listen(port);
