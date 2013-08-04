var RATPMap = function() {
    this.damap = L.map('map').setView([48.85293755, 2.35005223818182], 12);

    this.tileLayer = L.tileLayer(
        //'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
        //'http://a.tile.openstreetmap.org/$%7Bz%7D/$%7Bx%7D/$%7By%7D.png',
        'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        {
            attribution: '&copy; OpenStreetMap'
        }
    );

    this.damap.addLayer(this.tileLayer);
    this.showPath = this.showPath.bind(this);
    this.removePath = this.removePath.bind(this);
    
    this.markers = [];
    this.lines = [];

    //this.locate({setView: true})
};

RATPMap.prototype = {
    createMarkerIcon: function(node) {
        var iconUrl = null;
        if (node.type == 0 ) { iconUrl = 'img/tram_logo.png'; }
		if (node.line == "A" || node.line == "B") { iconUrl = 'img/rer_logo.png'; }
        else if (node.type == 1 || node.type == 2) { iconUrl = 'img/metro_logo.png'; }
        if (node.type == 3 ) { iconUrl = 'img/bus_logo.png'; }
        if (node.type == 4 ) { iconUrl = 'img/troll.png'; }
        if(iconUrl) {
            return new L.Icon( {
                iconUrl: iconUrl,
                iconSize: [20, 20]
            });
        }

        return null;
    },


    createLine: function(last_node, node, type, line) {
        var node_loc = graph[node.node_id].loc;
        var last_node_loc = graph[last_node.node_id].loc;
        var color = 'yellow';

        
        if(line == 'A' || line == 'B') color = 'purple';
		else if(type == 1 || type == 2) color = 'blue';
        if(type == 3) color = 'green';                    

        return L.polyline([last_node_loc, node_loc], {
            color: color,
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
        });
    },
    
    removePath: function() {
        this.markers.forEach( function(marker) {
            this.damap.removeLayer(marker);
        }, this);
        
        this.lines.forEach( function(line) {
            this.damap.removeLayer(line);
        }, this);
    },

    showPath: function(graph, path, dist) {
        var last_node = null;
        var marker = null;
        var content = null;
        var msg = '';
		var path_details = [];
		var path_details_index = 0;
        var icon = null;
        var line = null;
        var line_type = null;
        
        this.removePath();

        path.forEach( function(node, index) {
			path_details[path_details_index] = path_details[path_details_index] || {}
			
            var node_loc = graph[node.node_id].loc;
            
            if(index == 0) {
                marker = L.marker(node_loc);
                content = 'Line: ' + node.line + ', Type: ' + node.type + ', ';
                content += graph[node.node_id].name;
                icon = this.createMarkerIcon(node);
                line_type = node.type;
            }


            if(last_node) {

                if( index == 1 ) {
                    msg += 'Line ' + last_node.line + ', ' + graph[last_node.node_id].name + ' (' + last_node.node_id + ', ' + last_node.line +  ', ' +  last_node.type +  ')';
					path_details[path_details_index].fstart = path_details[path_details_index].fstart || {};
					path_details[path_details_index].fstart.node = last_node;
				}
                
                if(
                    (
                        last_node.type != node.type && 
                        (
                            !((last_node.type == 1 && node.type == 2) ||
                            (last_node.type == 2 && node.type == 1))
                        )
                    )
                    ||
                    (
                        last_node.line != node.line &&
                        node.type != 4
                    )

                ) {
                    //msg += 'Last (' + graph[last_node.node_id].name + ', ' + last_node.line +  ', ' +  last_node.type +  ')<br>';
                    msg += ' => ' + graph[node.node_id].name + ' (' + node.node_id + ', ' + node.line +  ', ' +  node.type +  ')<br>';
   
                    marker = null;
                    
                    if( last_node.type != 4 || node.line == -1 ) {
                        //end of line marker
                        marker = L.marker(node_loc);
                        content = 'Line: ' + last_node.line + ', Type: ' + last_node.type + ', ';
                        content += graph[node.node_id].name;
                        icon = this.createMarkerIcon(last_node);
						
						path_details[path_details_index].end = path_details[path_details_index].end || {};
						path_details[path_details_index].end.node = {};
						path_details[path_details_index].end.node.line = last_node.line;
						path_details[path_details_index].end.node.type = last_node.type;
						path_details[path_details_index].end.node.dur = last_node.dur;
						path_details[path_details_index].end.node.wait = last_node.wait;
						path_details[path_details_index].end.node.dir = last_node.dir;
						path_details[path_details_index].end.node.open = last_node.open;
						path_details[path_details_index].end.node.close = last_node.close;
						path_details[path_details_index].end.node.node_id = node.node_id;
                    }

                    if(node.line != -1) {
						path_details[path_details_index].start = path_details[path_details_index].start || {};
						path_details[path_details_index].start.node = node;
						
                        if( node.type != 4 ) {
                            msg += 'Line ' + node.line;
                            
                            if(marker) { 
                                marker = L.marker(node_loc);
                                content += '<br>Correspondance<br>Line: ' + node.line + ', Type: ' + node.type + ', ';
                                content += graph[node.node_id].name;
								path_details[path_details_index].start.corresp = true;
                            }
                            else {
                                marker = L.marker(node_loc);
                                content = 'Line: ' + node.line + ', Type: ' + node.type + ', ';
                                content += graph[node.node_id].name;
								//path_details[path_details_index].start.node = node;
                            }

                            icon = this.createMarkerIcon(node);
                            
                        }
                        else {
                            msg += 'A pieds';
							path_details[path_details_index].start.foot = true;
                        }

                        msg += ', ' + graph[node.node_id].name + ' (' + node.node_id + ', ' + node.line +  ', ' +  node.type +  ')';
                    }

                }
                 
            }

            if(marker) {
                this.markers.push(marker);
                marker.bindPopup(content);
                if(icon) marker.setIcon(icon);
                marker.addTo(this.damap);
                icon = null;
                marker = null;
            }
            else {
                
            }
            if(last_node)
                line = this.createLine(last_node, node, last_node.type, last_node.line);

            if(line) {
                this.lines.push(line);
                line.addTo(this.damap);
                line = null;
            }
            
            last_node = node;
			
			if(path_details[path_details_index].start) path_details_index += 1;
        }, this);
        
        return path_details;
    }
};
