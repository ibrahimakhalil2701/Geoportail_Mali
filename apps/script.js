// Déclaration globale pour le mode sélection
window.selectionModeActive = false;


/* ====================
   INITIALISATION CARTE
   ==================== */
var map = L.map('map', {
  center: [16.1415842, -3.5611702],
  zoom: 6,
  attributionControl: false,
  zoomControl: false
});

var GoogleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 23,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

const initialView = {
  center: [16.1415842, -3.5611702],
  zoom: 6
};


map.pm.setLang('fr', {
  tooltips: {
    // Ici, vous pouvez personnaliser tous les textes d’info-bulle
    placeMarker: "Cliquez pour placer un point",
    firstVertex: "Placez le premier point",
    // etc.
  },
  actions: {
    finish: "Terminer",  // pour le bouton “Finish”
    cancel: "Annuler",   // pour le bouton “Cancel”
    // etc.
  }
}, 'fr');




// Boutons "reset view" et "locate me"
document.getElementById('reset-view').addEventListener('click', function () {
  map.setView(initialView.center, initialView.zoom);
});
document.getElementById('locate-me').addEventListener('click', function () {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      L.marker([latitude, longitude]).addTo(map)
        .bindPopup("Vous êtes ici.")
        .openPopup();
      map.setView([latitude, longitude], 14);
    },
    (error) => {
      alert("Impossible d'obtenir votre position.");
    }
  );
});

// Fonds de carte
var baseMaps = {
  "Google Streets": GoogleStreets,
  "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?', { maxZoom: 23 }),
  "CartoDB Positron": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 23 }),
  "Esri World Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 23 }),
  "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17 })
};

// Contrôle d'échelle
L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);

// Création de boutons de zoom + toggles
var controlsLeft = document.createElement('div');
controlsLeft.className = 'map-controls-left';
controlsLeft.innerHTML = `
    <button title="Zoom avant"><i class="fas fa-plus"></i></button>
    <button title="Zoom arrière"><i class="fas fa-minus"></i></button>
    <button title="Changer le fond de carte" id="toggleBaseLayer"><i class="fas fa-globe"></i></button>
  `;
document.body.appendChild(controlsLeft);

// ZoomIn / ZoomOut
controlsLeft.querySelector('[title="Zoom avant"]').addEventListener('click', () => map.zoomIn());
controlsLeft.querySelector('[title="Zoom arrière"]').addEventListener('click', () => map.zoomOut());

// Gérer l'ouverture/fermeture du sidebar
document.getElementById('toggleSidebar').addEventListener('click', function () {
  var sidebar = document.getElementById('sidebar');
  var iframeContainer = document.getElementById('iframeContainer');
  var toggleButton = document.getElementById('toggleSidebar');
  var mapElement = document.getElementById('map');

  sidebar.classList.toggle('open');
  iframeContainer.classList.toggle('open');
  toggleButton.classList.toggle('open');
  mapElement.classList.toggle('sidebar-open');

  this.innerHTML = sidebar.classList.contains('open')
    ? '<i class="fas fa-arrow-left"></i>'
    : '<i class="fas fa-arrow-right"></i>';
});

/* ====================
   GESTION DU SIDEBAR
   ==================== */
function showSection(sectionId, buttonElement) {
  const sharedPanel = document.getElementById('sharedPanel');
  const sectionButtons = document.querySelectorAll('.section-button');

  const isActive = buttonElement.classList.contains('active');
  sectionButtons.forEach(btn => btn.classList.remove('active'));

  if (isActive) {
    sharedPanel.classList.remove('active');
    sharedPanel.innerHTML = '';
  } else {
    buttonElement.classList.add('active');
    sharedPanel.classList.remove('active');

    setTimeout(() => {
      if (sectionId === 'recensement') {
        sharedPanel.innerHTML = `
            <div>
              <!-- Recensement: sous-filtres -->
              <button class="filter-button" onclick="toggleSubOptions(this)">
                Pays <span class="icon">+</span>
              </button>
              <div class="sub-filter-options">
                <button class="sub-filter-button" data-layer="Couche_Pop_Pays" data-attribute="Population_Totale">
                  Pop Total
                </button>
              </div>
              <button class="filter-button" onclick="toggleSubOptions(this)">
                Filtrer par Région <span class="icon">+</span>
              </button>
              <div class="sub-filter-options">
                <button class="sub-filter-button" data-layer="Couche_Pop_Region" data-attribute="Population_Totale">Population Total</button>
                <button class="sub-filter-button" data-layer="Couche_Pop_Region" data-attribute="Population_Hommes">Population Homme</button>
                <button class="sub-filter-button" data-layer="Couche_Pop_Region" data-attribute="Population_Femmes">Population Femme</button>
              </div>
              <button class="filter-button" onclick="toggleSubOptions(this)">
                Filtrer par Département <span class="icon">+</span>
              </button>
              <div class="sub-filter-options">
                <button class="sub-filter-button" data-layer="Couche_pop_departement" data-attribute="Population_Totale">Pop Total</button>
                <button class="sub-filter-button" data-layer="Couche_pop_departement" data-attribute="Population_Hommes">Pop Homme</button>
                <button class="sub-filter-button" data-layer="Couche_pop_departement" data-attribute="Population_Femmes">Pop Femme</button>
              </div>
              <button class="filter-button" onclick="toggleSubOptions(this)">
                Filtrer par Commune <span class="icon">+</span>
              </button>
              <div class="sub-filter-options">
                <button class="sub-filter-button" data-layer="Couche_Pop_Commune" data-attribute="Pop total">Pop Total</button>
                <button class="sub-filter-button" data-layer="Couche_Pop_Commune" data-attribute="Pop homme">Pop Homme</button>
                <button class="sub-filter-button" data-layer="Couche_Pop_Commune" data-attribute="Pop femme ">Pop Femme</button>
              </div>
            </div>
          `;
      } else if (sectionId === 'geographie') {
        sharedPanel.innerHTML = `
            <div>
              <!-- Géographie: sous-filtres -->
              <button class="filter-button" data-layer="finance">
                <img src="https://img.icons8.com/ios/24/collectibles.png" alt="Finance" class="button-icon">
                Finance
              </button>
              <button class="filter-button" data-layer="hydrographie_polygone">
                <img src="https://img.icons8.com/ios/24/creek.png" alt="Hydrographie Polygone" class="button-icon">
                Hydrographie Polygone
              </button>
              <button class="filter-button" data-layer="hydrographie_ligne">
                <img src="https://img.icons8.com/ios/24/creek.png" alt="Hydrographie Ligne" class="button-icon">
                Hydrographie Ligne
              </button>
              <button class="filter-button" data-layer="place_publique">
                <img src="https://img.icons8.com/ios/24/public.png" alt="place publique" class="button-icon">
                Place publique
              </button>
              <button class="filter-button" data-layer="route">
                <img src="https://img.icons8.com/fluency/24/road.png" alt="route" class="button-icon">
                Route
              </button>
              <button class="filter-button" data-layer="sante">
                <img src="https://img.icons8.com/color/24/doctors-bag.png" alt="Santé" class="button-icon">
                Santé
              </button>
              <button class="filter-button" data-layer="batiment">
                <img src="https://img.icons8.com/carbon-copy/24/building.png" alt="Bâtiment" class="button-icon">
                Bâtiment
              </button>
              <button class="filter-button" data-layer="rail">
                <img src="https://img.icons8.com/ios/24/train.png" alt="rail" class="button-icon">
                Chemin de fer
              </button>
              <button class="filter-button" data-layer="education">
                <img src="https://img.icons8.com/ios-glyphs/24/student-center.png" alt="Éducation" class="button-icon">
                Éducation
              </button>
              <button class="filter-button" data-layer="point_interet">
                <img src="https://img.icons8.com/windows/24/food-cart.png" alt="Lieux d'intérêt" class="button-icon">
                Lieux d'intérêt
              </button>
            </div>
          `;
      } else if (sectionId === 'statistique') {
        sharedPanel.innerHTML = `
            <div>
              <!-- Statistique -->
              <h3>Graphiques Statistiques</h3>
              <div class="stat-grid">
                <iframe src="//mali.opendataforafrica.org/resource/embed/wlctayg/b0807baf-bb5c-067a-c17c-41762ddff3e6?&userKey=0" style="height:240px; width:100%" scrolling="no" frameborder="0"></iframe>
                <iframe src="//mali.opendataforafrica.org/resource/embed/wlctayg/1f67d338-1ab3-a506-93ec-44ce0d368422?&userKey=0" style="height:240px; width:100%" scrolling="no" frameborder="0"></iframe>
                <iframe src="//mali.opendataforafrica.org/resource/embed/wlctayg/32b0fee1-189f-5471-3554-f953e255c31d?&userKey=0" style="height:318px; width:100%" scrolling="no" frameborder="0"></iframe>
                <iframe src="//mali.opendataforafrica.org/resource/embed/wlctayg/fdbd0357-f955-1546-1ca8-7c289b1a6653?&userKey=0" style="height:250px; width:100%" scrolling="no" frameborder="0"></iframe>
              </div>
            </div>
          `;
      }
      sharedPanel.classList.add('active');
      attachEventHandlers();
    }, 300);
  }
}

