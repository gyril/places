angular.module('placesApp', ['uiGmapgoogle-maps'])
  .config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyClGJDuUnPapo-qhzY6iT8aWgAS0MvD_VQ',
        v: '3.exp',
        libraries: 'places'
    })
  })