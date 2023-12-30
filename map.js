const map = L.map("map").setView([10.046285, -13.796768], 15);

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
googleSat.addTo(map);

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

const baseMaps = {
    EsriSatelite: esriSatelite,
    OpenStreetMap: openStreetMap,
    Water: waterColor,
    GoogleTerrain: googleTerrain,
    GoogleSat: googleSat,
};
L.control.layers(baseMaps).addTo(map);

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

// NASA End Point
// https://firms.modaps.eosdis.nasa.gov/api/country/csv/205dd6cbd76937af48043319cca57731/VIIRS_SNPP_NRT/GIN/10/2023-12-29