function toggleSubOptions(element) {
  const subOptions = element.nextElementSibling;
  const icon = element.querySelector('.icon');
  if (subOptions.classList.contains('active')) {
    subOptions.classList.remove('active');
    if (icon) icon.classList.remove('open');
  } else {
    document.querySelectorAll('.sub-filter-options').forEach(so => {
      so.classList.remove('active');
      if (so.previousElementSibling.querySelector('.icon')) {
        so.previousElementSibling.querySelector('.icon').classList.remove('open');
      }
    });
    subOptions.classList.add('active');
    if (icon) icon.classList.add('open');
  }
}

// Attache les gestionnaires de clic sur les filtres
function attachEventHandlers() {
  // Sous-boutons démographie
  document.querySelectorAll('.sub-filter-button').forEach(button => {
    button.addEventListener('click', function () {
      const layerKey = this.getAttribute('data-layer');
      const attribute = this.getAttribute('data-attribute');
      const layerId = `layer-${layerKey}`;

      // Supprimer les autres couches démographiques
      for (let key in map._layers) {
        if (map._layers[key].options && map._layers[key].options.layerId && map._layers[key].options.layerId.startsWith('layer-')) {
          map.removeLayer(map._layers[key]);
        }
      }

      // Désactivation si déjà actif
      if (this.classList.contains('active')) {
        map.removeLayer(map[layerId]);
        delete map[layerId];
        this.classList.remove('active');
        if (map.legendControl) {
          document.body.removeChild(map.legendControl.getContainer());
          map.legendControl = null;
        }
      } else {
        document.querySelectorAll('.sub-filter-button').forEach(btn => btn.classList.remove('active'));
        loadGeoJSONLayerWithStyling(layerKey, attribute);
        this.classList.add('active');
      }
    });
  });

  // Gestionnaire de clic pour filtres simples (géographie, etc.)
  document.querySelectorAll('.filter-button[data-layer]').forEach(button => {
    button.addEventListener('click', function () {
      const layerKey = this.getAttribute('data-layer');
      const layerId = `layer-${layerKey}`;

      if (map[layerId]) {
        map.removeLayer(map[layerId]);
        delete map[layerId];
        this.classList.remove('active');
      } else {
        if (layersConfig.some(cfg => cfg.name === layerKey)) {
          loadLayer(layerKey);
          this.classList.add('active');
        } else {
          console.error(`La couche ${layerKey} n'est pas configurée.`);
        }
      }
    });
  });

  // Fermer d'autres filtres déployés
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', function () {
      document.querySelectorAll('.filter-button').forEach(btn => {
        if (btn !== this) {
          const subOptions = btn.nextElementSibling;
          const icon = btn.querySelector('.icon');
          if (subOptions && subOptions.classList.contains('active')) {
            subOptions.classList.remove('active');
            icon && icon.classList.remove('open');
          }
        }
      });
    });
  });
}

/* ====================
   LEAFLET.PM
   ==================== */
// On peut désactiver par défaut le dessin
map.pm.disableDraw('Marker');
map.pm.disableDraw('Line');
map.pm.disableDraw('Polygon');

/* ====================
   CONFIG DES COUCHES
   ==================== */
const layersConfig = [
  {
    url: 'http://localhost:7800/public.batiment/{z}/{x}/{y}.pbf',
    name: 'batiment',
    type: 'vectortile'
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.pays/items?limit=999999',
    name: 'Couche_Pop_Pays',
    type: 'polygon',
    nameProperty: 'Nom_Pays'
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.region/items?limit=999999',
    name: 'Couche_Pop_Region',
    type: 'polygon',
    nameProperty: 'Nom_Region'
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.departement/items?limit=999999',
    name: 'Couche_pop_departement',
    type: 'polygon',
    nameProperty: 'Nom_Departement'
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.commune%20/items?limit=999999',
    name: 'Couche_Pop_Commune',
    type: "polygon",
    nameProperty: "Nom_Commune"
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.finance/items?limit=999999',
    name: 'finance',
    type: 'point',
    cluster: true
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.place_publique/items?limit=999999',
    name: 'place_publique',
    type: 'point',
    cluster: true
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.sante/items?limit=999999',
    name: 'sante',
    type: 'point',
    cluster: true
  },
  {
    url: 'http://localhost:7800/public.route/{z}/{x}/{y}.pbf',
    name: 'route',
    type: 'vectortile',
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-7800.app.github.dev/public.rail/{z}/{x}/{y}.pbf',
    name: 'rail',
    type: 'vectortile'
  }
  ,
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.education/items?limit=999999',
    name: 'education',
    type: 'point',
    cluster: true
  },
  {
    url: 'https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.point_interet/items?limit=999999',
    name: 'point_interet',
    type: 'point',
    cluster: true
  },
  {
    url: 'http://localhost:7800/public.hydrographie_ligne/{z}/{x}/{y}.pbf',
    name: 'hydrographie_ligne',
    type: 'vectortile'
  },
  {
    url: 'http://localhost:7800/public.hydrographie_polygone/{z}/{x}/{y}.pbf',
    name: 'hydrographie_polygone',
    type: 'vectortile'
  }
];

