<script lang="ts">
// Windy Plugin - GPX Viewer
import { map } from '@windy/map';
import store from '@windy/store';
import { onMount, onDestroy } from 'svelte';
import { wind2obj } from '@windy/utils';
import { getLatLonInterpolator } from '@windy/interpolator';
import metrics from '@windy/metrics';
import broadcast from '@windy/broadcast';


let gpxFiles = [];
let routes = [];

let gpsData; // Parsed GPX data
let gpxFile = null; // Contiendra le fichier GPX
let closestWaypoints = []; // Stockera les coordonnées extraites
let gpxContent = ""; // Contenu du fichier GPX chargé
let data = [];
let markers = [];
let isLoading = false; // Indicateur de chargement
let current_time = new Date(store.get("timestamp")).toLocaleString();
let fileSelected = false;
let polylines = [];
let windDatas = [];
let windSpeed = null;
let windDir = null;
let isZezo = false;
let format = null;
let filesNumbers = 0;
let colors = [];


 // Fonction pour lire un fichier et retourner son contenu
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);

      reader.readAsText(file);
    });
  }

async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
	fileSelected = true;
	filesNumbers = files.length;
	var i = 0;
	
	for (const file of files) {
      try {
        const content = await readFileAsText(file);
        const waypoints = parseGpx(content);

        // Ajouter la nouvelle route et réassigner `routes`
        routes = [
          ...routes,
          {
            fileName: file.name,
            waypoints
          },
        ];
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }
	plotGpsData();
	const date = new Date(store.get("timestamp"));
	syncMarkerWithForecast(date);
  }
  

// Fonction principale pour le plugin
function initPlugin() {
    // Vérifier que la variable "store" de Windy est disponible
    if (typeof store === 'undefined') {
        console.error("Windy store is not available.");
        return;
    }
	
    // Stocker la valeur initiale de store.timestamp et store.product
    let previousTimestamp = store.get("timestamp");
	let previousProduct = store.get("product");

    // Observer les changements de store.timestamp
    store.on("timestamp", (newTimestamp) => {
		const date = new Date(newTimestamp);
        if (newTimestamp !== previousTimestamp ) {
            previousTimestamp = newTimestamp; // Mettre à jour la valeur précédente
            syncMarkerWithForecast(date); // Appeler une fonction pour gérer le changement
			fetchWindData()
		}
    });
	
	// Observer les changements de store.product
    store.on("product", (newProduct) => {
            fetchWindData();
    });
    console.log("Plugin initialized and listening for timestamp changes.");
}

function detectFormat(desc) {
	const format1 = /COG = ([\d,]+)° SOG = ([\d,]+)nds TWS = ([\d,]+)nds TWA = ([\d,]+)° SAIL = ([\w-]+)/;
	const format2 = /HDG:(\d+)\s+TWA:([-\d.]+)\s+(.+?)\s+SOG:([\d.]+)\s+kt\s+TWS:([\d.]+)\s+kt/;
    if (format1.test(desc)) {
	  format = format1;
	  return 1;
    } else if (format2.test(desc)) {
      format = format2;
	  return 2;
    } else {
      console.error("format de fichier incompatible");
	  return 0;
    }
  }

