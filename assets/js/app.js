mapboxgl.accessToken = 'pk.eyJ1Ijoia2FyaW1pZmFyIiwiYSI6ImNqOGtnaWp4OTBjemsyd211ZDV4bThkNmIifQ.Xg-Td2FFJso83Mmmc87NDA';


var bounds = [
    [-113.983901, 20.833183], // Southwest coordinates
    [-86.097884,40.646082]  // Northeast coordinates
];
var firstSymbolId;
var hoveredPcrId = null;
var zoomThreshold = 5.5
var COLORS = ['#4899D5','#2C3C7E','#0085CF','#BFAD83','#EAAB00','#EFB666','#D7A3B3','#90313E','#BF3B3B','#DA2B1F','#497B59', "#719B50"]
var outlines = ["#005782", "#ED8C00", "#C7362D", "#00973A"]

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/karimifar/ckkd94fbp02ij17p9z9lm7rwa',
    center: [-100.113241, 31.079125],
    zoom: 4.8,
    maxZoom: 15,
    minZoom:3.5
    // maxBounds: bounds,
});
// map.addControl(
//     new MapboxGeocoder({
//     accessToken: mapboxgl.accessToken,
//     mapboxgl: mapboxgl
//     })
// );
map.getCanvas().style.cursor = "auto"
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');


map.on('load', function () {


    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    map.addSource("pcrs", {
        type: "geojson",
        data: "https://texashealthdata.com/TCHMB/pcr",
        generateId: true,
    })
    

    map.addLayer({
        'id': 'pcrs_fill',
        'type': 'fill',
        'source':'pcrs',
        // 'maxzoom': zoomThreshold,
        'paint':{
            "fill-color": ["case",
            ["boolean", ["feature-state", "hover"], false],
            "#00B1AA",
            "#ccc"
        ],
            "fill-opacity": 0.7
        }
    }, firstSymbolId);



    map.addLayer({
        'id': 'pcrs_outline',
        'type': 'line',
        'source':'pcrs',
        // 'minzoom': zoomThreshold,
        'paint':{
            "line-color":  "#fff",
            "line-width":2,
            "line-opacity": 1
        }
    }, firstSymbolId);


    map.addLayer({
        'id': 'pcr_alphabet',
        'type': 'symbol',
        'source':'pcrs',
        // 'maxzoom': zoomThreshold,
        'layout': {
            // get the title name from the source's "title" property
            'text-field': ['get', 'PCR'],
            'text-font': [
            'DIN Pro Bold',
            'Arial Unicode MS Bold'
            ],
            'text-size': 24,
            'text-offset': [0, 0],
            // 'text-ignore-placement': true,
            'text-allow-overlap':true,
            'text-max-width': 5,
            'text-line-height':1,
            // 'text-anchor': 'center'
            },
        'paint':{
            'text-color': "#20515F",
            'text-halo-color': "#fff",
            'text-halo-width': 1,
            'text-halo-blur': 1,
            
        }
    });



    map.on('mousemove', 'pcrs_fill', function (e) {
        if (e.features.length > 0) {
            if (hoveredPcrId>=0) {
                
                map.setFeatureState(
                    { source: 'pcrs', id: hoveredPcrId },
                    { hover: false }
                );
            }
            var pcr = e.features[0].properties.PCR_name
            $("#pcr-pop").html("<p class='pcr-name'>"+pcr+"</p>")
            if(!popup.isOpen()){
                $("#pcr-pop").css("display","flex")
            }
            

            map.getCanvas().style.cursor = "pointer"
            hoveredPcrId = e.features[0].id;
            map.setFeatureState(
                { source: 'pcrs', id: hoveredPcrId },
                { hover: true }
            );
        }
    });
    map.on('mouseleave', 'pcrs_fill', function () {
        if (hoveredPcrId>=0) {
            map.setFeatureState(
                { source: 'pcrs', id: hoveredPcrId },
                { hover: false }
            );
        }
        $("#pcr-pop").css("display","none")
        hoveredPcrId = null;
        map.getCanvas().style.cursor = "auto"
    });

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: [0, -5],
        className: 'hosp-pop'
    });

    hoverLayer(map,'nat-enrolled');
    hoverLayer(map,'nat-inprogress');
    hoverLayer(map,'nat-notenrolled');
    
    function hoverLayer(map,layername){
        map.on('mouseenter', layername, function (e) {
            $("#pcr-pop").css("display", "none")
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';
            var feature = e.features[0];
            var feature_id = feature.id
            map.setFeatureState(
                { source: 'composite', sourceLayer: 'nat-enrolled' , id: feature_id },
                { hover: true }
            );
            console.log(feature.state)
            
            // map.setPaintProperty(
            //     layername, 
            //     'cricle-opacity', 
            //     ['match', ['get', 'id'], feature_id, 1]
            // );
            var coordinates = feature.geometry.coordinates.slice();
            var enrollment = feature.properties.Enrollment_Status;
            var enroll_class = enrollment.replace(/\s+/g, '-').toLowerCase();

            var description = '<p class='+enroll_class+'>' + enrollment + '</p><h3>' + feature.properties.Facility_Name + '</h3>'
             
            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
            
        });
             
        map.on('mouseleave', layername, function () {
            map.getCanvas().style.cursor = '';
            popup.remove();
            // $("#pcr-pop").css("display", "flex")
        });
    }
    
    map.on('click', 'inst_fills',function (e) {
        console.log(hoveredPcrId)
        if (hoveredPcrId || hoveredPcrId==0) {
            
            var inst = e.features[0].properties.name
            var inst_id= e.features[0].properties.id
            var region_num = e.features[0].properties.region_num
            var inst_num = e.features[0].properties.dial_num

            showPopup(inst_id,region_num,inst_num);
        }else{
            $("#popup2").css("display", "none")
        }
        
    });
    map.on('click', function (e) {
        if (hoveredPcrId || hoveredPcrId==0) {
            $("#popup2").css("display", "block")
            
        }else{
            $("#popup2").css("display", "none")
        }
        
    });

    $(".hospital-ctrl").on("click", function(e) {
        var layer = $(this).val();
        if(this.checked){
            map.setLayoutProperty(layer, 'visibility', 'visible');
        }else{
            map.setLayoutProperty(layer, 'visibility', 'none');
        }
        
    })
    // map.setLayoutProperty('nat-inprogress', 'visibility', 'none');
    // map.setLayoutProperty('all-hospitals', 'visibility', 'none');
});