const layers = {};

function loadLayer(layerName) {
  const config = layersConfig.find(cfg => cfg.name === layerName);
  if (!config) {
    console.error(`Configuration non trouvée pour la couche ${layerName}`);
    return;
  }
  if (config.type === 'vectortile') {
    loadVectorTileLayer(config);
  } else {
    fetchData(config);
  }
}

function loadVectorTileLayer(config) {
  const { name, url } = config;

  // Créer un LayerGroup si pas déjà fait
  if (!layers[name]) layers[name] = L.layerGroup();

  // Retirer la couche si elle est déjà sur la carte
  if (map[`layer-${name}`]) {
    map.removeLayer(map[`layer-${name}`]);
  }

  // Créer la couche VectorTile
  let vtLayer = L.vectorGrid.protobuf(url, {
    minZoom: 0,
    maxNativeZoom: 22,
    maxZoom: 22,
    interactive: true,
    vectorTileLayerStyles: {
      'public.batiment': {
        weight: 1.5,
        color: 'blue',
        fillColor: 'rgba(0, 0, 255, 0.2)',
        fillOpacity: 0.3
      },
      'public.hydrographie_ligne': {
        color: 'blue',
        weight: 2
      },
      'public.hydrographie_polygone': {
        weight: 1,
        color: 'navy',
        fillColor: 'rgba(0,0,200,0.3)',
        fillOpacity: 0.5
      },
      '*': {
        weight: 1,
        color: '#555',
        fillColor: '#ddd',
        fillOpacity: 0.2
      }
    }
  });




  // Au clic sur un feature
  vtLayer.on('click', function (e) {
    // Propriétés de l'objet cliqué
    let prop = e.layer.properties;

    // Vérifie si cette couche est dans editableLayersConfig
    const isEditable = editableLayersConfig.some(cfg => cfg.name === name);

    // Si on est en mode sélection ET que la couche est éditable
    if (window.selectionModeActive && isEditable) {
      // Popup "Modifier / Supprimer"
      // Adaptez selon vos vrais champs (nom, Nom_Region, etc.)
      // 1) Récupérer l'id et le nom
      const featureId = prop.id;  // identifiant unique
      const entityName = prop.nom || prop.Nom_Region || prop.Nom_Departement || name;

      // 2) Générer la popup
      // On appelle plutôt la fonction "deleteVectorTile(featureId, tableName)"
      const popupContent = `
  <div>
    <strong>${entityName}</strong><br/>
    <button onclick="editVectorTile('${featureId}','${name}')">📝 Modifier</button>
    <button onclick="deleteVectorTile('${featureId}','${name}')">🗑️ Supprimer</button>
  </div>
`;


      L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);

    } else {
      // Sinon, popup "normale" (votre ancien code)
      let popupContent = `<b>${name}</b><br/>`;
      if (prop) {
        popupContent += '<hr/>';
        for (let k in prop) {
          popupContent += `<b>${k}</b>: ${prop[k]}<br/>`;
        }
      }
      L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);
    }
  });

  // Ajoute la couche au LayerGroup et à la carte
  layers[name].addLayer(vtLayer);
  map[`layer-${name}`] = layers[name];
  map.addLayer(layers[name]);
}

async function editVectorTile(featureId, tableName) {
  try {
    // EXEMPLE d'URL pour récupérer le GeoJSON unique :
    // http://localhost:9000/collections/public.<tableName>/items/<featureId>?f=json
    const url = `https://organic-trout-g4rr47j5p4xph54j-9000.app.github.dev/collections/public.${tableName}/items/${featureId}?f=json`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Erreur GET entité VectorTile");
    const singleGeoJSON = await resp.json();

    // Supprimer l'ancien editable s'il existe
    if (window.currentEditable) {
      map.removeLayer(window.currentEditable);
      window.currentEditable = null;
    }

    // Afficher en rouge
    window.currentEditable = L.geoJSON(singleGeoJSON, {
      style: { color: 'red', weight: 2 }
    }).addTo(map);

    // Activer l’édition (Leaflet.PM)
    window.currentEditable.pm.enable({ allowSelfIntersection: false });

    window.currentFeatureId = featureId;
    window.currentTableName = tableName;

    alert("Entité chargée en édition. Modifiez puis cliquez sur 'Enregistrer' !");
  } catch (err) {
    alert("Erreur : " + err.message);
  }
}


