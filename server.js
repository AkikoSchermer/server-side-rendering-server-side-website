// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get('/', async function (request, response) {
  try {
    // Doe een fetch naar de data die je nodig hebt
    const apiResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products');

    // Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
    const data = await apiResponse.json();

    // Controleer eventueel de data in je console (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
    // console.log("Opgehaalde data:", data.data);

    // Render index.liquid uit de Views map en geef hier de data aan mee
    response.render('index.liquid', { items: data.data });

  } catch (error) {
    // Foutafhandeling
    console.error('Fout bij ophalen van data:', error);
    response.status(500).send('Er ging iets mis met het ophalen van de data.');
  }
})

app.get('/detail', async function (request, response) {
  const productsResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products');
  const productsJSON = await productsResponse.json();

  response.render('detail.liquid', { products: productsJSON.data });
});

app.get('/detail/:id', async function (request, response) {
  try {
      const productDetailResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products/' + request.params.id);
      const productDetailResponseJSON = await productDetailResponse.json();

      console.log("Opgehaalde data:", productDetailResponseJSON); // ✅ Dit logt de data

      if (!productDetailResponseJSON.data) {
          return response.status(404).send("Product niet gevonden.");
      }

      response.render('detail.liquid', { product: productDetailResponseJSON.data });
  } catch (error) {
      console.error("Fout bij ophalen product:", error);
      response.status(500).send("Er is iets misgegaan.");
  }

});

// app.get('/detail/:id', async function (request, response) {
//   // Gebruik de request parameter id en haal de juiste persoon uit de WHOIS API op
//   const productDetailResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products/' + request.params.id)
//   // En haal daarvan de JSON op
//   const productDetailResponseJSON = await productDetailResponse.json()

  
  
//   // Render student.liquid uit de views map en geef de opgehaalde data mee als variable, genaamd person
//   // Geef ook de eerder opgehaalde squad data mee aan de view
//   response.render('detail.liquid', { product: productDetailResponseJSON.data,})
// })

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post('/', async function (request, response) {
  // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
  // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
  response.redirect(303, '/')
})

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8003)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
