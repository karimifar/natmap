mapboxgl.accessToken = 'pk.eyJ1Ijoia2FyaW1pZmFyIiwiYSI6ImNqOGtnaWp4OTBjemsyd211ZDV4bThkNmIifQ.Xg-Td2FFJso83Mmmc87NDA';


var bounds = [
    [-113.983901, 20.833183], // Southwest coordinates
    [-86.097884,40.646082]  // Northeast coordinates
];
var firstSymbolId;
var hoveredPcrId = null;
var zoomThreshold = 9
var pcr_data;
var req_url = "https://texashealthdata.com/api/tchmb/nat/pcrs"

$.get(req_url, function(data){
    pcr_data = data;
    console.log(pcr_data)
    var total = pcr_data[pcr_data.length-1]
    console.log(total)
    $("#tot-enr").html("("+total.enrolled_n+")")
    $("#tot-inp").html("("+total.in_progress_n+")")
    $("#menu form").append("Total number of birthing hospitals: "+total.hospitals_t)

    var up_date = "Last updated on "+total.pcr;
    var enrBar= "<div class='bar enr-p' style=width:"+total.enrolled_p+"%><div>"
    var inpBar= "<div class='bar inp-p' style=width:"+total.in_progress_p+"%><div>"
    var barchart = $("<div class='barchart'>")
        .append(enrBar)
        .append(inpBar)
    $("#menu").append(barchart)
    .append("<p id='up-date'>"+up_date+"</p>")

})


var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/karimifar/ckkd94fbp02ij17p9z9lm7rwa',
    center: [-100.113241, 31.079125],
    zoom: 5,
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
        'maxzoom': zoomThreshold,
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
            var pcr = e.features[0].properties.PCR_name;
            var pcr_a = "PCR " + e.features[0].properties.PCR;
            var thePCR;
            for (var i=0; i<pcr_data.length; i++){
                if(pcr_data[i].pcr == pcr_a){
                    thePCR = pcr_data[i];
                }
            }
            var hosp_t = thePCR.hospitals_t;
            var enr_n = thePCR.enrolled_n | 0;
            var inp_n = thePCR.in_progress_n | 0;

            var enr_p = thePCR.enrolled_p + "%"
            var inp_p = thePCR.in_progress_p + "%"
            var enrBar= "<div class='bar enr-p' style=width:"+enr_p+"><div>"
            var inpBar= "<div class='bar inp-p' style=width:"+inp_p+"><div>"
            var barchart = $("<div class='barchart'>")
                .append(enrBar)
                .append(inpBar)

            var pcr_name = "<p class='pcr-name'>"+pcr+"</p>";
            var totalHosp = "<p class='total-hosp'><span>Total hospitals: </span>"+hosp_t+"</p>";
            var enr_info = "<p class='enr_info'><span>Enrolled: </span>"+enr_n+" ("+enr_p+")</p>";
            var inp_info = "<p class='inp_info'><span>Enrollment in progress: </span>"+inp_n+" ("+inp_p+")</p>";

            var infDiv = $("<div class='info'>")
                .append(pcr_name).append(totalHosp).append(enr_info).append(inp_info)
            $("#pcr-pop").html(infDiv)
                .append(barchart)
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
            console.log(feature)
            var feature_id = feature.id
            // map.setFeatureState(
            //     { source: 'composite', sourceLayer: 'nat-enrolled' , id: feature_id },
            //     { hover: true }
            // );
            // console.log(feature.state)
            
            var coordinates = feature.geometry.coordinates.slice();
            var enrollment = feature.properties.enr_status;
            var county = feature.properties.county;
            var enroll_class = enrollment.replace(/\s+/g, '-').toLowerCase();

            var description = '<p class='+enroll_class+'>' + enrollment + '</p><h3>' + feature.properties.name + '</h3><p>Located in <span>'+county+" County</span></p>"
             
            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
            
        });
             
        map.on('mouseleave', layername, function () {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    }
    
    

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