async function saveCurrentVectorEdit() {
  if (!window.currentEditable) {
    alert("Aucune entité vectortile en cours d'édition !");
    return;
  }
  const updatedGeoJSON = window.currentEditable.toGeoJSON();
  const fid = window.currentFeatureId;
  const tName = window.currentTableName;

  try {
    const resp = await fetch(`https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/api/${tName}/${fid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedGeoJSON)
    });
    if (!resp.ok) throw new Error("Echec update vectortile");
    alert("Mise à jour OK !");

    // Retirer la feature locale
    map.removeLayer(window.currentEditable);
    window.currentEditable = null;
    window.currentFeatureId = null;

    // Recharger la couche VectorTile
    loadLayer(tName);
  } catch (err) {
    alert("Erreur : " + err.message);
  }
}


async function deleteVectorTile(featureId, tableName) {
  if (!confirm("Supprimer cette entité ?")) return;
  try {
    const resp = await fetch(`https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/api/${tableName}/${featureId}`, {
      method: 'DELETE',
      credentials: 'include' // 🔥 cette ligne est essentielle
    });
    if (!resp.ok) throw new Error("Echec suppression");
    alert("Entité supprimée !");

    // Recharger la couche vectortile
    loadLayer(tableName);
  } catch (err) {
    alert("Erreur : " + err.message);
  }
}



// GeoJSON
function fetchData(config) {
  const { url, name } = config;
  fetch(url)
    .then(resp => {
      if (!resp.ok) throw new Error(`Erreur lors du chargement de ${name}`);
      return resp.json();
    })
    .then(data => {
      let geoJSONData;
      if (data.type && data.type === 'FeatureCollection') {
        geoJSONData = data;
      } else {
        geoJSONData = transformToGeoJSON(data);
      }
      loadData(geoJSONData, config);
    })
    .catch(err => console.error(`Erreur chargement ${name}:`, err));
}

function loadData(geoJSONData, config) {
  const { name, cluster: useCluster, heatmap: useHeatmap } = config;

  // === Injection de layerName dans chaque feature ===
  geoJSONData.features.forEach(f => {
    // On stocke la valeur "finance", "sante", "point_interet", etc.
    if (!f.properties.layerName) {
      f.properties.layerName = name;
    }
    // Si besoin, injecter un id si vous ne l'avez pas déjà
    // if (!f.properties.id) {
    //   f.properties.id = ...; // ex : f.properties.pk ou un identifiant unique
    // }
  });

  // === Création de la couche (inchangé) ===
  if (!layers[name]) layers[name] = L.layerGroup();
  map.addLayer(layers[name]);
  map[`layer-${name}`] = layers[name];

  let layer;
  if (useCluster) {
    layer = loadClusterLayer(geoJSONData, name);
  } else if (useHeatmap) {
    layer = loadHeatmapLayer(geoJSONData);
  } else {
    layer = L.geoJSON(geoJSONData, {
      style: getStyleForLayer(name),
      onEachFeature: createOnEachFeature(name)
    });
  }
  layers[name].addLayer(layer);

  try {
    map.fitBounds(layers[name].getBounds());
  } catch (e) {
    console.warn("Impossible de centrer sur la couche", name, e);
  }
}


function getEntityName(properties, layerKey) {
  const config = layersConfig.find(cfg => cfg.name === layerKey);
  if (!config) return 'Non disponible';
  const nameProp = config.nameProperty || 'nom';
  return properties[nameProp] || 'Non disponible';
}

function createOnEachFeature(layerKey) {
  return function (feature, layer) {
    // Vérifie si la couche est éditable
    const isEditable = editableLayersConfig.some(cfg => cfg.name === layerKey);
    const props = feature.properties;

    layer.on('click', function (e) {
      // Si c'est une couche éditable ET qu'on est en mode sélection
      if (isEditable && window.selectionModeActive) {
        // Popup "Modifier / Supprimer"
        layer.unbindPopup();
        // 1) On récupère l'id et le nom
        const featureId = props.id;  // c’est la PK en base
        const entityName = props.nom || getEntityName(props, layerKey) || "Entité";

        // 2) On génère la popup
        const popupContent = `
  <div>
    <strong>${entityName}</strong><br/>
    <button onclick="modifyEntity('${featureId}')">📝 Modifier</button>
    <button onclick="deleteEntity('${featureId}')">🗑️ Supprimer</button>
  </div>
`;

        layer.bindPopup(popupContent).openPopup(e.latlng);

      } else {
        // Popup normale (tableau)
        layer.unbindPopup();
        const name = getEntityName(props, layerKey);
        let popupContent = '<table>';
        popupContent += `<tr><th>Nom</th><td>${name}</td></tr>`;
        for (let k in props) {
          if (k !== (layersConfig.find(c => c.name === layerKey)?.nameProperty)) {
            popupContent += `<tr><th>${k}</th><td>${props[k]}</td></tr>`;
          }
        }
        popupContent += '</table>';
        layer.bindPopup(popupContent).openPopup(e.latlng);
      }
    });
  };
}



function modifyEntity(featureId) {
  console.log("Modifier l'entité avec l'id :", featureId);

  // Recherche de la feature dans toutes les couches de la carte
  let foundLayer = null;
  map.eachLayer(function (layer) {
    // On vérifie les couches de type GeoJSON ou LayerGroup avec des features
    if (layer.eachLayer && typeof layer.eachLayer === 'function') {
      layer.eachLayer(function (featureLayer) {
        if (
          featureLayer.feature &&
          featureLayer.feature.properties &&
          featureLayer.feature.properties.id == featureId
        ) {
          foundLayer = featureLayer;
        }
      });
    }
  });

  if (!foundLayer) {
    alert("Entité non trouvée pour modification.");
    return;
  }

  // Récupération du nom de la table (ou de la couche) pour cette feature
  const tableName = foundLayer.feature.properties.layerName;
  if (!tableName) {
    alert("La propriété 'layerName' est manquante sur l'entité.");
    return;
  }

  // Mise à jour du sélecteur de couche dans le panneau d'édition
  layerChoice.value = tableName;
  applyLayerChoice(tableName);

  // Pré-remplissage des champs du formulaire selon la configuration éditable
  const cfg = editableLayersConfig.find(e => e.name === tableName);
  if (cfg) {
    cfg.fields.forEach(f => {
      const inputField = document.getElementById('field_' + f);
      if (inputField && foundLayer.feature.properties[f] !== undefined) {
        inputField.value = foundLayer.feature.properties[f];
      }
    });
  }

  // Stocker la feature modifiée dans lastCreatedLayer pour que le bouton "Enregistrer" effectue une mise à jour
  lastCreatedLayer = foundLayer;

  // Active le mode édition Leaflet.PM sur cette feature pour permettre son déplacement ou redessin
  foundLayer.pm.enable({
    allowSelfIntersection: false
  });

  // Afficher le panneau d'édition et mettre à jour l'interface
  editPanel.style.display = 'block';
  toggleEditBtn.style.backgroundColor = '#e67e22';
  alert("Le panneau d'édition est ouvert. Vous pouvez modifier la géométrie et les attributs.");
}


function deleteEntity(entityName) {
  console.log("Supprimer l'entité :", entityName);
  // Ici, on codera la logique de suppression (Étape 4)
}


function getStyleForLayer(layerName) {
  switch (layerName) {
    case 'rail':
      return { color: '#8B0000', weight: 3, dashArray: '5,5' };
    case 'route':
      return { color: '#0000FF', weight: 2 };
    case 'hydrographie_ligne':
      return { color: '#0000FF', weight: 2 };
    case 'hydrographie_polygone':
      return { color: '#1E90FF', weight: 2, fillColor: '#1E90FF', fillOpacity: 0.5 };
    default:
      return { color: 'blue', weight: 2 };
  }
}


async function deleteEntity(featureId) {
  console.log("Supprimer l'entité avec l'id :", featureId);

  // 1) Retrouver la feature dans la carte
  let foundLayer = null;
  map.eachLayer(function (layer) {
    if (layer.eachLayer && typeof layer.eachLayer === 'function') {
      layer.eachLayer(function (featureLayer) {
        if (
          featureLayer.feature &&
          featureLayer.feature.properties &&
          featureLayer.feature.properties.id == featureId
        ) {
          foundLayer = featureLayer;
        }
      });
    }
  });

  if (!foundLayer) {
    alert("Impossible de trouver l'entité à supprimer.");
    return;
  }

  if (!confirm("Voulez-vous vraiment supprimer cette entité ?")) {
    return;
  }

  const tableName = foundLayer.feature.properties.layerName;
  if (!tableName) {
    alert("La propriété 'layerName' est manquante sur l'entité.");
    return;
  }

  try {
    // 🔥🔥🔥 La ligne suivante est ESSENTIELLE :
    const resp = await fetch(`https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/api/${tableName}/${featureId}`, {
      method: 'DELETE',
      credentials: 'include' // ✅ Ajoute cette ligne pour envoyer les cookies !
    });

    if (!resp.ok) {
      throw new Error("Erreur lors de la suppression dans la base");
    }

    console.log("Suppression OK pour ID =", featureId);
    foundLayer.remove();
    alert("Entité supprimée avec succès.");

  } catch (err) {
    console.error(err);
    alert("Erreur de suppression : " + err.message);
  }
}



// Cluster
function loadClusterLayer(geoJSONData, layerKey) {
  const markers = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      const childCount = cluster.getChildCount();
      let size = 'small';
      if (childCount >= 10 && childCount < 100) size = 'medium';
      else if (childCount >= 100) size = 'large';
      const c = ' cluster-' + size;
      return new L.DivIcon({
        html: '<div><span>' + childCount + '</span></div>',
        className: 'marker-cluster' + c,
        iconSize: new L.Point(40, 40)
      });
    }
  });
  const customIcon = getCustomIcon(layerKey);
  const geoJsonLayer = L.geoJSON(geoJSONData, {
    pointToLayer: (feature, latlng) => L.marker(latlng, { icon: customIcon }),
    onEachFeature: createOnEachFeature(layerKey)
  });
  markers.addLayer(geoJsonLayer);

  // Exemple : survol cluster education => hull
  if (layerKey === 'education') {
    markers.on('clustermouseover', (a) => {
      const cluster = a.layer;
      const list = cluster.getAllChildMarkers();
      const latlngs = list.map(m => m.getLatLng());
      const hull = L.polygon(L.convexHull(latlngs), { color: '#FF7800', weight: 2 });
      map.addLayer(hull);
      cluster.hull = hull;
    });
    markers.on('clustermouseout', (a) => {
      const cluster = a.layer;
      if (cluster.hull) {
        map.removeLayer(cluster.hull);
        cluster.hull = null;
      }
    });
  }

  return markers;
}

function getCustomIcon(layerKey) {
  let iconUrl;
  switch (layerKey) {
    case 'finance': iconUrl = 'vignette_photo/finance.png'; break;
    case 'place_publique': iconUrl = 'vignette_photo/palce_pub.png'; break;
    case 'sante': iconUrl = 'vignette_photo/sante.png'; break;
    case 'education': iconUrl = 'vignette_photo/education.png'; break;
    case 'point_interet': iconUrl = 'vignette_photo/lieux.png'; break;
    default: iconUrl = 'icons/default.png';
  }
  return L.icon({
    iconUrl,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
}

// Heatmap
function loadHeatmapLayer(geoJSONData) {
  const heatArray = geoJSONData.features.map(f => [
    f.geometry.coordinates[1],
    f.geometry.coordinates[0],
    1
  ]);
  return L.heatLayer(heatArray, { radius: 25 });
}

// Transform JSON => GeoJSON
function transformToGeoJSON(data) {
  if (!Array.isArray(data) && !data.features) {
    console.warn("Le format JSON retourné n'est pas reconnu comme FeatureCollection ni tableau.");
    return { type: "FeatureCollection", features: [] };
  }
  if (data.features) {
    return data;
  } else {
    return {
      type: "FeatureCollection",
      features: data.map(item => ({
        type: "Feature",
        geometry: item.geom || item.geometry,
        properties: item
      }))
    };
  }
}

/* ============================
   STYLAGE DYNAMIQUE DÉMOGRAPHIE
   ============================ */
function loadGeoJSONLayerWithStyling(layerKey, attribute) {
  const config = layersConfig.find(cfg => cfg.name === layerKey);
  if (!config) {
    console.error(`Configuration non trouvée pour la couche ${layerKey}`);
    return;
  }
  fetch(config.url)
    .then(resp => resp.json())
    .then(data => {
      let geoJSONData;
      if (data.type === 'FeatureCollection') geoJSONData = data;
      else geoJSONData = transformToGeoJSON(data);

      const values = geoJSONData.features
        .map(f => parseFloat(f.properties[attribute]))
        .filter(v => !isNaN(v));

      if (values.length === 0) {
        throw new Error(`L'attribut ${attribute} est manquant ou non numérique dans la couche ${layerKey}`);
      }
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      const colorScale = getColorScale(layerKey, attribute, minValue, maxValue);

      if (layerKey !== 'Couche_Pop_Pays') {
        if (map.legendControl) {
          document.body.removeChild(map.legendControl.getContainer());
          map.legendControl = null;
        }
        addLegend(map, layerKey, attribute, colorScale, minValue, maxValue);
      }

      let selectedFeature = null;
      const geoJsonLayer = L.geoJSON(geoJSONData, {
        style: feat => {
          const val = parseFloat(feat.properties[attribute]);
          return {
            color: 'black',
            weight: 1,
            fillColor: colorScale(val),
            fillOpacity: 0.7
          };
        },
        onEachFeature: (feat, lyr) => {
          lyr.on('click', e => {
            if (selectedFeature) geoJsonLayer.resetStyle(selectedFeature);
            lyr.setStyle({ weight: 5, color: '#666', dashArray: '', fillOpacity: 0.7 });
            selectedFeature = lyr;
            if (currentChartWindow) document.body.removeChild(currentChartWindow);
            showStatisticalGraph(layerKey, attribute, feat, e.latlng);
          });
          lyr.on('mouseover', e => {
            lyr.setStyle({ weight: 3, color: '#666', dashArray: '', fillOpacity: 0.7 });
          });
          lyr.on('mouseout', e => {
            if (selectedFeature !== lyr) geoJsonLayer.resetStyle(lyr);
          });
        }
      });
      const layerId = `layer-${layerKey}`;
      if (map[layerId]) map.removeLayer(map[layerId]);
      geoJsonLayer.options.layerId = layerId;
      map.addLayer(geoJsonLayer);
      map[layerId] = geoJsonLayer;

      map.fitBounds(geoJsonLayer.getBounds());
    })
    .catch(err => console.error(`Erreur couche ${layerKey} :`, err));
}

