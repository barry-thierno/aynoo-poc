import fireData from "./ressources/fire_data.json" assert { type: "json" };

// Load Sentinel data via WMS
// Sentinel Hub WMS service
// tiles generated using EPSG:3857 projection - Leaflet takes care of that
let baseUrl =
  "https://services.sentinel-hub.com/ogc/wms/427d2456-0839-45b3-b216-690847be1e42";

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

// Load NASA fire point for Guinea
const heatPoints = fireData.map((fd) => [
  fd.latitude,
  fd.longitude,
  fd.bright_ti4,
]);
const firePoints = L.heatLayer(heatPoints, {
  radius: 25,
  //   gradient: { 0.4: "#f8961e", 0.65: "#6930c3", 1: "#f94144" },
});

const fields = {
  CropFields: cropFields,
  // NDVI: sentinelHub,
  FirePoints: firePoints,
};

// Map tiles
// const map = L.map("map").setView([10.268979, -10.977505], 7);

const map = L.map("map").setView([10.046285, -13.796768], 17);

const openStreetMap = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
);

const googleSat = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
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

// add main map
googleSat.addTo(map);

const baseMaps = {
  EsriSatelite: esriSatelite,
  OpenStreetMap: openStreetMap,
  GoogleSat: googleSat,
  StadiaDark: stadiaDark,
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
  const geoJson = layer.toGeoJSON();
  console.log(geoJson);
  drawFeature.addLayer(layer);
  let sentinelHub = L.tileLayer.wms(baseUrl, {
    tileSize: 512,
    attribution:
      '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
    urlProcessingApi:
      "https://services.sentinel-hub.com/ogc/wms/1d4de4a3-2f50-493c-abd8-861dec3ae6b2",
    maxcc: 20,
    minZoom: 7,
    maxZoom: 19,
    format: "image/png",
    preset: "NDVI",
    layers: "NDVI",
    resx: "10m",
    resy: "10m",
    transparent: "true",

    // make sure that coordinates in the geometry parameter are in the same CRS that is set for the layer
    crs: L.CRS.EPSG4326,
    time: "2023-07-01/2024-01-01",
    geometry: toWKT(layer),
  });
  drawFeature.addLayer(sentinelHub);
});

function toWKT(layer) {
  var lng,
    lat,
    coords = [];
  if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
    var latlngs = layer.getLatLngs();
    for (var i = 0; i < latlngs.length; i++) {
      var latlngs1 = latlngs[i];
      if (latlngs1.length) {
        for (var j = 0; j < latlngs1.length; j++) {
          coords.push(latlngs1[j].lng + " " + latlngs1[j].lat);
          if (j === 0) {
            lng = latlngs1[j].lng;
            lat = latlngs1[j].lat;
          }
        }
      } else {
        coords.push(latlngs[i].lng + " " + latlngs[i].lat);
        if (i === 0) {
          lng = latlngs[i].lng;
          lat = latlngs[i].lat;
        }
      }
    }
    if (layer instanceof L.Polygon) {
      return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";
    } else if (layer instanceof L.Polyline) {
      return "LINESTRING(" + coords.join(",") + ")";
    }
  } else if (layer instanceof L.Marker) {
    return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
  }
}
