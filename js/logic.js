jQuery(function(){
        var keyscene_names = [
            { id:"inciting_incident", name:"Inciting Incident", x:'10%', containment: '#containment_act1'},
            { id:"resolve", name:"Resolve", x:'90%', containment: '#containment_act3'},
            { id:"plot_point_1", name:"Plot Point 1", x:'33%', containment: '#containment_pp1'},
            { id:"plot_point_2", name:"Plot Point 2", x:'66%', containment: '#containment_pp2'},
            { id:"central_point", name:"Central Point", x:'50%', containment: '#containment_cp'}
        ];

        var scenes = [];

        $('#scenes').mousedown(function(e){
          if( $(e.target).attr('id') == 'scenes' 
              && $(e.currentTarget).attr('id') == 'scenes'){
            var conf = get_scene_conf(e);
            var $s = create_scene(conf);
            update_scene( $s );
            update_text_display( {target:$s} );
            update_canvas();
          }
        });

        function get_scene_conf(e){
          if( keyscene_names.length > 0 ){
             var conf = keyscene_names.shift();
             conf.y = e.pageY;
             return conf;
          }
          var percentage_x = as_percentage( e.pageX - 30, $(window).width()) + '%';
          return {
            x: percentage_x,
            y: e.pageY,
            id: 'id_' + scenes.length,
            name: '',
            containment: '#scenes'
          } ;
        }
          
        function create_scene( conf ){
          var $s = create_scene_div( conf.x, conf.y, conf.id, conf.containment );
          scenes.push({
            $node: $s,
            name: conf.name,
            id: conf.id
          });
          $('#scenes').append($s);
          return $s;
        }
        
        function create_scene_div ( x, y, id, containment ) {
          return $( "<div class='scene'>")  
            .attr('id', id)
            .css({
              position: 'absolute',
              left: x ,
              top: y + 'px'
            })
            .draggable({
              start: update_text_display,
              cancel:'a',
              containment: containment,
              drag: on_drag,
              stop: on_drag
            })
            .click( update_text_display )
            .append( get_svg_arrow() );
        }

        function on_drag (e, ui){
          update_scene( $(this) );
          update_canvas();
        }

        function update_canvas () {
          if (document.getElementById('canv').getContext && scenes.length > 1  ) {
            var coords = [];
            for (var i=0; i< scenes.length; i++){
              coords.push({
                x: Math.floor( scenes[i].$node.position().left 
                             + scenes[i].$node.width() / 2 ),
                y: Math.floor( scenes[i].$node.position().top 
                             + scenes[i].$node.height() / 2 )
              });
            }
            coords.sort( function(a, b){
              if( a.x > b.x ){ 
                return -1 ;
              }
              else if( a.x < b.x ){ 
                return 1 ;
              }
              return 0;
            });
            draw_connecting_lines( coords );
          }
        }

        function update_scene ( $scene ){
          var scene_y = $scene.position().top;
          var scale = scene_y / $('#scenes').height() ;
          var sat = Math.abs( Math.floor ( (scale - 0.5) * 100) );
          var hue = 'hsl(' + (120 -( 120 * scale )) + ', 100%, 50%)' ;
          var degrees = 60 - Math.floor(120 - (120 * scale)) ;
          var rot = 'rotate(' + degrees + 'deg)';
          var svg = $scene.find('svg');
          svg.css({
            fill: hue,
            transform: rot
          });
        }

        function draw_connecting_lines (coords) {
          var canvas = document.getElementById('canv');
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.beginPath();
          for (var i=0; i< coords.length; i++){
            if( i == 0 ) {
              ctx.moveTo( coords[i].x, coords[i].y );
            }
            else {
              ctx.lineTo( coords[i].x, coords[i].y );
            }
          }
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#999999';
          ctx.stroke();
        }

        function update_text_display( e ){
          var id;  
          if( $(e.target).hasClass('scene') ){
            id = $(e.target).attr('id') ;
          }
          else{
            id = $(e.target).closest('.scene').attr('id');
          }
          var scene_data = get_scenedata_by_id( id );
          $("#text #scene_type")
            .val( scene_data.name || '' );
          $("#text #scene_id")
            .val(id);
          $("#text #scene_description")
            .val( scene_data.description || '' );
        }

        function get_scenedata_by_id ( id ){
          var scene_data;
          $.each(scenes, function(i, v){
            if( v.id == id ){
              scene_data = v;
            }
          });
          return scene_data;
        }

        function get_svg_arrow(){
         return '<svg width="64" height="64" viewbox="0 0 64 64"><g transform="translate(15, 10)"><g transform="scale(0.07)"><path d="M 495.174 243.591 L 262.67 441.9 L 262.67 378.152 L 6.531 378.152 L 6.531 109.529 L 262.67 109.529 L 262.67 45.282 Z"/></g></g></svg>';
        }

        function adapt_size(){
          var canvas = document.getElementById('canv');
          var ctx = canvas.getContext('2d');
          ctx.canvas.width = $('#background').width();
          ctx.canvas.height = $('#background').height();

          // containments
          var w = $(window).width();
          var center = w / 2;
          var oneThird = w / 3;
          $('#containment_cp' ).css({ left: ( center - 30 ) + 'px' }),
          $('#containment_pp1').css({ left: ( oneThird - 30 ) + 'px' });
          $('#containment_pp2').css({ left: ( 2 * oneThird - 30 ) + 'px' });
        }

        $(window).resize( function(){
          adapt_size();
          update_canvas();
        });

        $('#text #scene_description')
          .keyup( save_scene_description );

        function save_scene_description(){
          var scene_id = $('#text #scene_id').val();
          get_scenedata_by_id( scene_id ).description = $(this).val();
        }

        adapt_size();

        function as_percentage(part, whole){
          return ( part / whole ) * 100 ;
        }



  });