function getColorScale(layerKey, attribute, minValue, maxValue) {
  let colorScale;
  const colorPalettes = {
    'Couche_Pop_Commune_Pop total': ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'],
    'Couche_Pop_Commune_Pop homme': ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#005824'],
    'Couche_Pop_Commune_Pop femme': ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#6e016b'],

    'Couche_pop_departement_Population_Totale': ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e'],
    'Couche_pop_departement_Population_Hommes': ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#034e7b'],
    'Couche_pop_departement_Population_Femmes': ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],

    'Couche_Pop_Region_Population_Totale': ['#03071e', '#370617', '#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffba08'],
    'Couche_Pop_Region_Population_Hommes': ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#a4ac86', '#656d4a', '#414833', '#333d29'],
    'Couche_Pop_Region_Population_Femmes': ['#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00', '#ca6702', '#bb3e03', '#ae2012', '#9b2226'],

    'Couche_Pop_Pays_Population_Totale': ['#f5f5f5']
  };
  const key = `${layerKey}_${attribute}`;
  const palette = colorPalettes[key];
  if (palette) {
    colorScale = chroma.scale(palette).domain([minValue, maxValue]);
  } else {
    colorScale = chroma.scale('YlOrRd').domain([minValue, maxValue]);
  }
  return function (value) {
    return colorScale(value).hex();
  };
}

