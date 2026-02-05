
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    center:JSON.parse(coordinates),
    zoom: 9
});

const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(JSON.parse(coordinates))
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${title}</h4><p>Kindly enjoy your stay.</p>`))
    .addTo(map);


