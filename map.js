import fireData from "./ressources/fire_data.json" assert { type: "json" };

// const map = L.map("map").setView([10.046285, -13.796768], 15);

const greenIcon = L.icon({
  iconUrl: "./ressources/icons/icons8-user-location-100.png",
  // shadowUrl: 'leaf-shadow.png',

  iconSize: [40, 40], // size of the icon
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});
// Add markers
const waranya = L.marker([10.046285, -13.796768], {
  icon: greenIcon,
}).bindPopup("Domaine agricole de Mr et Mm BARRY");

const cropFields = L.layerGroup([waranya]);

const fields = {
  CropFields: cropFields,
};

// Map tiles
const map = L.map("map").setView([10.268979, -10.977505], 7);

const openStreetMap = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
);

const waterColor = L.tileLayer.provider("Stadia.StamenWatercolor");

const googleSat = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

const googleTerrain = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

const esriSatelite = L.tileLayer.provider("Esri.WorldImagery", {
  maxZoom: 20,
});

const stadiaDark = L.tileLayer.provider("Stadia.AlidadeSmoothDark", {
  maxZoom: 20,
  minZoom: 7.5,
  opacity: 0.5,
});

// const jawgDark = L.tileLayer.provider("Jawg.Dark", {
//     maxZoom: 20,
// });

// googleSat.addTo(map);
// openStreetMap.addTo(map);
stadiaDark.addTo(map);

const baseMaps = {
  EsriSatelite: esriSatelite,
  OpenStreetMap: openStreetMap,
  Water: waterColor,
  GoogleTerrain: googleTerrain,
  GoogleSat: googleSat,
  StadiaDark: stadiaDark,
  // JawgDark: jawgDark
};
L.control.layers(baseMaps, fields).addTo(map);

// leaflet draw
const drawControl = new L.Control.Draw({
  draw: {
    polygon: {
      shapeOptions: {
        color: "pink",
      },
    },
  },
});
map.addControl(drawControl);

const drawFeature = new L.FeatureGroup();
map.addLayer(drawFeature);

map.on("draw:created", (event) => {
  const { layer } = event;
  console.log(layer.toGeoJSON());
  drawFeature.addLayer(layer);
});

// Load NASA fire point for Guinea
const heatPoints = fireData.map((fd) => [
  fd.latitude,
  fd.longitude,
  fd.bright_ti4,
]);
var heat = L.heatLayer(heatPoints, {
  radius: 25,
  //   gradient: { 0.4: "#f8961e", 0.65: "#6930c3", 1: "#f94144" },
}).addTo(map);