// Parse GPX Content and Display on Map
function parseGpx(gpxString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxString, "application/xml");
	

    // Récupérer toutes les balises <wpt>
    const wptNodes = xmlDoc.querySelectorAll("wpt");
	// Récupérer toutes les balises <rtept>
    const rteptNodes = xmlDoc.querySelectorAll("rtept");
	
	
	if (wptNodes.length == 0) {
		isZezo = true;
		// Tableau pour stocker les données extraites
		const rteptData = [];
		// Parcourir chaque balise <wpt>
		rteptNodes.forEach((rtept) => {
			const lat = parseFloat(rtept.getAttribute("lat"));
			const lon = parseFloat(rtept.getAttribute('lon')) > 0 ? (parseFloat(rtept.getAttribute('lon')) % 360) - 360 : parseFloat(rtept.getAttribute('lon'))
			const timeString = rtept.querySelector("time")?.textContent || null;
			const time = timeString ? new Date(timeString) : null; // Convertir le temps
			const name = rtept.querySelector("name")?.textContent || "Unknown";
			
			// Ajouter les données au tableau
			rteptData.push({
				lat, // Latitude
				lon, // Longitude
				time, // Heure
				name, // Nom
			});
		});
		for (let i = 0; i < rteptData.length-1; i++) {
			var WP = rteptData[i];
			var nextWP = rteptData[i+1];
			var COG = calculateBearing(WP.lat, WP.lon, nextWP.lat, nextWP.lon);
			rteptData[i].COG = COG;	
		}
		rteptData[rteptData.length-1].COG = rteptData[rteptData.length-2].COG;
		return rteptData;				
	} else {
	const desc = xmlDoc.querySelector('desc')?.textContent;
    if (!desc) return { error: 'No desc tag found' };
    const descFormat = detectFormat(desc);
	// Tableau pour stocker les données extraites
    const wptData = [];

    // Parcourir chaque balise <wpt>
    wptNodes.forEach((wpt) => {
        const lat = parseFloat(wpt.getAttribute("lat"));
        const lon = parseFloat(wpt.getAttribute('lon')) > 0 ? (parseFloat(wpt.getAttribute('lon')) % 360) - 360 : parseFloat(wpt.getAttribute('lon'))
        const ele = parseFloat(wpt.querySelector("ele")?.textContent || "0");
        const timeString = wpt.querySelector("time")?.textContent || null;
		const time = timeString ? new Date(timeString) : null; // Convertir le temps
        const name = wpt.querySelector("name")?.textContent || "Unknown";
        const desc = wpt.querySelector("desc")?.textContent || "";

        // Extraire les valeurs de la balise <desc>
        const match = desc.match(format);

        // Ajouter les données au tableau
		if (descFormat == 1){
			wptData.push({
				lat, // Latitude
				lon, // Longitude
				ele, // Élévation
				time, // Heure
				name, // Nom
				COG: match ? parseFloat(match[1].replace(",", ".")) : null, // Cap
				SOG: match ? parseFloat(match[2].replace(",", ".")) : null, // Vitesse sol
				TWS: match ? parseFloat(match[3].replace(",", ".")) : null, // Vitesse du vent
				TWA: match ? parseFloat(match[4].replace(",", ".")) : null, // Angle du vent
				SAIL: match ? match[5] : null, // Type de voile
			});
		} else if (descFormat == 2 && match != null) {
			wptData.push({
            lat, // Latitude
            lon, // Longitude
            ele, // Élévation
            time, // Heure
            name, // Nom
            COG: match[1], // Cap
            SOG: match[4], // Vitesse sol
            TWS: match[5], // Vitesse du vent
            TWA: match[2], // Angle du vent
            SAIL: match[3], // Type de voile
        });
		}
    });
	return wptData;
	}
}

  // Fonction pour trouver le point le plus proche de l'heure sélectionnée
  function findClosestMarkerWithForecast(forecastTime) {
	var closest = [];
	routes.forEach((route) => {
		var closest_wpt = route.waypoints[0];
		let diff = Math.abs(forecastTime - closest_wpt.time);

		route.waypoints.forEach((wpt) => {
			const newdiff = Math.abs(forecastTime - wpt.time);
			if (newdiff < diff) {
				diff = newdiff;
				closest_wpt = wpt;
			}
		});
		closest.push(closest_wpt);
	});
	return closest;
  }

function calculateBearing(lat1, lon1, lat2, lon2) {
  // Convertir les degrés en radians
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const toDegrees = (rad) => (rad * 180) / Math.PI;

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  // Calculer le cap initial en radians
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = toDegrees(Math.atan2(x, y));

  // Normaliser le résultat pour qu'il soit entre 0 et 360
  return (bearing + 360) % 360;
}

