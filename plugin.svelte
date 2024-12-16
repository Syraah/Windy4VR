// Windy Plugin - GPX Viewer
import { onMount } from 'svelte';

let map; // Windy map instance
let gpxData; // Parsed GPX data

// GPX File Upload Handler
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            parseGPX(content);
        };
        reader.readAsText(file);
    }
}

// Parse GPX Content and Display on Map
function parseGPX(gpxContent) {
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxContent, 'application/xml');

    // Extract coordinates from GPX <trkpt> elements
    const points = [...gpxDoc.querySelectorAll('trkpt')].map(pt => {
        return [
            parseFloat(pt.getAttribute('lat')),
            parseFloat(pt.getAttribute('lon'))
        ];
    });

    gpxData = points;
    displayGPXTrace(points);
}

// Display the GPX trace on the Windy map
function displayGPXTrace(points) {
    if (!map) return;

    // Create a Polyline layer for the GPX trace
    const polyline = L.polyline(points, {
        color: 'red',
        weight: 3,
        opacity: 0.7
    });

    // Add polyline to the map
    polyline.addTo(map);

    // Adjust map view to fit the trace
    map.fitBounds(polyline.getBounds());
}

onMount(() => {
    // Windy Plugin initialization
    windyInit({
        key: 'ONfrxbUXeQc5YLMBOIaEaIFRt60XRoss', // Replace with your Windy API key
        verbose: true
    }, (windyAPI) => {
        const { map: windyMap } = windyAPI;
        map = windyMap;

        // Example: Add a GPX control for file upload
        const fileInput = L.control({ position: 'topright' });
        fileInput.onAdd = function () {
            const div = L.DomUtil.create('div', 'gpx-file-input');
            div.innerHTML = '<input type="file" accept=".gpx" style="padding: 5px;" />';
            div.firstChild.addEventListener('change', handleFileUpload);
            return div;
        };
        fileInput.addTo(map);
    });
});