$("#mapwrap").on("mousemove", function(e){
    var position = $("#mapwrap")[0].getBoundingClientRect();
    var divX = position.x
    var divY = position.y

    var popWidth= $("#pcr-pop")[0].getBoundingClientRect().width;
    var mouseX=e.clientX
    var mouseY=e.clientY
    $("#pcr-pop").css("top", mouseY-divY+18)
    $("#pcr-pop").css("left", mouseX-divX-popWidth/2)
})

$("#exit").on("click", function(){
    
    $("#popup2").css("display", "none")
})



$("#zip-submit").on("click", function(event){
    event.preventDefault();
    search_input = $("#zip-input").val().trim();
    
    if (isNaN(search_input)){
       alert("Please enter a Zip code")
    }else{
        var req_url= "https://texashealthdata.com/api/cpan/codebyzip/" + search_input;
        
        $.get(req_url, function(data){
            if(data[0]){
                console.log(data)
                var inst_id = data[0].hub;
                var reg_code = data[0].menu[0];
                var inst_code = data[0].menu[1];

                var z_lat = data[0].zip_county.z_lat;
                var z_lng = data[0].zip_county.z_lng;

                map.flyTo({
                    center:[z_lng,z_lat],
                    zoom: 10
                })
                
                showPopup(inst_id,reg_code,inst_code)
            }else{
                alert("please enter a valid zip code")
            }
            
        })
        
    }
    
})

function showPopup(id,reg_code,inst_code){
    $("#popup2").css("display", "block")
    var logoPath = "./assets/inst-logos/"+ id + ".png"
    $("#instructions").html("<div class='instructions'><p>Once you've connected, press:<p> <span>" + reg_code+"</span> for region and <br><span>" + inst_code+"</span> for institution</p></div>")
    $("#instructions").append("<div class='inst-logo'><img src='"+logoPath+"'></div>")
}