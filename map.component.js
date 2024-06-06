const apiKey = 'AIzaSyDq8asVVp-2DgLzhrpGT5HNgT1Fj46yF7Q';

class MapComponent {
  constructor() {
    this.componentNames = {
      country: 'Pais',
      administrative_area_level_1: 'Provincia',
      administrative_area_level_2: 'Ciudad',
      locality: 'Localidad',
      postal_code: 'Codigo Postal',
    };
    this.loadingIndicator = document.getElementById('loadingIndicator');
    this.addressDetailsDiv = document.getElementById('addressDetails');
  }

  showLoadingIndicator() {
    this.loadingIndicator.style.display = 'block';
  }

  hideLoadingIndicator() {
    this.loadingIndicator.style.display = 'none';
  }

  initMap() {
    this.showLoadingIndicator();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.createMap(userLocation);
        this.hideLoadingIndicator();
      }, () => {
        console.error('Geolocation failed.');
        const defaultLocation = { lat: 51.678418, lng: 7.809007 };
        this.createMap(defaultLocation);
      });
    } else {
      console.error('Geolocation not supported.');
      const defaultLocation = { lat: 51.678418, lng: 7.809007 };
      this.createMap(defaultLocation);
      this.hideLoadingIndicator();
    }
  }

  createMap(location) {
    const mapOptions = {
      center: location,
      zoom: 8,
    };
    this.mapa = new google.maps.Map(document.getElementById('mapContainer'), mapOptions);

    this.mapa.addListener('click', (event) => {
      const clickedLocation = event.latLng;
      this.addMarker(clickedLocation);
    });
  }

  addMarker(location) {
    if (this.marker) {
      this.marker.setMap(null);
    }

    this.marker = new google.maps.Marker({
      position: location,
      map: this.mapa
    });

    this.mapa.panTo(location);
    this.printAddressDetails(location);
  }

  printAddressDetails(location) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const addressDetails = this.parseAddressComponents(results[0].address_components, location);
        console.log(results[0].address_components);
        this.displayAddressDetails(addressDetails);
        console.log('Parsed Address Details:', addressDetails);
      } else {
        console.error('Geocoder failed due to:', status);
      }
    });
  }

  parseAddressComponents(components, location) {
    const parsedComponents = {};
    parsedComponents['coordinates'] = {
      latitude: location.lat().toString(),
      longitude: location.lng().toString()
    };

    components.forEach(component => {
      component.types.forEach((type) => {
        const friendlyName = this.componentNames[type];
        if (friendlyName) {
          parsedComponents[friendlyName] = component.long_name;
        }
      });
    });

    return parsedComponents;
  }

  displayAddressDetails(addressDetails) {
    let addressHTML = '<h3>Address Details</h3>';
    for (const key in addressDetails) {
      if (Object.hasOwnProperty.call(addressDetails, key)) {
        const value = addressDetails[key];
        if (key === 'coordinates' && typeof value === 'object') {
          // If the key is 'coordinates' and value is an object, handle latitude and longitude
          addressHTML += `<p><strong>Latitude:</strong> ${value.latitude}</p>`;
          addressHTML += `<p><strong>Longitude:</strong> ${value.longitude}</p>`;
        } else {
          // Use the key received in the address details object
          addressHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
      }
    }
    this.addressDetailsDiv.innerHTML = addressHTML;
  }


}
const mapComponent = new MapComponent();
mapComponent.initMap();
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
script.async = true;
script.defer = true;
document.head.appendChild(script);