function addLegend(map, layerKey, attribute, colorScale, minValue, maxValue) {
  const legendDiv = L.DomUtil.create('div', 'info legend legend-window');
  const steps = 7;
  const grades = [];
  for (let i = 0; i < steps; i++) {
    grades.push(minValue + i * (maxValue - minValue) / (steps - 1));
  }
  for (let i = 0; i < grades.length; i++) {
    let fromVal = grades[i];
    let toVal = grades[i + 1];
    legendDiv.innerHTML +=
      '<i style="background:' + colorScale(fromVal) + '"></i> '
      + Math.round(fromVal) + (toVal ? '&ndash;' + Math.round(toVal) + '<br>' : '+');
  }
  document.body.appendChild(legendDiv);
  makeElementDraggable(legendDiv);
  map.legendControl = {
    getContainer: function () { return legendDiv; }
  };
}

// Fenêtre statistique Chart.js
let currentChartWindow = null;
function showStatisticalGraph(layerKey, attribute, selectedFeature, latlng) {
  const config = layersConfig.find(config => config.name === layerKey);
  if (!config) {
    console.error(`Configuration non trouvée pour la couche ${layerKey}`);
    return;
  }

  fetch(config.url)
    .then(response => response.json())
    .then(data => {
      let geoJSONData;
      if (data.type && data.type === 'FeatureCollection') {
        geoJSONData = data;
      } else {
        geoJSONData = transformToGeoJSON(data);
      }
      let labels = [];
      let values = [];

      if (layerKey === 'Couche_Pop_Pays') {
        labels = ['Population Totale', 'Population Hommes', 'Population Femmes'];
        const properties = selectedFeature.properties;
        values = [
          parseFloat(properties['Population_Totale']) || 0,
          parseFloat(properties['Population_Hommes']) || 0,
          parseFloat(properties['Population_Femmes']) || 0
        ];
      } else if (selectedFeature) {
        const selectedCentroid = getCentroid(selectedFeature.geometry);
        if (!selectedCentroid) {
          console.error('Centroid non disponible');
          return;
        }
        const entitiesWithDistance = geoJSONData.features.map(feature => {
          const centroid = getCentroid(feature.geometry);
          if (!centroid) return { feature: feature, distance: Infinity };
          const distance = getDistance(selectedCentroid, centroid);
          return { feature: feature, distance: distance };
        });
        entitiesWithDistance.sort((a, b) => a.distance - b.distance);
        const nearestEntities = entitiesWithDistance.filter(ewd => getEntityName(ewd.feature.properties, layerKey) !== getEntityName(selectedFeature.properties, layerKey)).slice(0, 8);
        nearestEntities.unshift({ feature: selectedFeature, distance: 0 });
        labels = nearestEntities.map(ewd => getEntityName(ewd.feature.properties, layerKey));
        values = nearestEntities.map(ewd => {
          const value = parseFloat(ewd.feature.properties[attribute]);
          return isNaN(value) ? 0 : value;
        });
      } else {
        labels = geoJSONData.features.map(feature => getEntityName(feature.properties, layerKey));
        values = geoJSONData.features.map(feature => {
          const value = parseFloat(feature.properties[attribute]);
          return isNaN(value) ? 0 : value;
        });
      }

      const chartWindow = document.createElement('div');
      chartWindow.className = 'chart-window';
      chartWindow.innerHTML = `
          <div class="chart-window-header">
            <span>Graphique Statistique</span>
            <button class="close-button">&times;</button>
          </div>
          <div class="chart-window-content">
            <canvas id="chartCanvas"></canvas>
          </div>
        `;
      document.body.appendChild(chartWindow);

      makeElementDraggable(chartWindow);

      chartWindow.querySelector('.close-button').addEventListener('click', function () {
        document.body.removeChild(chartWindow);
        currentChartWindow = null;
      });

      const point = map.latLngToContainerPoint(latlng);
      chartWindow.style.left = (point.x + 20) + 'px';
      chartWindow.style.top = (point.y - chartWindow.offsetHeight / 2) + 'px';

      if (parseInt(chartWindow.style.left) + chartWindow.offsetWidth > window.innerWidth) {
        chartWindow.style.left = (point.x - chartWindow.offsetWidth - 20) + 'px';
      }
      if (parseInt(chartWindow.style.top) + chartWindow.offsetHeight > window.innerHeight) {
        chartWindow.style.top = (window.innerHeight - chartWindow.offsetHeight - 20) + 'px';
      }
      if (parseInt(chartWindow.style.top) < 0) {
        chartWindow.style.top = '20px';
      }

      currentChartWindow = chartWindow;

      const ctx = chartWindow.querySelector('#chartCanvas').getContext('2d');
      let selectedIndex = labels.findIndex(label => label === getEntityName(selectedFeature.properties, layerKey));

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: attribute,
            data: values,
            backgroundColor: labels.map((label, index) => index === selectedIndex ? 'red' : 'blue')
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 90,
                minRotation: 45,
                font: {
                  size: layerKey.startsWith('Couche_Pop_Commune') || layerKey.startsWith('Couche_pop_departement') ? 8 : 12
                }
              }
            }
          }
        }
      });
      const resizeObserver = new ResizeObserver(() => {
        chart.resize();
      });
      resizeObserver.observe(chartWindow);
    })
    .catch(error => {
      console.error('Erreur Graphique:', error);
    });
}

function getCentroid(geometry) {
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates[0];
    let xSum = 0, ySum = 0, n = coords.length;
    for (let i = 0; i < n; i++) {
      xSum += coords[i][0];
      ySum += coords[i][1];
    }
    return [xSum / n, ySum / n];
  } else if (geometry.type === 'MultiPolygon') {
    const coords = geometry.coordinates[0][0];
    let xSum = 0, ySum = 0, n = coords.length;
    for (let i = 0; i < n; i++) {
      xSum += coords[i][0];
      ySum += coords[i][1];
    }
    return [xSum / n, ySum / n];
  }
  return null;
}

