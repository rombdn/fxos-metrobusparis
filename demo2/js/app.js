
/*
showPathView( div )
showPathForm( div )
path = shortestPath( getPathFormValues() )
showPathDetails( path, div )
showMapForPath( path, div )
*/


        var graph = {};
        var req = new XMLHttpRequest();
        var user_loc = null;
        var ratp_map = null;
        var nearestStops = null;

        window.onerror = function(msg, url, line) {
            msg = 'Error at line ' + line + ': ' + msg + ' - ' + url;
            print(msg);
        }

        var print = function(msg) {
            document.getElementById('errors').innerHTML += msg + '<br>';
			//console.log(msg);
        }
		
		var loadingMsg = function(options) {
			document.getElementById(options.element).innerHTML = '<progress></progress> ' + options.msg;
			document.getElementById(options.element).style.display = options.display;
		}
		
		var showTextualPath = function(path_details) {
			//fstart => first point
			//end => end of the edge
			//start => beginning of the next edge
			
			var current_d = 0;
			var delta_d = 0;
			var start = null;
			var corresp = false;
			var foot = false;
			var innerHTML = '<table><tr><td></td><td></td><td></td></tr>';
			
			console.log(path_details);
			each(path_details, function(milestone) {
				//console.log('object');
				
				if(milestone.fstart) {
					innerHTML += '<tr>';
					if(milestone.fstart.node.line == 'A' || milestone.fstart.node.line == 'B')
						innerHTML += '<td>RER ' + milestone.fstart.node.line + '</td>';
					else if(milestone.fstart.node.type == 0)
						innerHTML += '<td>T' + milestone.fstart.node.line + '</td>';
					else if(milestone.fstart.node.type == 1 || milestone.fstart.node.type == 2)
						innerHTML += '<td>M' + milestone.fstart.node.line + '</td>';
					else if(milestone.fstart.node.type == 3)
						innerHTML += '<td>Bus ' + milestone.fstart.node.line + '</td>';
					else if(milestone.fstart.node.type == 4)
						innerHTML += '<td></td>';
					
					if(milestone.end) {
						if(milestone.fstart.node.type != 4)
							innerHTML += '<td>' + graph[milestone.fstart.node.node_id].name + ' => ' + graph[milestone.end.node.node_id].name + ' (direction ' + milestone.fstart.node.dir + ')</td>';
						else
							innerHTML += '<td>A pieds</td>';
						innerHTML += '<td>' + milestone.end.node.dur + 's</td>';
						innerHTML += '</tr>';
						
						//innerHTML += graph[milestone.fstart.node.node_id].name + ' => ' + graph[milestone.end.node.node_id].name + ' : ' + milestone.end.node.dur + 's<br>';
						console.log(graph[milestone.fstart.node.node_id].name, ' => ', graph[milestone.end.node.node_id].name, ': ', milestone.fstart.node.dur);
						current_d = milestone.end.node.dur;
					}
					else {
						if(milestone.fstart.node.type != 4)
							innerHTML += '<td>' + graph[milestone.fstart.node.node_id].name + ' => ' + graph[milestone.start.node.node_id].name + ' (direction ' + milestone.fstart.node.dir + ')</td>';
						else
							innerHTML += '<td>A pieds</td>';						
						innerHTML += '<td>' + milestone.start.node.dur + 's (dont attente ' + milestone.start.node.wait + 's)</td>';
						innerHTML += '</tr>';
						
						//innerHTML += graph[milestone.fstart.node.node_id].name + ' => ' + graph[milestone.end.node.node_id].name + ' : ' + milestone.end.node.dur + 's<br>';
						console.log(graph[milestone.fstart.node.node_id].name, ' => ', graph[milestone.start.node.node_id].name, ': ', milestone.fstart.node.dur);
						current_d = milestone.start.node.dur;
					}
				}
						
				if(milestone.end) {
					if(start) {
						innerHTML += '<tr>';
						if(start.node.line == 'A' || start.node.line == 'B')
							innerHTML += '<td>RER ' + start.node.line + '</td>';
						else if(start.node.type == 0)
							innerHTML += '<td>T' + start.node.line + '</td>';
						else if(start.node.type == 1 || start.node.type == 2)
							innerHTML += '<td>M' + start.node.line + '</td>';
						else if(start.node.type == 3)
							innerHTML += '<td>Bus ' + start.node.line + '</td>';
						innerHTML += '<td>' + graph[start.node.node_id].name + ' => ' + graph[milestone.end.node.node_id].name + ' (direction ' + start.node.dir + ')</td>';
						innerHTML += '<td>' + (milestone.end.node.dur - current_d) + 's</td>';
						innerHTML += '</tr>';
						
						//innerHTML += graph[start.node.node_id].name + ' => ' + graph[milestone.end.node.node_id].name + ' : ' + (milestone.end.node.dur - current_d) + 's<br>';
						console.log(graph[start.node.node_id].name, ' => ', graph[milestone.end.node.node_id].name, ': ', milestone.end.node.dur - current_d);
						start = null;
					}
					/*
					if(corresp) {
						console.log('Correspondance :', milestone.end.node.dur - current_d, 's');
						corresp = false;
					}
					if(foot) {
						console.log('A pieds :', milestone.end.node.dur - current_d, 's');
						foot = false;
					}*/ 
					/*
					if(milestone.start) {
						if(milestone.start.corresp) {
							console.log('Correspondance : ', milestone.start.dur - current_d, 's');
						}
						if(milestone.start.foot) {
							console.log('A pieds : ', milestone.start.dur - current_d, 's');
						}
					}*/
					
					//delta_d = milestone.end.node.dur - current_d;
					current_d = milestone.end.node.dur;
				}
				if(milestone.start) {
					if(milestone.start.corresp || milestone.start.foot) {
						//console.log('...');
						
						innerHTML += '<tr>';
						innerHTML += '<td></td>';
						
						if(milestone.start.corresp) {
							innerHTML += '<td>Correspondance</td>';
							//innerHTML += 'Correspondance : ' + (milestone.start.node.dur - current_d) + 's (dont attente: ' + milestone.start.node.wait + 's)<br>';
						}
						else {
							innerHTML += '<td>A pieds</td>';
							//innerHTML += 'A pieds : ' + (milestone.start.node.dur - current_d) + 's (dont attente: ' + milestone.start.node.wait + 's)<br>';
						}
						
						innerHTML += '<td>' + (milestone.start.node.dur - current_d) + 's (dont attente: ' + milestone.start.node.wait + 's)</td>';
						innerHTML += '</tr>';
						
						//innerHTML += 'Correspondance : ' + (milestone.start.node.dur - current_d) + 's (dont attente: ' + milestone.start.node.wait + 's)<br>';
						console.log('Correspondance : ', milestone.start.node.dur - current_d, 's (dont attente: ', milestone.start.node.wait, 's)');
						//corresp = true;
						current_d = milestone.start.node.dur;
						//console.log('Correspondance :', milestone.start.dur - current_d, 's');
					}
					if(milestone.start.foot) {
						/*innerHTML += '<tr>';
						innerHTML += '<td></td>';
						innerHTML += '<td>Correspondance</td>';
						innerHTML += '<td>' + milestone.start.node.dur - current_d + 's (dont attente: ' + milestone.start.node.wait + 's</td>';
						innerHTML += '</tr>';
						//innerHTML += 'A pieds : ' + (milestone.start.node.dur - current_d) + 's (dont attente: ' + milestone.start.node.wait + 's)<br>';
						console.log('A pieds : ', milestone.start.node.dur - current_d, 's (dont attente: ', milestone.start.node.wait, 's)');
						//foot = true;
						current_d = milestone.start.node.dur;
						//console.log('A pieds : ', milestone.start.dur - current_d, 's');*/
					}
					else {
						//store start for next milestone when we will know end
						start = milestone.start;
					}
				}
			});
			
			innerHTML += '<tr><td></td><td><strong>Total</strong></td><td><strong>' + current_d + 's</strong></td></tr></table>';
			
			return innerHTML;
		}

        var loadGraph = function(callback_success) {
            var date_start = new Date();

            print('Loading graph...');
			loadingMsg({element: 'mainload', msg: 'Downloading Graph', display: 'block'});
            req.open('GET', 'ratp/graph-mini-v2.json');
            req.onreadystatechange = function(a) {
                if( req.readyState == 4 ) {
                    if( req.status == 200) {
                        var date_end = new Date();
                        print('Graph loaded in ' + (date_end.getTime() - date_start.getTime())/1000);
                        print('');
                        print('Parsing graph...');
						loadingMsg({element: 'mainload', msg: 'Parsing Graph', display: 'block'});
                        
                        setTimeout( function() {
                            date_start = new Date();
                            graph = JSON.parse( req.responseText );
                            date_end = new Date();
                            print('Graph parsed in ' + (date_end.getTime() - date_start.getTime())/1000);
							loadingMsg({element: 'mainload', msg: '', display: 'none'});
                            print('');
                            callback_success();
                        }, 100);
                    }
                    else {
                        console.log(a);
                        throw "Error while loading graph";
                    }
                }
            }
            req.send(null);
        }

        var parcours = function() {
            var start = graph['2390'];
            var q = [start];

            while(q.length > 0) {
                node = q.shift();

                print('Current station : ' + node.name);
                //console.log('Edges : ');

                node.edges.forEach( function(edge) {
                    //console.log(edge);
                    if(!graph[edge.dest].visited) {
                        if(edge.type == "1" && edge.line == "6") {
                            q.push(graph[edge.dest]);
                        }
                    }
                });

                node.visited = 1;
            }
        }

        var findNode = function(name_with_zip) {
            var result_id = null;
            var name = name_with_zip.match(/(.*) -/)[1];
            var zip = name_with_zip.match(/[0-9]{5}/)[0];


            for(var node_id in graph) {
                var node_name = graph[node_id].name;
                var node_zip = graph[node_id].zip;

                if(node_name == name && node_zip == zip) {
                    result_id = node_id;
                    break;
                }
            } 

            if(result_id) return result_id;

            console.log('Unable to find ' + name + ' in graph');
            return null;     
        }

        var locSuccess = function(position) {
            user_loc = {lat: position.coords.latitude, lon: position.coords.longitude};
            //getCoords(user_loc);
            //document.getElementById('start_use_loc').style.display = 'block';
            //document.getElementById('end_use_loc').style.display = 'block';
        }

        var findNodesWithinRadius = function(graph, loc, radius) {
            var d;
            var results = [];
            var temp = 0;

            for(var id in graph) {
                d = getDistanceFromLatLonInM(loc.lat, loc.lon, graph[id].loc.lat, graph[id].loc.lon);
                if( d < radius ) {
                    //console.log(id + ': ' + graph[id].name);
                    results.push({id: id, dist: d});
                }
            }
            return results;       
        }

        var addUserToGraph = function(graph, user_loc) {
            var prox_nodes = nearestStops || findNodesWithinRadius(graph, user_loc, 1000);
            nearestStops = prox_nodes;
            var user_edges = [];

            prox_nodes.forEach( function(node) {
                user_edges.push({
                    "dest": node.id,
                    "dur" : node.dist / 1.1, //4Km/h = 1.1m/s
                    "type": 4
                });

                graph[node.id].edges.push({
                    "dest": 'user',
                    "dur": node.dist / 1.1,
                    "type": 4
                });
            });

            //add user node
            graph['user'] = {
                name: 'User',
                loc: {
                    lat: user_loc.lat,
                    lon: user_loc.lon
                },
                edges: user_edges
            }
        }

        var find_min = function(graph, nodes_processed, dist) {
            var min = 10000;
            var min_id = -1;

            for(var key in Object.keys(graph)) {
                if( nodes_processed[key] == 1)
                    continue;
                if( dist[key] < min ) {
                    min = dist[key];
                    min_id = key;
                }
            }

            return min_id;
        }

        var isEdgeOpen = function(edge) {
            var now = new Date();
            var now_h = now.getHours();
            var now_m = now.getMinutes();

            if( edge.type == 4 )
                return true;

            //noctilien
            if( edge.line.indexOf('N') == 0 ) {
                var temp = edge.begin;
                edge.begin = edge.end;
                edge.end = temp;
            }

            try {
                var start_h = edge.begin.match(/(.*)h/)[1];
                var start_m = edge.begin.match(/h(.*)/)[1];
                var end_h = edge.end.match(/(.*)h/)[1];
                var end_m = edge.end.match(/h(.*)/)[1];
            }
            catch(e) {
                console.log('FAIL');
                console.log(edge);
                console.log(edge.begin.match(/(.*)h/));
                console.log(edge.begin.match(/h(.*)/));
                console.log(edge.end.match(/(.*)h/));
                console.log(edge.end.match(/h(.*)/));
                console.log('');
            }

            if( (start_h < now_h) && (now_h < end_h) ) {
                return true;
            }

            else if( start_h == now_h ) {
                if( start_m <= now_m ) {
                    return true;
                }
            }

            else if( end_h == now_h ) {
                if( now_m <= end_m ) {
                    return true;
                }
            }

            console.log(graph[edge.dest].name + ', ' + edge.line + ', hours: ' + edge.begin + ' to ' + edge.end);
            console.log('EDGE: ' + start_h + ', ' + end_h);
            console.log('NOW: ' + now_h);
            console.log((start_h < now_h) && (now_h < end_h));

            return false;
        }
        

        var dijkstra = function(graph, start_id, end_id) {
            var dist = {};
            var previous = {};
            var lines = {};
            var date_start;

            dist[start_id] = 0;

            var u_id = -1;

            date_start = new Date();
			
			loadingMsg({element: 'routeload', msg: 'Binary Heap creation', display: 'block'});
			
            var Q = new BinaryHeap(
                function(node) { return node.dist; },
                function(node) { return node.id; },
                'dist'
            );

            Object.keys(graph).forEach( function(id) {
                if( id != start_id ) {
                    Q.push( {id: id, dist: 10000} );
                    dist[id] = 10000;
                }
                else {
                    Q.push( {id: start_id, dist: 0 });
                    dist[id] = 0;
                }
            });
            print('Heap created in: ' + (new Date().getTime() - date_start.getTime())/1000);
            print('');
			loadingMsg({element: 'routeload', msg: 'Looking for shortest path', display: 'block'});

            //console.log('First element in Q: ', Q.content[0]);
            console.log('Q size: ', Q.size());

            date_start = new Date();
            console.log('Dijkstra start: ')
            console.log(date_start);
            

            while( Q.size() > 0 ) {
                //find min
                u = Q.pop();
                u_id = u.id;
                //dist[u_id] = u.dist; //in init?

                //nodes_processed[u_id] = 1;
                //console.log('Station la plus proche non visite: ' + graph[u_id].name +', distance: ' + dist[u_id]);
                
                //end if end found or if all remaining nodes unreachable
                if(u_id == end_id) break;
                
                
                graph[u_id].edges.forEach(function(edge) {
				
					edge.freq = edge.freq || 600;
					//console.log(edge.freq);

                    //detect correspondences
                    if( previous[u_id] 
                        && previous[u_id].line != edge.line
                        && edge.type != 4) { 
                        //console.log('Correspondance!');
                        //console.log('Edge dest id: ', edge.dest, ', Prev line :', previous[u_id].line, 
                        //    ', Edge line: ', edge.line, ', Edge type: ', edge.type,
                        //    ', Freq ', edge.freq
                        //);
                        if(edge.type == 3 && previous[u_id].type != 3) { //bus
                            //delta = 500;
                            delta = edge.freq;
                        }
                        else {
                            //delta = 0;
                            //delta = 500; //avg metro corresp + wait
                            delta = edge.freq;
                        }
                    }
                    else if( edge.type == 4 ) {
                        delta = 300; //slow down walking
                    }
                    else { delta = 0; } //no correspondence
                    
                    //if(delta != 0) console.log('attente a la correspondance: ', delta, edge.freq);
                    //if(delta != edge.freq) console.log('AAAAAAAH', delta, edge.freq);

/*
                    if( u.id == 'user' ) {
                        console.log('Current Edge: ' + graph[edge.dest].name, ', ', dist[edge.dest], ' > ', dist[u_id],
                            ' + ', edge.dur,
                            ' + ', delta,
                            dist[edge.dest] > edge.dur + delta);
                        //console.log(u);
                    }*/

                    //SHOULD NOT HAPPEN, MEANS AN EDGE REFER TO AN UNKNOWN NODE (SEE init ABOVE)
                    if(dist[edge.dest] === undefined) {
                        console.log('WARNING, graph[\'', edge.dest, '\'],', ' refers to an unknown node');
                        //dummy node
                        graph[edge.dest] = {
                            name: 'unknown',
                            edges: []
                        };
                        Q.push( {id: edge.dest, dist: 10001} );
                        dist[edge.dest] = -1; //ensure the test below will never pass, so this edge cannot be selected
                    }
					
                    
                    else if( dist[edge.dest] > dist[u_id] + edge.dur + delta) {
						/*
                        console.log(graph[start_id].name + '--' + dist[edge.dest] + '-->' 
                            + graph[edge.dest].name + ' > ' + graph[start_id].name 
                            + '--' + dist[u_id] + '-->' + graph[u_id].name + '--' + edge.dur + '-->' + graph[edge.dest].name);
                        console.log(' ' + graph[start_id].name + ' -> ' + graph[edge.dest].name + ' = ' + (dist[u_id] + edge.dur));
                        */

                        //if( edge.line != )

                        //if( isEdgeOpen(edge) ) {
                        if( !edge.line || edge.line.indexOf('N') != 0) { //get rid of noctilien (just after midnight?)
                            dist[edge.dest]             = dist[u_id] + edge.dur + delta;
                            previous[edge.dest]         = {};
                            previous[edge.dest].node_id = u_id;
                            previous[edge.dest].line    = edge.line;
                            previous[edge.dest].type    = edge.type;
							previous[edge.dest].dir     = edge.dir;
							previous[edge.dest].wait    = delta;
							previous[edge.dest].dur     = Math.round(dist[edge.dest]);
                            
                            Q.decreaseKey(edge.dest, dist[edge.dest]);
                        }
                        //}
                        //else {
                        //    console.log(graph[edge.dest].name + ' closed: ' + edge.begin + ' to ' + edge.end);
                        //}
                    }
                });
            }

            var date_end = new Date()
            print('Shortest path found in : ' + (date_end.getTime() - date_start.getTime())/1000);
			

            print('Shortest path : ' + Math.floor(dist[end_id]/60) + ' minutes');

            print('');
            
            //create path
            var path = [{node_id: end_id, line: -1}];
            var prev = {node_id: end_id, line: -1};
            while(true) {
                prev = previous[prev.node_id];
                //console.log(prev);
                if(!prev) break;
                path.push(prev);
            }

            path.reverse();

            //display path
            var disp = '';
            var last_node = null;
            
            path.forEach( function(node, index) {
                if(index == 0) {
                    disp += 'Line: ' + node.line + ', Type: ' + node.type + ', ';
                    disp += graph[node.node_id].name;
                }

                if(last_node && 
                    ( (last_node.line != node.line && last_node.type != 4)
                        || (last_node.type != node.type 
                            && (last_node.type != 2 && node.type != 2) 
                            )
                    ) 
                  )
                {
                    disp += ' => ' + graph[node.node_id].name + '<br>';
                    if(last_node.type) {
                        disp += 'Correspondance: ';
                        disp += last_node.type + ', ' + dist[node.node_id] + 's <br>';
                    }

                    if(node.type != 4) disp += 'Line: ' + node.line + ', Type: ' + node.type + ', dur:' + dist[node.node_id] + 's' + ', attente: ' + node.freq;
                    if(node.type == 4) disp += 'A pieds';
                    
                    disp += ', ' + graph[node.node_id].name;

                }

                last_node = node;
                
            });
            print(disp);
			//loadingMsg({element: 'routeload', msg: '', display: 'none'});

            return {path: path, dist: dist};
        }

        var user_added = false;
        var findPath = function() {
            var start_name   = document.getElementById('start').value;
            var end_name     = document.getElementById('end').value;
            var use_start_loc     = document.getElementById('checkbox-start').checked;
            var use_end_loc     = document.getElementById('checkbox-end').checked;
            var start_id     = null;
            var end_id       = null;

            user_loc = {lat: 48.837153, lon: 2.391365}; //DEBUG
            if(!user_added) {
                addUserToGraph(graph, user_loc);
                user_added = true;
            }
            
            console.log(use_start_loc);
            console.log(use_end_loc);

            if( use_start_loc ) {
                start_id = 'user';
                end_id = findNode(end_name);
            }
            else if( use_end_loc ) {
                start_id = findNode(start_name);
                end_id = 'user';
            }
            else {
                start_id = findNode(start_name);
                end_id = findNode(end_name);
            }

            print('Shortest path from ' + graph[start_id].name + ' to ' + graph[end_id].name + ' in graph...');

            var result;
            setTimeout( function() {
                result = dijkstra(graph, start_id, end_id);
            }, 100);

            //var path = result.path;
            
            
            setTimeout(function() {
                print('Loading Map...');
				loadingMsg({element: 'routeload', msg: 'Loading Map', display: 'block'});
                var date_start_2 = new Date();
                ratp_map = ratp_map || new RATPMap();
                var path_details = ratp_map.showPath(graph, result.path, result.dist);
                print('Map loaded in : ' + (new Date().getTime() - date_start_2.getTime())/1000);
				loadingMsg({element: 'routeload', msg: '', display: 'none'});
				document.getElementById('routeTextContainer').innerHTML = showTextualPath(path_details);
            }, 100);
        }


        var autocomplete = function(e) {
            var name = e.target.value;
            if(name.length < 3) return;

            console.log(name);

            for(var node_id in graph) {
                if(graph[node_id].name.indexOf(e.target.value) != -1)
                    print(graph[node_id].name);
            }
            console.log(e);
/*
            for(var node_id in graph) {
                var node = graph[node_id];
                if(node.name == start_name) {
                    start_node_id = node_id;
                }
                if(node.name == end_name) {
                    end_node_id = node_id;
                }
            } 
            */
        }

        var setListeners = function() {
            var button = document.getElementById('find');
            button.addEventListener('click', findPath);
            //var start_input = document.getElementById('start');
            //start_input.addEventListener('keypress', autocomplete);
            
            var node_names = map(graph, function(node) { 
                var result = node.name + ' - ' + node.zip;
                if(result.toUpperCase() == result) result += " (Bus/Tramway)";
                else result += " (Metro/RER)";
                return result;
            });

            $('#start').typeahead({
                source: node_names
            });

            $('#end').typeahead({
                source: node_names
            });
            
            print('setListeners finished');
            //getCoords({lat: 48.837153, lon: 2.391365}); //DEBUG;
            /*
            console.log($('#btn-clear-start'));
            $('#btn-clear-start').click(function(e) { 
                console.log($('#start').val()); 
                $('#start').val('foo'); 
                console.log($('#start').val());
                setTimeout(function() { console.log($('#start').val()); }, 1000);
            });
            $('#btn-clear-end').click(function(e) { $('#end').val('foo'); });
*/
            //console.log(map(graph, function(node) { return node.name; }));
            //console.log(graph['1987']);
            //var foo = graph['1987'];
            //each(foo, function(prop) { console.log(prop); });
        }
