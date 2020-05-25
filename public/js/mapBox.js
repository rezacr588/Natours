/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
mapboxgl.accessToken =
  'pk.eyJ1IjoicmV6YWNyNTg4IiwiYSI6ImNrYWU0dmFnZDFzb2kydnM5bzdhenhpYXIifQ.WWWiy1vMCEBiL7g1UvdMCA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rezacr588/ckae5hv5u14bq1it9fzvh6nt6',
  scrollZoom: false,
});
var bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Add Marker & Popup
  const el = document.createElement('div');
  el.className = 'marker';

  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML('<h3>' + loc.day + '</h3><p>' + loc.description + '</p>')
    )
    .addTo(map);
  // Extend map bounds to inclue current location
  bounds.extend(loc.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