// Afficher le tracé GPS sur la carte
function plotGpsData() {
	let hue = 0;
	routes.forEach((route_data)  => {	
	const route = route_data.waypoints;
	//});
    const latlngs = route.map(point => [point.lat, point.lon]);
	//const latlngs = gpsData.map(point => [point.lat, parseFloat(point.lon) >0 ? (parseFloat(point.lon) % 360) - 360 : parseFloat(point.lon)]);
	hue = (hue + 60) % 360;
	const color = `hsl(${hue}, 100%, 45%)`;
    // Ajouter les points sur la carte Windy
	colors.push(color);
    const polyline = L.polyline(latlngs, { color , weight: 2, opacity: 0.8 }).addTo(map);
	polylines.push(polyline);
	// Ajouter un marker à la première position
      const firstWaypoint = route[0];
	  closestWaypoints.push(firstWaypoint);
		const marker = new L.marker([firstWaypoint.lat,parseFloat(firstWaypoint.lon) >0 ? (parseFloat(firstWaypoint.lon) % 360) - 360 : parseFloat(firstWaypoint.lon)], {
          icon: L.divIcon({
			className: 'marker-icon',
            html: `<div style="transform: rotate(${firstWaypoint.COG}deg);"><svg  viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">
            <path d="M4.784,13.635c0,0 -0.106,-2.924 0.006,-4.379c0.115,-1.502 0.318,-3.151 0.686,-4.632c0.163,-0.654 0.45,-1.623 0.755,-2.44c0.202,-0.54 0.407,-1.021 0.554,-1.352c0.038,-0.085 0.122,-0.139 0.215,-0.139c0.092,0 0.176,0.054 0.214,0.139c0.151,0.342 0.361,0.835 0.555,1.352c0.305,0.817 0.592,1.786 0.755,2.44c0.368,1.481 0.571,3.13 0.686,4.632c0.112,1.455 0.006,4.379 0.006,4.379l-4.432,0Z" style="fill:${hue};"/><path d="M5.481,12.731c0,0 -0.073,-3.048 0.003,-4.22c0.06,-0.909 0.886,-3.522 1.293,-4.764c0.03,-0.098 0.121,-0.165 0.223,-0.165c0.103,0 0.193,0.067 0.224,0.164c0.406,1.243 1.232,3.856 1.292,4.765c0.076,1.172 0.003,4.22 0.003,4.22l-3.038,0Z" style="fill:#fff;fill-opacity:0.846008;"/>
			</svg></div>`,
            iconSize: [24, 24],
			iconAnchor: [12, 12],
          }),
        }).addTo(map);
	markers.push(marker);
    // Centrer la carte sur les données
    map.fitBounds(polyline.getBounds());
	//Récupérer les données de Windy
	fetchWindData();
	});
	//alert("fini");
}


// Fonction pour synchroniser le marqueur avec l'heure des prévisions
function syncMarkerWithForecast(forecastTime) {
	var i = 0;
	closestWaypoints = findClosestMarkerWithForecast(forecastTime);
	
	markers.forEach((marker) => {
	if (closestWaypoints) {
	  marker.setLatLng([closestWaypoints[i].lat, closestWaypoints[i].lon]);
	  marker.setIcon(L.divIcon({
		className: 'marker-icon',
		html: `<div style="transform: rotate(${closestWaypoints[i].COG}deg);"><svg  viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">
            <path d="M4.784,13.635c0,0 -0.106,-2.924 0.006,-4.379c0.115,-1.502 0.318,-3.151 0.686,-4.632c0.163,-0.654 0.45,-1.623 0.755,-2.44c0.202,-0.54 0.407,-1.021 0.554,-1.352c0.038,-0.085 0.122,-0.139 0.215,-0.139c0.092,0 0.176,0.054 0.214,0.139c0.151,0.342 0.361,0.835 0.555,1.352c0.305,0.817 0.592,1.786 0.755,2.44c0.368,1.481 0.571,3.13 0.686,4.632c0.112,1.455 0.006,4.379 0.006,4.379l-4.432,0Z" style="fill:#000;"/><path d="M5.481,12.731c0,0 -0.073,-3.048 0.003,-4.22c0.06,-0.909 0.886,-3.522 1.293,-4.764c0.03,-0.098 0.121,-0.165 0.223,-0.165c0.103,0 0.193,0.067 0.224,0.164c0.406,1.243 1.232,3.856 1.292,4.765c0.076,1.172 0.003,4.22 0.003,4.22l-3.038,0Z" style="fill:#fff;fill-opacity:0.846008;"/>
			</svg></div>`,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
	  }));
	  i++;
	}});
	//fetchWindData();
}



  // Fonction pour récupérer et afficher les données