/*
        each([1,2,3,4], function(number) {
            console.log(number);
        });
*/
        
        //console.log(map([1,2,3,4], function(number) { number % 2 == 0; }).length);
        //console.log(map([{id: 1, name: 2, truc: 3, foo: 4}], function(number) { return number.id; }));
/*
        var bar2 = [1, 2, 4, 5];
        var bar = {id: 1, name: 2, truc: 3, foo: 4};
        for(var key in Object.keys(bar2)) {
            console.log(key);
        }        */

        navigator.geolocation.getCurrentPosition(
            locSuccess, 
            function() { 
                console.log('Unable to locate'); 
                print('Unable to locate'); 
                $('#p-loc-start').append(' (localisation impossible)');
                $('#p-loc-end').append(' (localisation impossible)');
                $('#checkbox-start').prop('checked', false);
                $('#checkbox-start').prop('disabled', true);
                $('#checkbox-end').prop('checked', false);
                $('#checkbox-end').prop('disabled', true);
                $('#start').attr('disabled', false);
                $('#end').attr('disabled', false);
                
            },
            { timeout: 2000 }
        );


        
var showPathView = function() {
    print('showPathView');
	//document.getElementById('main').innerHTML = '';
    loadGraph(setListeners);
}

/*
var showMetroMapView = function() {
    document.getElementById('main').innerHTML = '';
}
*/

showPathView();
//setTimeout(showPathView, 2000);



//checkboxes
            $('#checkbox-start').change( function(e) {
                if($('#checkbox-end').prop('checked')) {
                    e.preventDefault();
                    e.stopPropagation();
                    $('#checkbox-start').prop('checked', false);
                    return false;
                }
                else {
                    if( this.checked ) {
                        console.log($('#checkbox-end').prop('checked') );
                        $('#start').val('');
                        $('#start').attr('disabled', true);
                    }
                    else {
                        $('#start').attr('disabled', false);
                    }
                }
            });
            
            $('#checkbox-end').change( function(e) {
                if($('#checkbox-start').prop('checked')) {
                    e.preventDefault();
                    e.stopPropagation();
                    $('#checkbox-end').prop('checked', false);
                    return false;
                }
                else {
                    if( this.checked && !$('#checkbox-start').prop('checked') ) {
                        $('#end').val('');
                        $('#end').attr('disabled', true);
                    }
                    else {
                        $('#end').attr('disabled', false);
                    }
                }
            });

