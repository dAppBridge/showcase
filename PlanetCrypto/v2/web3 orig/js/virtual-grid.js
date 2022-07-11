//var lastCellSize = 15;
var VirtualGrid = L.Layer.extend({

  options: {
    cellSize: 100,
    previousCellSize: 0,
    //cellSize: 1050,
    updateInterval: 150,
    pixelSizeX: 0,
    pixelSizeY: 0,
    zoomTriger: 0
  },
  rects: {},
  rectList: {},

  currentColumns: {},
  currentRows: {},

  cellDetails: {},


  initialize: function (options) {
    this.cellDetails = {};
    options = L.setOptions(this, options);
    this.on('cellsupdated', this._cellsupdated);
    this.on('cellcreate', this._cellcreate);
    this.on('cellenter', this._cellenter);
    this.on('cellleave', this._cellleave);
    this._zooming = false;
    options.previousCellSize = options.cellSize;
  },

  onAdd: function (map) {
    this._map = map;
    this._update = L.Util.throttle(this._update, this.options.updateInterval, this);
    this._reset();
    this._update();
  },

  onRemove: function () {
    this._map.removeEventListener(this.getEvents(), this);
    this._removeCells();
  },

  getEvents: function () {
    var events = {
      moveend: this._update,
      zoomstart: this._zoomstart,
      zoomend: this._reset
    };

    return events;
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  removeFrom: function (map) {
    map.removeLayer(this);
    return this;
  },

  _zoomstart: function () {
    this._zooming = true;
  },

  _reset: function () {
    this._removeCells();

    this._cells = {};
    this._activeCells = {};
    this._cellsToLoad = 0;
    this._cellsTotal = 0;
    this._cellNumBounds = this._getCellNumBounds();

    this._resetWrap();
    this._zooming = false;
  },

  _resetWrap: function () {
    var map = this._map;
    var crs = map.options.crs;

    if (crs.infinite) { return; }

    var cellSize = this._getCellSize();

    if (crs.wrapLng) {
      this._wrapLng = [
        Math.floor(map.project([0, crs.wrapLng[0]]).x / cellSize),
        Math.ceil(map.project([0, crs.wrapLng[1]]).x / cellSize)
      ];
    }

    if (crs.wrapLat) {
      this._wrapLat = [
        Math.floor(map.project([crs.wrapLat[0], 0]).y / cellSize),
        Math.ceil(map.project([crs.wrapLat[1], 0]).y / cellSize)
      ];
    }
  },

  _getCellSize: function () {

    return this.options.cellSize;
    
  //  if(this._map.getZoom() == 17 )
  //    return 26.933357314291044;
  //  else
  //    return 53.8667127945534;

  // IF cell size has changed have to reinit the whole grid
  },

  _update: function () {
    if (!this._map) {
      return;
    }
    //var _pixelWorldBounds = this._map.getPixelWorldBounds();
    //console.log("_pixelWorldBounds:", _pixelWorldBounds);
    var latlongBound = this._map.getBounds();

    //console.log(parseInt(latlongBound._southWest.lng));
    //console.log("latLngBounds BEFORE:", this._map.getBounds());

    var gridFixPoint = 5;

    var _current_lat = parseFloat(latlongBound._northEast.lat.toFixed(gridFixPoint));
    //var _current_lat = parseFloat( hardFixed( latlongBound._northEast.lat,5) );
    if(_current_lat < 0) {
      //_current_lat = hardFixed((_current_lat + 0.001),5);//.toFixed(gridFixPoint); // changed from - due to small grid in SA
      _current_lat = (_current_lat + 0.001).toFixed(gridFixPoint); // changed from - due to small grid in SA
      _current_lat = normaliseLatLngUp(_current_lat);
      latlongBound._northEast.lat = _current_lat;
    } else {

      //_current_lat = hardFixed((_current_lat + 0.001),5);//.toFixed(gridFixPoint);
      _current_lat = (_current_lat + 0.001).toFixed(gridFixPoint);
      _current_lat = normaliseLatLngUp(_current_lat);
      latlongBound._northEast.lat = _current_lat;
    }

    latlongBound._northEast.lng = (


      normaliseLatLngUp(
        parseFloat(latlongBound._northEast.lng.toFixed(gridFixPoint)) + 0.001
      )

    ).toFixed(gridFixPoint); // east west
    //latlongBound._northEast.lng = 
    //  normaliseLatLngUp(hardFixed((parseFloat(hardFixed(latlongBound._northEast.lng,gridFixPoint)) + 0.001),5)); // east west



    _current_lat = parseFloat(latlongBound._southWest.lat.toFixed(gridFixPoint));
    //_current_lat = parseFloat(hardFixed(latlongBound._southWest.lat,gridFixPoint));
    if(_current_lat < 0) {
      _current_lat = (_current_lat + 0.001).toFixed(gridFixPoint);
      //_current_lat = hardFixed((_current_lat - 0.001),5); // change from + due to small grid in SA

      _current_lat = normaliseLatLngDown(_current_lat);

      latlongBound._southWest.lat = _current_lat;
    } else {
      _current_lat = (_current_lat - 0.001).toFixed(gridFixPoint);
      //_current_lat = hardFixed((_current_lat - 0.001),5);

      _current_lat = normaliseLatLngDown(_current_lat);
      latlongBound._southWest.lat = _current_lat;
    }
    latlongBound._southWest.lng = (

      normaliseLatLngUp(
        parseFloat(latlongBound._southWest.lng.toFixed(gridFixPoint)) - 0.001
        )
      ).toFixed(gridFixPoint); // east west
    //latlongBound._southWest.lng = 
    //  normaliseLatLngUp(hardFixed((parseFloat(hardFixed(latlongBound._southWest.lng,4)) - 0.001),5)); // east west
    //console.log("latlongBound AFTER:", latlongBound);


    if(this._map.getZoom() == 17 || this._map.getZoom() == 18)
    //console.log("Grid anchor:", latlongBound.getNorthWest());
    // find distance from northwest to 0 divided by 20m
    var _pointC = mymap.latLngToContainerPoint(latlongBound.getNorthWest());
    //console.log("Anchor Point", _pointC);
    /*

brave zoom: Grid anchor: M {lat: 51.50754, lng: -0.09398}
->                         {lat: 51.5085, lng: -0.0968}
                           {lat: 51.50851, lng: -0.09681}

chrome manual:           M {lat: 51.5081,  lng: -0.09465}
->                       M {lat: 51.5075, lng: -0.0939}
                                 51.50751, lng: -0.09391}

we want the lat to be 51.5080
                      51.5075
    london:
    lat: 51.5086
    lng: -0.0972
    
    paris init:
    lat: 48.8626
    lng: 2.3128

    ->18->17:
    lat: 48.8626
    lng: 2.3128

    Init to Paris with manual zoom to 17:
    lat: 48.8626
    lng: 2.3128
    == correct
    */
    var latlongBound = this._map.getBounds();
    var bounds = L.bounds(this._map.project(latlongBound.getNorthWest()), this._map.project(latlongBound.getSouthEast()));


    //console.log("BOUNDS:", bounds);

    var cellSize = this._getCellSize();

    //console.log(cellSize);

    //if(this._map.getZoom() == 17)
    //  console.log("CELL SIZE", cellSize);
    /*
    london: 26.933357314291044
    paris init: 26.933357314291044
    ->18->17: 50.96258099610946????
    direct with manual zoom: 25.481287702200856???

    cell sizing wrong
*/
    //console.log("init bounds:", bounds);


    //console.log("updating:", this._map.getZoom());
    // cell coordinates range for the current view
    // need to ensure cellbounds are equal each zoom
    // so we break up the globe into cellSize splits and pick the closest one to bounds.min/max

    var cellBounds = L.bounds(
      bounds.min.divideBy(cellSize).floor(),
      bounds.max.divideBy(cellSize).floor());


    this._removeOtherCells(cellBounds);
    //console.log("cellSize", cellSize);
    /*
    chrome: cellSize 53.8667127945534
                     53.86
    brave:  cellSize 53.86792087337921
                     53.86
    */
    //console.log("cellBounds:", cellBounds);


/*
cellBounds: 
P {min: x, max: x}
max: x {x: 622596, y: 414277}
min: x {x: 622570, y: 414260}
__proto__: Object


*/
/*

    cellBounds = L.bounds(
      bounds.min.divideBy(cellSize).floor(),
      bounds.max.divideBy(cellSize).floor());
*/
    this._addCells(cellBounds);

    this.fire('cellsupdated');

  },

  _addCells: function (bounds) {
    //console.log("init bound:", bounds);



    //this.cellDetails = {};

    var queue = [];
    var center = bounds.getCenter();
    var zoom = this._map.getZoom();

    var j, i, coords;
    // create a queue of coordinates to load cells from
    //console.log("_addCells bounds", bounds);
    for (j = bounds.min.y; j <= bounds.max.y; j++) {
      for (i = bounds.min.x; i <= bounds.max.x; i++) {
        coords = L.point(i, j);
        coords.z = zoom;

        if (this._isValidCell(coords)) {
          queue.push(coords);
        }
      }
    }

    var cellsToLoad = queue.length;

    if (cellsToLoad === 0) { return; }

    this._cellsToLoad += cellsToLoad;
    this._cellsTotal += cellsToLoad;

    // sort cell queue to load cells in order of their distance to center
    queue.sort(function (a, b) {
      return a.distanceTo(center) - b.distanceTo(center);
    });

    for (i = 0; i < cellsToLoad; i++) {
      this._addCell(queue[i]);
    }
  },

  _isValidCell: function (coords) {
    var crs = this._map.options.crs;

    if (!crs.infinite) {
      // don't load cell if it's out of bounds and not wrapped
      var bounds = this._cellNumBounds;
      if (
        (!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
        (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))
      ) {
        return false;
      }
    }

    if (!this.options.bounds) {
      return true;
    }

    // don't load cell if it doesn't intersect the bounds in options
    var cellBounds = this._cellCoordsToBounds(coords);
    return L.latLngBounds(this.options.bounds).intersects(cellBounds);
  },

  // converts cell coordinates to its geographical bounds
  _cellCoordsToBounds: function (coords) {
    var map = this._map;
    var cellSize = this.options.cellSize;
    var nwPoint = coords.multiplyBy(cellSize);
    var sePoint = nwPoint.add([cellSize, cellSize]);
    var nw = map.wrapLatLng(map.unproject(nwPoint, coords.z));
    var se = map.wrapLatLng(map.unproject(sePoint, coords.z));

    return L.latLngBounds(nw, se);
  },

  // converts cell coordinates to key for the cell cache
  _cellCoordsToKey: function (coords) {
    return coords.x + ':' + coords.y;
  },

  // converts cell cache key to coordiantes
  _keyToCellCoords: function (key) {
    var kArr = key.split(':');
    var x = parseInt(kArr[0], 10);
    var y = parseInt(kArr[1], 10);

    return L.point(x, y);
  },

  // remove any present cells that are off the specified bounds
  _removeOtherCells: function (bounds) {
    for (var key in this._cells) {
      if (!bounds.contains(this._keyToCellCoords(key))) {
        this._removeCell(key);
      }
    }
  },

  _removeCell: function (key) {

    var cell = this._activeCells[key];

    if (cell) {

      var cellDetailsKey = hardFixed(cell.bounds.getCenter().lat,4) + ":" + hardFixed(cell.bounds.getCenter().lng,4);

      delete this._activeCells[key];

      if (this.cellLeave) {
        this.cellLeave(cell.bounds, cell.coords);
      }

      this.fire('cellleave', {
        bounds: cell.bounds,
        coords: cell.coords
      });


      delete this.cellDetails[cellDetailsKey];

    }
  },

  _removeCells: function () {
    for (var key in this._cells) {
      var bounds = this._cells[key].bounds;
      var coords = this._cells[key].coords;

      if (this.cellLeave) {
        this.cellLeave(bounds, coords);
      }

      this.fire('cellleave', {
        bounds: bounds,
        coords: coords
      });

    }

  },

  _addCell: function (coords) {
    // wrap cell coords if necessary (depending on CRS)
    this._wrapCoords(coords);

    // generate the cell key
    var key = this._cellCoordsToKey(coords);

    // get the cell from the cache
    var cell = this._cells[key];
    // if this cell should be shown as isnt active yet (enter)

    if (cell && !this._activeCells[key]) {
      if (this.cellEnter) {
        this.cellEnter(cell.bounds, coords);
      }

      this.fire('cellenter', {
        bounds: cell.bounds,
        coords: coords
      });

      this._activeCells[key] = cell;
    }

    // if we dont have this cell in the cache yet (create)
    if (!cell) {
      cell = {
        coords: coords,
        bounds: this._cellCoordsToBounds(coords)
      };
      /*
      if(this._map.getZoom() == 18)
        console.log("create cell coords:", coords);
*/
      this._cells[key] = cell;
      this._activeCells[key] = cell;

      if (this.createCell) {
        this.createCell(cell.bounds, coords);
      }

      this.fire('cellcreate', {
        bounds: cell.bounds,
        coords: coords
      });

    }
  },

  _wrapCoords: function (coords) {
    coords.x = this._wrapLng ? L.Util.wrapNum(coords.x, this._wrapLng) : coords.x;
    coords.y = this._wrapLat ? L.Util.wrapNum(coords.y, this._wrapLat) : coords.y;
  },

  // get the global cell coordinates range for the current zoom
  _getCellNumBounds: function () {
    var bounds = this._map.getPixelWorldBounds();
    var size = this._getCellSize();

    return bounds ? L.bounds(
        bounds.min.divideBy(size).floor(),
        bounds.max.divideBy(size).ceil().subtract([1, 1])) : null;
  },


  // custom
  _cellleave: function(e) {
    try {
      var rect = this.rects[coordsToKey(e.coords)];
      mymap.removeLayer(rect);
    } catch(e){}

    var _tempCenter = e.bounds.getCenter();
    var _tempCenterPixel = mymap.project(_tempCenter);
     

  },


  _cellenter: function(e) {
    //console.log("cellenter"); // cell from cache to be added to map
    if(mymap.getZoom() == this.options.zoomTriger) {
      var rect = this.rects[coordsToKey(e.coords)];
      if(rect)
        mymap.addLayer(rect);
    }
  },

  _cellcreate: function(e) {

    if(this._map.getZoom() == this.options.zoomTriger) {

      // check if we have it in rectsToBuy...
      var _key = coordsToKey(e.coords);

      //console.log('cellcreate', e, _key);

      var _tempCenter = e.bounds.getCenter();
      var _tempCenterPixel = this._map.project(_tempCenter);

      if(this._map.getPixelBounds().contains(_tempCenterPixel)){
        
/*
        if(this.currentColumns[_tempCenter.lng.toFixed(5)]){
        } else {
          this.currentColumns[_tempCenter.lng.toFixed(5)] = _tempCenter.lng.toFixed(5);
        }
        if(this.currentRows[_tempCenter.lat.toFixed(5)]){
        } else {
         this.currentRows[_tempCenter.lat.toFixed(5)] = _tempCenter.lat.toFixed(5); 
        }
*/

        if(this.currentColumns[hardFixed(_tempCenter.lng,4)] == hardFixed(_tempCenter.lng,4)){
        } else {
          this.currentColumns[hardFixed(_tempCenter.lng,4)] = hardFixed(_tempCenter.lng,4);
        }
        if(this.currentRows[hardFixed(_tempCenter.lat,4)] == hardFixed(_tempCenter.lat,4)){
        } else {
         this.currentRows[hardFixed(_tempCenter.lat,4)] = hardFixed(_tempCenter.lat,4); 
        }
      } 



      // do we have it?
      //if(this.cellDetails[_tempCenter.lat.toFixed(5) + ':' + _tempCenter.lng.toFixed(5)]){
      if(this.cellDetails[hardFixed(_tempCenter.lat,4) + ':' + hardFixed(_tempCenter.lng,4)] == {
          key: _key,
          centerPoint: _tempCenter,
          bounds: e.bounds

        }){

      } else {
        //var cellDetailsKey = hardFixed(cell.bounds.getCenter().lat,4) + ":" + hardFixed(cell.bounds.getCenter().lng,4);
        //this.cellDetails[_tempCenter.lat.toFixed(5) + ':' + _tempCenter.lng.toFixed(5)] = {
        this.cellDetails[hardFixed(_tempCenter.lat,4) + ':' + hardFixed(_tempCenter.lng,4)] = {
          key: _key,
          centerPoint: _tempCenter,
          bounds: e.bounds
        };      
      }
      // use cellDetails object
      // store the center point of the cell
      // check if it is on screen and create the col/row list which we can use to query
      // on timer
      // update this onzoom & onmove
      // query on timer

      var foundPurchasedPlot = false;
      var foundKey;
      for(key in rectsToBuy){
        if(e.bounds.contains(rectsToBuy[key])){
          foundPurchasedPlot = true;
          foundKey = key;
          break;
        }
      }


      //if(rectsToBuy[_tempCenter.lat.toFixed(4) + ':' + _tempCenter.lng.toFixed(4)]){
      if(foundPurchasedPlot){
        //console.log("FOUND");

        this.rects[coordsToKey(e.coords)] = L.rectangle(e.bounds, {
            color: '#999',
            weight: 1,
            opacity: 0.4,
            fillOpacity: 0
            //fillColor: '#990000',
            //fill: true
            //dashArray: "20 40"
          }).addTo(this._map);

          var _rectKey = e.bounds.getCenter();
          var _rect = L.rectangle(
            e.bounds, 
            {color: '#990000',
            weight: 2, fillOpacity: 0.5});
          _rect.addTo(this._map);

          _rect.on('click', function(e){
            if(actionMode == "REMOVESINGLE") {
              this.removeFrom(this._map);
              //console.log("KEY", foundKey);
              //console.log("BEFORE",rectsToBuy);
              delete rectsToBuy[foundKey];
              //console.log("AFTER",rectsToBuy);
              updateNewCard();
            }
          });

          lightGrids[this._map.getZoom()].rectList[
            hardFixed(_rectKey.lat,5) + ':' + hardFixed(_rectKey.lng,5)
                        ] = _rect;

      } else {
        if(this.options.hideGrid){
          /*
          rects[coordsToKey(e.coords)] = L.rectangle(e.bounds, {
            color: '#999',
            weight: 0,
            opacity: 0.4,
            fillOpacity: 0

          }).addTo(this._map); 
          */

        } else {
          this.rects[coordsToKey(e.coords)] = L.rectangle(e.bounds, {
            color: '#999',
            weight: 1,
            opacity: 0.4,
            fillOpacity: 0
            //dashArray: "20 40"
          }).addTo(this._map);          
        }


      }


      if(this.options.hideGrid){
      } else {


        this.rects[coordsToKey(e.coords)].on('click', function(e){
          //console.log(e);
          //console.log(onDownEvent);
          //console.log("key", _key);
          if(e.sourceTarget.token_id){
            tokenInfo(e.sourceTarget.token_id);
            
            return;
          }
          //console.log(e.sourceTarget._bounds.getNorthWest());

/*
          if(actionMode == '') {
            $.toast({
              heading: 'Use BUY LAND Tools',
              text: "Use the tools at the top of the page to purchase land.<br/><br/>Click the [?] symbol for the GAME GUIDE.",
              icon: 'info',
              allowToastClose: true,
              position: 'bottom-right',
              hideAfter: TOAST_HIDE_DELAY,
              showHideTransition: TOAST_HIDE_TRANSITION
            });
            return;
          }
*/
          var _rectKey = e.sourceTarget._bounds.getCenter();


            
            if(actionMode == 'BUYMULTI') {
              if(!onDownEvent) {

                if(!checkBuyPointAllowed(_rectKey,true))
                  return;
                  //rectsToBuy = {};

                  if(Object.keys(rectsToBuy).length >= 45){
                    showError('You can only add a maximum of 45 plots to one card.<br/><br/>Please complete this purchase and start a new card to continue.', 'Planet Crypto');
                    onDownEvent = false;
                    $('#buyMultiple').removeClass('hollow');
                    actionMode = '';
                    return;
                  }

                  onDownEvent = true;

                  //rectsToBuy[_rectKey.lat.toFixed(5) + ':' + _rectKey.lng.toFixed(5)] = _rectKey;
                  rectsToBuy[hardFixed(_rectKey.lat,5) + ':' + hardFixed(_rectKey.lng,5)] = _rectKey;
                  updateNewCard();
                  
                  /*
                  e.sourceTarget.setStyle({
                    fill: true, 
                    fillOpacity: 0.4, 
                    fillColor: '#990000'});
                  */

                  var _rect = L.rectangle(
                    e.sourceTarget._bounds, 
                    {color: '#990000',
                    weight: 2, fillOpacity: 0.5});
                  _rect.addTo(this._map);

                  _rect.on('click', function(e){

                    if(actionMode == "REMOVESINGLE") {
                      this.removeFrom(this._map);

                      delete rectsToBuy[hardFixed(_rectKey.lat,5) + ':' + hardFixed(_rectKey.lng,5)];
                      updateNewCard();
                    }
                    if(actionMode == "BUYMULTI") {
                      onDownEvent = false;
                      $('#buyMultiple').removeClass('hollow')
                      actionMode = '';
                    }
                  });

                  lightGrids[this._map.getZoom()].rectList[
                    hardFixed(_rectKey.lat,5) + ':' + hardFixed(_rectKey.lng,5)
                                ] = _rect;


              } else {
                // close of selection
                onDownEvent = false;
                $('#buyMultiple').removeClass('hollow')
                actionMode = '';

                //console.log(rectsToBuyLen());
                // show current plot size alert

                // -> allow subtraction from plot mode
                //inSubtractionMode = true;



              }
            }

            if(actionMode == 'BUYSINGLE') {
                //onDownEvent = true;
                if(!checkBuyPointAllowed(_rectKey,true))
                  return;

                if(Object.keys(rectsToBuy).length >= 45){
                  showError('You can only add a maximum of 45 plots to one card.<br/><br/>Please complete this purchase and start a new card to continue.', 'Planet Crypto');
                  onDownEvent = false;
                  $('#buySingle').removeClass('hollow');
                  actionMode = '';
                  return;
                }

                //rectsToBuy[_rectKey.lat.toFixed(5) + ':' + _rectKey.lng.toFixed(5)] = _rectKey;
                rectsToBuy[hardFixed(_rectKey.lat,5) + ':' + hardFixed(_rectKey.lng,5)] = _rectKey;
                updateNewCard();

/*
                e.sourceTarget.setStyle({
                  fill: true, 
                  fillOpacity: 0.4, 
                  fillColor: '#990000'});      
*/
                // TODO
                // Finish off adding to layers
                // auto removing on zoom in out


                
                var _rect = L.rectangle(
                  e.sourceTarget._bounds, 
                  {color: '#990000',
                  weight: 2, fillOpacity: 0.5});
                _rect.addTo(this._map);

                _rect.on('click', function(e){
                  if(actionMode == "REMOVESINGLE") {
                    this.removeFrom(this._map);

                    delete rectsToBuy[hardFixed(_rectKey.lat,5) + ':' + hardFixed(_rectKey.lng,5)];
                    updateNewCard();
                  }
                });

                lightGrids[this._map.getZoom()].rectList[
                  hardFixed(_rectKey.lat,5) + ':' + hardFixed(_rectKey.lng,5)
                              ] = _rect;


            }

            /*
            if(actionMode == 'REMOVESINGLE') {
              
              //e.sourceTarget.setStyle({
              //  color: '#999',
              //  weight: 1,
              //  opacity: 0.4,
              //  fillOpacity: 0
              //});
              



              delete rectsToBuy[hardFixed(_rectKey.lat,5) + ':' + hardFixed(_rectKey.lng,5)];
              updateNewCard();
            }
            */

            /*
            if(!inSubtractionMode){

                rectsToBuy = {};
                onDownEvent = true;

                rectsToBuy[_rectKey.lat.toFixed(5) + ':' + _rectKey.lng.toFixed(5)] = _rectKey;
                
                e.sourceTarget.setStyle({
                  fill: true, 
                  fillOpacity: 0.4, 
                  fillColor: '#990000'});
          

            } else {
              e.sourceTarget.setStyle({
                color: '#999',
                weight: 1,
                opacity: 0.4,
                fillOpacity: 0
              });

              delete rectsToBuy[_rectKey.lat.toFixed(5) + ':' + _rectKey.lng.toFixed(5)];

            }
            */
          



          //console.log('cell click', e.sourceTarget._bounds._northEast);
        });

      
        this.rects[coordsToKey(e.coords)].on('mouseover', function(e){
          if(e.sourceTarget.options.fillOpacity == '0.6') {
            // marked for buying
          } else {




            if(onDownEvent && actionMode == 'BUYMULTI'){

              if(!checkBuyPointAllowed(e.sourceTarget._bounds.getCenter(), false))
                return;

              if(Object.keys(rectsToBuy).length >= 45){
                showError('You can only add a maximum of 45 plots to one card.<br/><br/>Please complete this purchase and start a new card to continue.', 'Planet Crypto');
                onDownEvent = false;
                $('#buyMultiple').removeClass('hollow');
                actionMode = '';
                return;
              }

              if(e.sourceTarget.options.fillOpacity == '0.4'){
                // already marked
              } else {
                
                //rectsToBuy.push(e.sourceTarget);
                //rectsToBuy[e.sourceTarget._bounds.getCenter().lat.toFixed(5) + ':' + e.sourceTarget._bounds.getCenter().lng.toFixed(5)] = e.sourceTarget._bounds.getCenter();
                rectsToBuy[hardFixed(e.sourceTarget._bounds.getCenter().lat,5) + ':' + hardFixed(e.sourceTarget._bounds.getCenter().lng,5)] = e.sourceTarget._bounds.getCenter();
                updateNewCard();

                //console.log(rectsToBuyLen());
                //console.log(rectsToBuyLen() * 0.02 + " ETH");

                /*
                e.sourceTarget.setStyle({
                  fill: true, 
                  fillOpacity: 0.4, 
                  fillColor: '#990000'});
                */



                var _rect = L.rectangle(
                  e.sourceTarget._bounds, 
                  {color: '#990000',
                  weight: 2, fillOpacity: 0.5});
                _rect.addTo(this._map);

                _rect.on('click', function(e){
                  if(actionMode == "REMOVESINGLE") {
                    this.removeFrom(this._map);

                    delete rectsToBuy[hardFixed(e.sourceTarget._bounds.getCenter().lat,5) + ':' + hardFixed(e.sourceTarget._bounds.getCenter().lng,5)];
                    updateNewCard();
                  }
                  if(actionMode == "BUYMULTI") {
                    onDownEvent = false;
                    //console.log($('#buyMultiple'));
                    $('#buyMultiple').removeClass('hollow').addClass('success');
                    actionMode = '';
                  }
                });

                lightGrids[this._map.getZoom()].rectList[
                  hardFixed(e.sourceTarget._bounds.getCenter().lat,5) + ':' + hardFixed(e.sourceTarget._bounds.getCenter().lng,5)
                              ] = _rect;

              }
            }
          }    
        });

        this.rects[coordsToKey(e.coords)].on('mouseout', function(e){
          if(e.sourceTarget.options.fillOpacity == '0.6') {
            // marked for buying
          } else {
            /*
            e.sourceTarget.setStyle({
            color: '#999',
            weight: 1,
            opacity: 0.4,
            fillOpacity: 0}
              );
            */
          }
        });

      }
    }
  },

  _cellsupdated: function(e) {
      //console.log("cellsupdated");
      //console.log("getPixelBounds:", this._map.getPixelBounds());


      //console.log(" queryFrom:", currentDisplayMinGridMinX + "," + currentDisplayMinGridMinY);
      //console.log(" queryTo:", currentDisplayMinGridMaxX + "," + currentDisplayMinGridMaxY);



      //console.log("currentColumns:", this.currentColumns);
      //console.log(Object.keys(this.currentColumns).length);
      //console.log("currentRows:", this.currentRows);
      //console.log(Object.keys(this.currentRows).length);

      //console.log("CellDetails LEN:", Object.keys(this.cellDetails).length);



      this.currentColumns = {};
      this.currentRows = {};
      

      for(key in this.cellDetails){
        // check if it is on screen and create the col/row list which we can use to query
        //console.log(this.cellDetails[key]);
        var _tempCenter = this.cellDetails[key].centerPoint;
        var _tempCenterPixel = this._map.project(_tempCenter);

        if(this._map.getPixelBounds().contains(_tempCenterPixel)){
          
          
          if(this.currentColumns[hardFixed(_tempCenter.lng,4)] == hardFixed(_tempCenter.lng,4)){
          } else {
            this.currentColumns[hardFixed(_tempCenter.lng,4)] = hardFixed(_tempCenter.lng,4);
          }
          if(this.currentRows[hardFixed(_tempCenter.lat,4)] == hardFixed(_tempCenter.lat,4)){
          } else {
           this.currentRows[hardFixed(_tempCenter.lat,4)] = hardFixed(_tempCenter.lat,4); 
          }

          /*
          if(this.currentColumns[_tempCenter.lng.toFixed(5)]){
          } else {
            this.currentColumns[_tempCenter.lng.toFixed(5)] = _tempCenter.lng.toFixed(5);
          }
          if(this.currentRows[_tempCenter.lat.toFixed(5)]){
          } else {
           this.currentRows[_tempCenter.lat.toFixed(5)] = _tempCenter.lat.toFixed(5); 
          }
          */

        }// WORKING
      }






/*
      console.log(
        this.cellDetails[Object.keys(this.cellDetails)[1]].coords);

        console.log(rects[coordsToKey(this.cellDetails[Object.keys(this.cellDetails)[1]].coords)]);

        if(rects[coordsToKey(this.cellDetails[Object.keys(this.cellDetails)[1]].coords)]){
          rects[coordsToKey(this.cellDetails[Object.keys(this.cellDetails)[1]].coords)].setStyle({
            fill: true, 
            fillOpacity: 0.4, 
            fillColor: '#990000'});
        }
*/

      // lat & long needs converting into our x/y grid we use internally within solidity at this zoom lvl


      // perform solidity query here to find any purchased plots within this area...
  }


});