async function fetchWindData() {
	isLoading = true; // Active l'indicateur de chargement
    const listener = broadcast.once("redrawFinished", async () => {
        windDatas = [];

        for (const closestWaypoint of closestWaypoints) {
            const [lat, lon] = [closestWaypoint.lat, closestWaypoint.lon];

            try {
                const interpolateLatLon = await getLatLonInterpolator();

                if (!interpolateLatLon) {
                    console.error('No interpolator available for this overlay');
                    continue;
                }

                if (store.get('overlay') !== 'wind') {
                    console.error('Please select the wind overlay to interpolate wind values.');
                    continue;
                }

                const windData = interpolateLatLon({ lat, lon });

                if (Array.isArray(windData)) {
                    const { dir, wind } = wind2obj(windData);

                    // Convert wind speed to user's preferred units
                    const windSpeed = metrics.wind.convertValue(wind, " ");
                    const windDir = dir;

                    windDatas.push({ windSpeed, windDir });
                } else {
                    console.error("Invalid wind data:", windData);
                }
            } catch (error) {
                console.error("Error processing waypoint:", error);
            }
        }

		isLoading = false; // Désactive l'indicateur de chargement
        // Remove listener after processing
        broadcast.off(listener);
    });
}


 
// Clear all GPX data and reset the map
function clearData() {
	polylines.forEach((polyline) => {
        map.removeLayer(polyline);
    });
	
	markers.forEach((marker) => {
        map.removeLayer(marker);
    });
	
	fileSelected = false;
	isZezo = false;
	gpxFiles = [];
	routes = [];
	closestWaypoints = []; 
	data = [];
	polylines = [];
	markers = [];
	isLoading = false; // Indicateur de chargement
	current_time = new Date(store.get("timestamp")).toLocaleString();
	fileSelected = false;
	windDatas = [];
	colors = [];
}


onMount(() => {
	
});

onDestroy(() => {
clearData()
});

// Initialisation du plugin lorsque Windy est prêt
if (typeof W !== "undefined" && typeof store !== "undefined") {
	initPlugin();
} else {
	alert("pas init");
    document.addEventListener("windyLoaded", initPlugin);
}


</script>

<style>
  .custom-button {
    margin-top: 100px;
    padding: 5px 10px;
    background-color: #fff;
    color: black;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }

  .custom-button:hover {
    background-color: #026f00;
  }
  .details {
    margin-top: 0px;
    font-size: 12px;
  }

  .details span {
    font-weight: bold;
  }
  
   .reset-button {
    margin-top: 100px;
    padding: 5px 10px;
    background-color: #fff;
    color: black;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }

  .reset-button:hover {
    background-color: #e63939;
  }
  
  table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
  text-align: left;
  color: #4d4d4d;
}

td div {
  display: inline-block;
  border: 1px solid #000;
}
</style>


<section class="plugin__content">
    <div class="plugin__title">Windy4VR</div>
{#if !fileSelected}
<p>Sélectionnez un(des) fichier(s) GPX pour afficher la trace sur la map.</p>
    <input
      type="file"
	  accept=".gpx"
      multiple
      on:change={handleFileUpload}
    />
{/if}

{#if routes.length > 0}
<h3>Windy Data:</h3>
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>Wind Speed</th>
		  <th>Wind Direction</th>
        </tr>
      </thead>
      <tbody>
	  
        {#each windDatas as windata, index}
          <tr>
            <td>
              <div style="width: 20px; height: 20px; background-color: {colors[index]}"></div>
            </td>
			<td>
				{#if !isLoading}{windata.windSpeed}{/if}
            </td>
			<td>
              {#if !isLoading}{windata.windDir}° {/if}
            </td>
          </tr>
        {/each}
	
      </tbody>
    </table>
  {/if}
  
{#if fileSelected}
	{#if !isZezo && filesNumbers == 1 }
<!-- Display selected waypoint details -->
      <div class="details">
        <h3>GPX Waypoint details</h3>
		{#each closestWaypoints as closestWaypoint}
			<p><span>HDG:</span> {closestWaypoint.COG || "N/A"}°</p>
			<p><span>Speed:</span> {closestWaypoint.SOG || "N/A"} nds</p>
			<p><span>TWS:</span> {closestWaypoint.TWS || "N/A"} nds</p>
			<p><span>TWA:</span> {closestWaypoint.TWA || "N/A"}°</p>
			<p><span>Sail:</span> {closestWaypoint.SAIL || "N/A"}</p>
		{/each}
      </div>
	{/if}
	<button class="reset-button" on:click={clearData}>Réinitialiser</button>
{/if}
</section>
