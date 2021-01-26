mapboxgl.accessToken = 'pk.eyJ1Ijoia2FyaW1pZmFyIiwiYSI6ImNqOGtnaWp4OTBjemsyd211ZDV4bThkNmIifQ.Xg-Td2FFJso83Mmmc87NDA';


var bounds = [
    [-113.983901, 20.833183], // Southwest coordinates
    [-86.097884,40.646082]  // Northeast coordinates
];
var firstSymbolId;
var hoveredInstId = null;
var zoomThreshold = 5.5
var COLORS = ['#4899D5','#2C3C7E','#0085CF','#BFAD83','#EAAB00','#EFB666','#D7A3B3','#90313E','#BF3B3B','#DA2B1F','#497B59', "#719B50"]
var outlines = ["#005782", "#ED8C00", "#C7362D", "#00973A"]

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/karimifar/ckkd94fbp02ij17p9z9lm7rwa',
    center: [-100.113241, 31.079125],
    zoom: 4.8,
    maxZoom: 9,
    minZoom:3.5
    // maxBounds: bounds,
});
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
    map.addSource("nat_hospitals", {
        type: "geojson",
        data: "https://texashealthdata.com/TCHMB/nat-hospitals",
        generateId: true,
    })

    // map.addSource("counties", {
    //     type: "geojson",
    //     data: "https://texashealthdata.com/NAS/counties",
    //     generateId: true,
    // })

    // map.addLayer({
    //     'id': 'counties-outline',
    //     'type': 'line',
    //     'source':'counties',
    //     'minzoom': zoomThreshold,
    //     'paint':{
    //         "line-color": "#000",
    //         "line-width": 1,
    //         "line-opacity": 0.5
    //     }
    // }, firstSymbolId);

    

    map.addLayer({
        'id': 'pcrs_fill',
        'type': 'fill',
        'source':'pcrs',
        // 'maxzoom': zoomThreshold,
        'paint':{
            "fill-color": "#aaa",
            "fill-opacity": 0.7
        }
    }, firstSymbolId);

    // map.addLayer({
    //     'id': 'counties-text',
    //     'type': 'symbol',
    //     'source':'counties',
    //     'minzoom': zoomThreshold,
    //     'layout': {
    //         // get the title name from the source's "title" property
    //         'text-field': ['get', 'countyName'],
    //         'text-font': [
    //             'DIN Pro Regular',
    //             'Arial Unicode MS Bold'
    //         ],
    //         'text-size':10,
    //         'text-offset': [0, 0],
    //         // 'text-anchor': 'center'
    //         },
    //     'paint':{
    //         'text-color': "#222",
    //         // 'text-halo-color': "#fff",
    //         // 'text-halo-width': 0.1,
    //     }
    // }, firstSymbolId);

    map.addLayer({
        'id': 'pcrs_outline',
        'type': 'line',
        'source':'pcrs',
        // 'minzoom': zoomThreshold,
        'paint':{
            "line-color": "#fff",
            "line-width": 2,
            "line-opacity": 1
        }
    }, firstSymbolId);

    // map.addLayer({
    //     'id': 'hospitals',
    //     'type': 'circle',
    //     'source':'nat_hospitals',
    //     // 'maxzoom': zoomThreshold,
    //     'paint': {            
    //         'circle-color': '#fff',
    //         'circle-opacity': 0.75,
    //         'circle-radius': 4,
    //         'circle-stroke-width': 1,
    //         'circle-stroke-color': '#D1618B'
    //         }
    //     });

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
    
    // map.addLayer({
    //     'id': 'region_names',
    //     'type': 'symbol',
    //     'source':'regions-points',
    //     'maxzoom': zoomThreshold,
    //     'layout': {
    //         // get the title name from the source's "title" property
    //         'text-field': ['get', 'name'],
    //         'text-font': [
    //         'Open Sans Semibold',
    //         'Arial Unicode MS Bold'
    //         ],
    //         'text-size': 12,
    //         'text-offset': [0, 1.25],
    //         // 'text-anchor': 'center'
    //         }
    // });


    map.on('mousemove', 'inst_fills', function (e) {
        if (e.features.length > 0) {
            if (hoveredInstId>=0) {
                
                map.setFeatureState(
                    { source: 'institutions', id: hoveredInstId },
                    { hover: false }
                );
            }

            var inst = e.features[0].properties.name
            var region_num = e.features[0].properties.region_num
            var inst_num = e.features[0].properties.dial_num
            $("#popup1").css("display","block")
            $("#popup1").html("<p class='inst-name'>"+inst+"</p>")

            map.getCanvas().style.cursor = "pointer"
            hoveredInstId = e.features[0].id;
            map.setFeatureState(
                { source: 'institutions', id: hoveredInstId },
                { hover: true }
            );
        }
    });
    map.on('mouseleave', 'inst_fills', function () {
        if (hoveredInstId>=0) {
            map.setFeatureState(
                { source: 'institutions', id: hoveredInstId },
                { hover: false }
            );
        }
        $("#popup1").css("display","none")
        hoveredInstId = null;
        map.getCanvas().style.cursor = "auto"
    });


    map.on('click', 'inst_fills',function (e) {
        console.log(hoveredInstId)
        if (hoveredInstId || hoveredInstId==0) {
            
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
        console.log(hoveredInstId)
        if (hoveredInstId || hoveredInstId==0) {
            $("#popup2").css("display", "block")
            
        }else{
            $("#popup2").css("display", "none")
        }
        
    });

});

$("#mapwrap").on("mousemove", function(e){
    var position = $("#mapwrap")[0].getBoundingClientRect();
    var divX = position.x
    var divY = position.y

    var mouseX=e.clientX
    var mouseY=e.clientY
    $("#popup1").css("top", mouseY-divY+18)
    $("#popup1").css("left", mouseX-divX-100)
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