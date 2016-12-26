jQuery(function(){
        var scenes = [];
        var keyscenes = get_keyscenes();

        function get_keyscenes (){
          return [
            { id:"inciting_incident", name:"Inciting Incident", x:'10%', containment: '#containment_act1'},
            { id:"resolve", name:"Resolve", x:'90%', containment: '#containment_act3'},
            { id:"plot_point_1", name:"Plot Point 1", x:'32%', containment: '#containment_pp1'},
            { id:"plot_point_2", name:"Plot Point 2", x:'64%', containment: '#containment_pp2'},
            { id:"central_point", name:"Central Point", x:'50%', containment: '#containment_cp'}
          ];
        }

        function get_scene_config(e){
          if( keyscenes.length > 0 ){
             var conf = keyscenes.shift();
             console.log( conf);
             conf.x = px( conf.x, $(window).width() );
             conf.y = e.pageY;
             console.log( conf);
             return conf;
          }
          return {
            x: e.pageX,
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
            x: conf.x,
            y: conf.y,
            id: conf.id,
            containment: conf.containment
          });
          $('#scenes').append($s);
          return $s;
        }
        
        function create_scene_div ( x, y, id, containment ) {
          return $( "<div class='scene'>")  
            .attr('id', id)
            .css({
              position: 'absolute',
              left: x + 'px',
              top: y + 'px' 
            })
            .draggable({
              start: update_text_display,
              cancel:'a',
              containment: containment,
              drag: on_drag,
              stop: on_drag
            })
            .click(function(e){
              update_text_display(e);
              set_active( $(this) );
            })
            .append( get_svg_arrow() );
        }

        function on_drag (e, ui){
          set_active( $(this));
          update_arrow( $(this) );
          update_canvas();
        }

        function update_canvas () {
          var canvas = document.getElementById('canv'),
              ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (document.getElementById('canv').getContext && scenes.length > 1  ) {
            scenes.sort( function(a, b){
              var a_pos = get_coords ( a.$node ),
                  b_pos = get_coords ( b.$node ); 
              if( a_pos.x > b_pos.x ){ 
                return 1 ;
              }
              else if( a_pos.x < b_pos.x ){ 
                return -1 ;
              }
              return 0;
            });
            ctx.beginPath();
            for (var i=0; i< scenes.length; i++){
              var coords = get_coords(scenes[i].$node);
              if( i == 0 ) {
                ctx.moveTo( coords.x, coords.y );
              }
              else {
                ctx.lineTo( coords.x, coords.y );
              }
            }
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#999999';
            ctx.stroke();
          }
        }

        function get_coords( $node ){
          var x = Math.floor( $node.position().left + $node.width() / 2 ) ,
              y = Math.floor( $node.position().top + $node.height() / 2 ) ;
          return {x: x, y: y};
        }

        function update_arrow ( $scene ){
          var scene_y = $scene.position().top,
              scale = scene_y / $('#scenes').height(),
              sat = Math.abs( Math.floor ( (scale - 0.5) * 100) ),
              hue = 'hsl(' + (120 -( 120 * scale )) + ', 100%, 50%)',
              degrees = 60 - Math.floor(120 - (120 * scale)),
              rot = 'rotate(' + degrees + 'deg)',
              $svg = $scene.find('svg');

          $svg.css({
            fill: hue,
            transform: rot
          });
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
          $("#text #scene_type") .val( scene_data.name || '' );
          $("#text #scene_id") .val(id);
          $("#text #scene_description") .val( scene_data.description || '' );
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
          var canvas = document.getElementById('canv'),
              ctx = canvas.getContext('2d');
          ctx.canvas.width = $('#background').width();
          ctx.canvas.height = $('#background').height();

          $.each(scenes, function(i, v ){
            console.log( 
              v.$node.css('top'),
              v.$node.css('left')  );
          });

          // containments
          var w = $(window).width(),
              center = w / 2,
              oneThird = w / 3;
          $('#containment_cp' ).css({ left: ( center - 30 ) + 'px' }),
          $('#containment_pp1').css({ left: ( oneThird - 30 ) + 'px' });
          $('#containment_pp2').css({ left: ( 2 * oneThird - 30 ) + 'px' });
        }

        function save_scene_description(){
          convert_scene_positions_to_percentage();
          var scene_id = $('#text #scene_id').val();
          get_scenedata_by_id( scene_id ).description = $(this).val();
          update_model_display();
        }

        function update_model_display(){
          convert_scene_positions_to_percentage();
          $('#text #model').val( serialize_scenes_data() );
        }

        function percent(part, whole){
          return ( part / whole ) * 100 ;
        }


        function px(percent, max){
          if( typeof(percent) == 'string' ){
            percent = parseFloat( percent );
          }
          return Math.floor( (percent / 100 ) * max );
        }

        function set_active( $s ){
          console.log("set_active", $s );
          for ( var i=0; i < scenes.length; i++ ){
            scenes[i].$node.removeClass('active');
          }
          $s.addClass('active');
        }

        function convert_scene_positions_to_percentage(){
          $.each(scenes, function(i, v){
            var x_px = parseFloat( v.$node.position().left );
            var y_px = parseFloat( v.$node.position().top );
            var x_percent = percent( x_px, $('#scenes').width()  ) + "%";
            var y_percent = percent( y_px, $('#scenes').height() ) + "%";
            v.x = x_percent;
            v.y = y_percent;
            v.$node.css('top', y_percent);
            v.$node.css('left', x_percent);
          });
        }

        function serialize_scenes_data(){
          var s = []
          $.each(scenes, function(i,v){
            s.push(serialize_single_scene_data( v ) );
          });
          return '['+ s.join(',') +']';
        }

        function serialize_single_scene_data( data ){
          var fields = [];
          fields.push( add_serialized_field( 'name', data.name || '' ) );
          fields.push( add_serialized_field( 'id', data.id || '') );
          fields.push( add_serialized_field( 'containment', data.containment || '') );
          fields.push( add_serialized_field( 'description', data.description || '' ) );
          fields.push( add_serialized_field( 'x', data.x || '') );
          fields.push( add_serialized_field( 'y', data.y || '') );
         return '{' + fields.join(',') + '}';
        }

        function add_serialized_field( name, value ){
          return '"' + name + '":"' + value.split('"').join('\"') + '"';
        }

        function delete_scenes(){
          console.log('delete_scenes', scenes);
          $.each(scenes, function(i,v){
            v.$node.remove();
          });
          scenes = [];
          update_canvas();
        }

        function init(){
          
          $(window).resize( function(){
            convert_scene_positions_to_percentage();
            adapt_size();
            update_canvas();
          });

          $('#text #scene_description')
            .keyup( save_scene_description );

          $('#scenes').mousedown(function(e){
            if( $(e.target).attr('id') == 'scenes' 
                && $(e.currentTarget).attr('id') == 'scenes'){
              var conf = get_scene_config(e),
                  $s = create_scene(conf);
              set_active( $s );
              update_arrow( $s );
              update_text_display( {target:$s} );
              update_canvas();
              update_model_display();
            }
          });

          $('#read').click(function(e){
            delete_scenes();
            keyscenes = get_keyscenes();
            scenes =  JSON.parse( $('#text #model').val()  );
            $.each(scenes, function(i,v){
              keyscenes.shift();
              v.x = px( v.x, $('#scenes').width() );
              v.y = px( v.y, $('#scenes').height() );
              var $s = create_scene( v );
              v.$node = $s;
              update_arrow( $s );
            });
            update_canvas();
          });

          adapt_size();
        }

        init();
  });