function getDistance(coord1, coord2) {
  const lat1 = coord1[1];
  const lon1 = coord1[0];
  const lat2 = coord2[1];
  const lon2 = coord2[0];
  const dx = lon2 - lon1;
  const dy = lat2 - lat1;
  return Math.sqrt(dx * dx + dy * dy);
}

function makeElementDraggable(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = elmnt.querySelector('.chart-window-header') || elmnt.querySelector('.legend-window');
  if (header) {
    header.onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/* ====================
   GESTION DU CHOIX DE FOND DE CARTE
   ==================== */
var layersDiv = document.getElementById('mapLayersList');
for (let layerName in baseMaps) {
  let layerButton = document.createElement('div');
  layerButton.className = 'layer-button';
  layerButton.style.cursor = 'pointer';
  let layerThumbnail = document.createElement('img');
  layerThumbnail.src = getThumbnailUrl(layerName);
  layerButton.appendChild(layerThumbnail);

  layerButton.onclick = (function (layer) {
    return function () {
      map.eachLayer(function (curLayer) {
        if (curLayer instanceof L.TileLayer && !(curLayer instanceof L.TileLayer.WMS)) {
          map.removeLayer(curLayer);
        }
      });
      layer.addTo(map);
    };
  })(baseMaps[layerName]);
  layersDiv.appendChild(layerButton);
}
document.getElementById('toggleBaseLayer').addEventListener('click', function () {
  layersDiv.classList.toggle('open');
});

function getThumbnailUrl(layerName) {
  switch (layerName) {
    case "Google Streets": return 'vignette_photo/google_street_map.png';
    case "OpenStreetMap": return 'vignette_photo/OSM.png';
    case "CartoDB Positron": return 'vignette_photo/CARTO.png';
    case "Esri World Imagery": return 'vignette_photo/ESRI.png';
    case "OpenTopoMap": return 'vignette_photo/TOPO.png';
    default: return 'vignette_photo/default_thumbnail.png';
  }
}

// CHARGEMENT PAR DÉFAUT d’une couche (exemple)
loadGeoJSONLayerWithStyling('Couche_Pop_Pays', 'Population_Totale');

/* =============================================
   =============  MODE ÉDITION  ================
   ============================================= */

// État du mode Édition
let editMode = false;
const editPanel = document.getElementById('editPanel');
const closeEditPanelBtn = document.getElementById('closeEditPanel');
const layerChoice = document.getElementById('layerChoice');
const fieldsContainer = document.getElementById('fieldsContainer');
const saveFeatureBtn = document.getElementById('saveFeatureBtn');
let lastCreatedLayer = null;

// Variable globale pour stocker le type de géométrie sélectionné
let selectedGeometryType = null;

// Couches éditables + champs
const editableLayersConfig = [
  { name: 'finance', geometryType: 'Point', fields: ['nom'] },
  { name: 'sante', geometryType: 'Point', fields: ['nom'] },
  { name: 'batiment', geometryType: 'MultiPolygon', fields: ['type'] },
  { name: 'rail', geometryType: 'LineString', fields: ['nom'] },
  { name: 'route', geometryType: 'LineString', fields: ['nom', 'classification'] },
  { name: 'place_publique', geometryType: 'Point', fields: ['nom'] },
  { name: 'point_interet', geometryType: 'Point', fields: ['nom'] },
  { name: 'hydrographie_ligne', geometryType: 'MultiLineString', fields: ['nom'] },
  { name: 'hydrographie_polygone', geometryType: 'MultiPolygon', fields: ['nom'] },
  { name: 'education', geometryType: 'Point', fields: ['nom'] }
];


const toggleEditBtn = document.getElementById('toggleEditMode');

toggleEditBtn.addEventListener('click', async function () {
  try {
    // 🔁 Vérifie l’authentification côté serveur (important après un refresh)
    const response = await fetch('https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/check-auth', {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.authenticated) {
      window.isAuthenticated = true;
      editMode = !editMode;

      if (editMode) {
        toggleEditBtn.style.backgroundColor = '#e67e22';
        editPanel.style.display = 'block';
        enableEditingUI();
      } else {
        toggleEditBtn.style.backgroundColor = '#1c6fce';
        editPanel.style.display = 'none';
        disableEditingUI();
      }

      document.getElementById('logoutBtn').style.display = 'inline-flex';
    } else {
      // ❌ Pas connecté → ouvrir la pop-up de login
      const loginWindow = window.open(
        'https://organic-trout-g4rr47j5p4xph54j-3001.app.github.dev/?from=edit',
        '_blank',
        'width=500,height=600'
      );
      if (!loginWindow) {
        alert("La fenêtre de connexion a été bloquée. Autorise les pop-ups.");
      }
    }
  } catch (err) {
    console.error("Erreur lors de la vérification d’authentification :", err);
    alert("Erreur réseau lors de la vérification de session.");
  }
});


window.addEventListener('message', (event) => {
  if (event.origin !== 'https://organic-trout-g4rr47j5p4xph54j-3001.app.github.dev') return;

  if (event.data === 'auth-success-edit') {
    console.log("✅ Authentification réussie → activation du mode édition");

    window.isAuthenticated = true;
    editMode = true;

    toggleEditBtn.style.backgroundColor = '#e67e22';
    editPanel.style.display = 'block';
    enableEditingUI();

    document.getElementById('logoutBtn').style.display = 'inline-flex';
  }
});


document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch('https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/logout', {
      method: 'POST',
      credentials: 'include'
    });

    // 👉 Cache le bouton après déconnexion
    document.getElementById('logoutBtn').style.display = 'none';

    // 👉 Réinitialise le mode édition
    editMode = false;
    disableEditingUI();
    editPanel.style.display = 'none';
    toggleEditBtn.style.backgroundColor = '#1c6fce';

    alert("Vous avez été déconnecté !");
  } catch (err) {
    alert("Erreur lors de la déconnexion.");
  }
});


// Bouton "X" pour fermer le panel
closeEditPanelBtn.addEventListener('click', () => {
  editMode = false;
  disableEditingUI();
  toggleEditBtn.style.backgroundColor = '#1c6fce';
  editPanel.style.display = 'none';
});

// Rendre le panel draggable
makePanelDraggable(editPanel, document.getElementById('editPanelHeader'));
function makePanelDraggable(panel, handle) {
  let offsetX = 0, offsetY = 0, posX = 0, posY = 0;
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    posX = e.clientX;
    posY = e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = dragElement;
  }

  function dragElement(e) {
    e.preventDefault();
    offsetX = posX - e.clientX;
    offsetY = posY - e.clientY;
    posX = e.clientX;
    posY = e.clientY;
    panel.style.top = (panel.offsetTop - offsetY) + "px";
    panel.style.left = (panel.offsetLeft - offsetX) + "px";
  }

  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Quand on change la liste de couches
