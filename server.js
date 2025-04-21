// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

app.get('/', async function (request, response) {
  try {
    const apiResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products/');
    const data = await apiResponse.json();
    const products = data.data;

    const likesResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products?filter[milledoni_users_id][_eq]=3');
    const likesData = await likesResponse.json();

    const likedProductIds = likesData.data.map(item => item.milledoni_products_id);


    response.render('index.liquid', { products: data.data }); // ✅ 'products' gebruiken i.p.v. 'items'
  } catch (error) {
    console.error('Fout bij ophalen van data:', error);
    response.status(500).send('Er ging iets mis met het ophalen van de data.');
  }
});


// // Maak een GET route voor de index (meestal doe je dit in de root, als /)
// app.get('/', async function (request, response) {
//   try {
//     // Doe een fetch naar de data die je nodig hebt
//     const apiResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products');

//     // Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
//     const data = await apiResponse.json();

//     // Controleer eventueel de data in je console (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
//     // console.log("Opgehaalde data:", data.data);

//     // Render index.liquid uit de Views map en geef hier de data aan mee
//     response.render('index.liquid', { items: data.data });

//   } catch (error) {
//     // Foutafhandeling
//     console.error('Fout bij ophalen van data:', error);
//     response.status(500).send('Er ging iets mis met het ophalen van de data.');
//   }
// })

app.post('/like/:id', async function (request, response) {
  const getId = request.params.id
  
  console.log(request.params.id)
 
  await fetch('https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products', {
    method: 'POST',
    body: JSON.stringify({
        milledoni_products_id: getId,
        milledoni_users_id: 3
    }),
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
});
 

  // Redirect naar de homepage
  response.redirect(303, '/');
});


app.get('/detail', async function (request, response) {
  const productsResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products');
  const productsJSON = await productsResponse.json();

  response.render('detail.liquid', { products: productsJSON.data });
});

app.get('/detail/:id', async function (request, response) {
  try {
      const productDetailResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products/' + request.params.id);
      const productDetailResponseJSON = await productDetailResponse.json();

      console.log("Opgehaalde data:", productDetailResponseJSON); 

      if (!productDetailResponseJSON.data) {
          return response.status(404).send("Product niet gevonden.");
      }

      response.render('detail.liquid', { product: productDetailResponseJSON.data });
  } catch (error) {
      console.error("Fout bij ophalen product:", error);
      response.status(500).send("Er is iets misgegaan.");
  }

});

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post('/', async function (request, response) {
  // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
  // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
  response.redirect(303, '/')
})


// Maak een get route aan voor 404

app.get('/', (req, res) => {
  res.send('/');
});

app.use((req, res) => {
  res.status(404).send('404 - Pagina niet gevonden');
});


// Gebruik app use res req next res status 400 ( kan ook een ander nummer zijn)
// render terug naar home 
// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8008)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