layerChoice.addEventListener('change', () => {
  applyLayerChoice(layerChoice.value);
});

// Bouton "Enregistrer"
// Bouton "Enregistrer"
saveFeatureBtn.addEventListener('click', async () => {
  if (!lastCreatedLayer) {
    alert("Aucune forme à enregistrer !");
    return;
  }

  // Nom de la couche
  const chosenName = layerChoice.value;
  const cfg = editableLayersConfig.find(e => e.name === chosenName);
  if (!cfg) {
    alert("Couche inconnue : " + chosenName);
    return;
  }

  // Récupérer la GeoJSON finale
  const updatedGeojson = lastCreatedLayer.toGeoJSON();

  // Mettre à jour les champs depuis le formulaire
  cfg.fields.forEach(f => {
    const val = document.getElementById('field_' + f).value.trim();
    updatedGeojson.properties[f] = val;
  });

  // Vérifier si on a déjà un id
  const existingId = updatedGeojson.properties.id;

  try {
    let resp;
    if (existingId) {
      // === Objet EXISTANT : on fait un PUT
      resp = await fetch(`https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/api/${chosenName}/${existingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGeojson),
        credentials: 'include'  // 🔥 nécessaire
      });
      if (!resp.ok) throw new Error("Erreur update");
      alert("Objet mis à jour !");
    } else {
      // === Nouvel objet : on fait un POST
      resp = await fetch(`https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/api/${chosenName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGeojson),
        credentials: 'include'  // 🔥 nécessaire
      });
      if (!resp.ok) throw new Error("Erreur insert");
      const result = await resp.json();
      updatedGeojson.properties.id = result.insertedId;
      alert("Nouvel objet inséré !");
    }
  } catch (err) {
    alert("Erreur : " + err.message);
  }

  // Facultatif : recharger la couche
  // loadLayer(chosenName);

  // Réinitialiser
  lastCreatedLayer = null;
});





function enableEditingUI() {
  map.pm.addControls({
    position: 'topright',
    drawMarker: true,
    drawPolyline: true,
    drawPolygon: true,
    editMode: false,
    dragMode: false,
    cutPolygon: false,
    removalMode: false
  });

  setTimeout(function () {
    const pmToolbar = document.querySelector('.leaflet-pm-toolbar');
    const headerToolbarContainer = document.getElementById('pmToolbarContainer');
    if (pmToolbar && headerToolbarContainer) {
      headerToolbarContainer.appendChild(pmToolbar);
    }

    const selectionButton = document.getElementById('select-entity-btn');
    if (selectionButton) {
      selectionButton.style.display = 'inline-block';
      selectionButton.onclick = () => {
        window.selectionModeActive = !window.selectionModeActive;
        if (window.selectionModeActive) {
          alert("Mode sélection activé. Cliquez sur une entité pour afficher les options.");
        } else {
          alert("Mode sélection désactivé.");
        }
      };
    }
  }, 0);

  window.selectionModeActive = false;

  map.on('pm:create', onShapeCreated);
  map.on('pm:edit', onShapeEdited);
  map.on('pm:remove', onShapeRemoved);

  layerChoice.innerHTML = '';
  editableLayersConfig.forEach(cfg => {
    const opt = document.createElement('option');
    opt.value = cfg.name;
    opt.textContent = cfg.name;
    layerChoice.appendChild(opt);
  });
  layerChoice.value = editableLayersConfig[0].name;
  applyLayerChoice(editableLayersConfig[0].name);
}





function disableEditingUI() {
  map.pm.removeControls();
  map.off('pm:create', onShapeCreated);
  map.off('pm:edit', onShapeEdited);
  map.off('pm:remove', onShapeRemoved);
  map.pm.disableDraw('Marker');
  map.pm.disableDraw('Line');
  map.pm.disableDraw('Polygon');

  window.selectionModeActive = false;

  const selectionBtn = document.getElementById('select-entity-btn');
  if (selectionBtn) {
    selectionBtn.style.display = 'none';
  }

  layerChoice.innerHTML = '';
  fieldsContainer.innerHTML = '';
  lastCreatedLayer = null;
}


function applyLayerChoice(layerName) {
  const cfg = editableLayersConfig.find(e => e.name === layerName);
  if (!cfg) return;
  // Désactiver tous les modes de dessin existants
  map.pm.disableDraw('Marker');
  map.pm.disableDraw('Line');
  map.pm.disableDraw('Polygon');

  // Stocker le type de géométrie choisi pour usage ultérieur
  selectedGeometryType = cfg.geometryType;

  // Mise à jour du formulaire des champs
  fieldsContainer.innerHTML = '';
  cfg.fields.forEach(f => {
    const lbl = document.createElement('label');
    lbl.textContent = f + " : ";
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.id = 'field_' + f;
    inp.style.width = '100%';
    fieldsContainer.appendChild(lbl);
    fieldsContainer.appendChild(inp);
  });
}

function onShapeCreated(e) {
  console.log("onShapeCreated : ", e.layer);
  lastCreatedLayer = e.layer;
}

// Édition
async function onShapeEdited(e) {
  e.layer.eachLayer(async layer => {
    const id = layer.feature?.properties?.id;
    if (!id) return;

    // CHANGEMENT ICI : on récupère le nom de table
    const tableName = layer.feature?.properties?.layerName || 'finance';

    const updatedGeojson = layer.toGeoJSON();

    try {
      // CHANGEMENT ICI : on appelle /api/<tableName>/<id>
      const resp = await fetch(`https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/api/${tableName}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGeojson)
      });
      if (!resp.ok) throw new Error("Erreur update");
      console.log("Mise à jour OK pour l'objet ID =", id);

      // (Facultatif) Recharger la couche pour voir le résultat
      // loadLayer(tableName);

    } catch (err) {
      console.error(err);
    }
  });
}


// Suppression
function onShapeRemoved(e) {
  const layer = e.layer;
  const id = layer.feature?.properties?.id;
  if (!id) return;

  // CHANGEMENT ICI : on récupère le nom de table
  const tableName = layer.feature?.properties?.layerName || 'finance';

  fetch(`https://organic-trout-g4rr47j5p4xph54j-3000.app.github.dev/api/${tableName}/${id}`, {
    method: 'DELETE'
  })
    .then(resp => {
      if (!resp.ok) throw new Error("Erreur delete");
      console.log("Suppression OK pour ID =", id);

      // (Facultatif) Recharger la couche
      // loadLayer(tableName);

    })
    .catch(err => console.error(err));
}






