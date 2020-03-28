

var request = false;
var init = false;
const dupleChker = new Set();
//지도를 삽입할 HTML 요소 또는 HTML 요소의 id를 지정합니다.
var mapDiv = document.getElementById('map'); // 'map'으로 선언해도 동일

//옵션 없이 지도 객체를 생성하면 서울 시청을 중심으로 하는 16 레벨의 지도가 생성됩니다.

		var initCenter;
		if (navigator.geolocation) { // GPS를 지원하면
			navigator.geolocation.getCurrentPosition(function(position) {
			  //alert(position.coords.latitude + ' ' + position.coords.longitude);
			  initCenter = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
			  map.setCenter(initCenter);
			}, function(error) {
			  console.error(error);
			}, {
			  enableHighAccuracy: false,
			  maximumAge: 0,
			  timeout: Infinity
			});
		  } else {
			initCenter= new naver.maps.LatLng(37.3614483, 127.1114883)
			//alert('GPS를 지원하지 않습니다');
		  }

var map = new naver.maps.Map(mapDiv,{
	center: initCenter,
	scaleControl: false,
	zoomControl: true,
	logoControl: false
});

naver.maps.Event.once(map, 'init_stylemap', function() {
var locationBtnHtml = '<a href="#" class="btn_mylct"><span class="spr_trff spr_ico_mylct">현재위치</span></a>';
	var customControl = new naver.maps.CustomControl(locationBtnHtml, {
        position: naver.maps.Position.TOP_LEFT
    });
	customControl.setMap(map);
	naver.maps.Event.addDOMListener(customControl.getElement(), 'click', function() {
	
		if (navigator.geolocation) { // GPS를 지원하면
			navigator.geolocation.getCurrentPosition(function(position) {
			  //alert(position.coords.latitude + ' ' + position.coords.longitude);
			  map.setCenter(new naver.maps.LatLng(position.coords.latitude, position.coords.longitude));
			}, function(error) {
			  console.error(error);
			}, {
			  enableHighAccuracy: false,
			  maximumAge: 0,
			  timeout: Infinity
			});
		  } else {
			map.setCenter(map.getCenter());
			//alert('GPS를 지원하지 않습니다');
		  }
    });
});
	function fetchInfo(lat,lng){
		var store;
		var range = "1000";//추후 가변으로
		if(map.zoom<=22){
			range = "500";
		}else if(map.zoom<=20){
			range = "1000";
		}else if(map.zoom<=18){
			range = "2000";
		}else if(map.zoom<=16){
			range = "3000";
		}else if(map.zoom<=14){
			range = "5000";
		}else if(map.zoom<=10){
			request = false;
			return ;
		}
		
		//https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?lat=37.35148745671425&lng=127.09941276992592&m=3000
		const URL = 'https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?';

		var urlParam= "lat=" + lat + "&lng=" + lng + "&m=" + range;

		const dupleChker = new Set();
		fetch(URL+urlParam)
		.then(function(response) {
			request = false;

		return response.json();
	  })
	  .then(function(myJson) {
		store = myJson.stores;
		myJson.stores.forEach((store)=>{
		
		//중복 처리
		if(dupleChker.has(store.code)){
			return ;
		}else{
			dupleChker.add(store.code);
		}
		
		var contentString = [
			'<div class="iw_inner">',
			'   <h3>'+store.name+'</h3>',
			'   <p>'+store.addr+'<br />',
			'  남은정도 : '+store.remain_stat+'<br>',
			'  입고시간 : '+store.stock_at+'<br>',
			'  생성일자 : '+store.created_at+'<br>',
			'   </p>',
			'</div>'
		].join('');
		
		var infowindow = new naver.maps.InfoWindow({
			content: contentString
		});

		//"remain_stat": "empty","plenty","few","some"
		var color="";
		var remain_text="";
		switch(store.remain_stat){
		case 'plenty':
			color = "green";
			remain_text = "충분(100~)";
			break;
		case 'some':
			color = 'yellow';
			remain_text = "보통(99~30)";
			break;
		case 'few':
			color = 'red';
			remain_text = "부족(29~2)";
			break;
		case 'break':
			color = 'white';
			remain_text = "판매중지";
			break;				
		default:
			color = 'gray';
			remain_text = "없음(1~0)";
		}

			var localMarker = new naver.maps.Marker({
				position: new naver.maps.LatLng(store.lat, store.lng),
				icon: {
			content: [
//						'<div class="cs_mapbridge" style="width:20px;height:20px;background:' + color + '">',
						'<div class="cs_mapbridge" style="background:' + color + '">',
							'<div class="map_group _map_group crs">',
							'<span>'+ remain_text +'</span>',
							'</div>',
						'</div>'
					].join(''),
			size: new naver.maps.Size(38, 58),
			anchor: new naver.maps.Point(19, 58),
		},
				map: map
			});
		naver.maps.Event.addListener(localMarker,"click",(e)=>{
		 if (infowindow.getMap()) {
				infowindow.close();
			} else {
				infowindow.open(map, localMarker);
			}
		});
		
		});
		
		//console.log(JSON.stringify(myJson));
		
	  });
	}


naver.maps.Event.addListener(map, "dragend", function(bounds) {
	if(request!=true){
		fetchInfo(map.getCenter().lat(),map.getCenter().lng());
		request = true;
	}
	
});
naver.maps.Event.addListener(map, "center_changed", function(bounds) {
	if(init!=true){
		fetchInfo(map.getCenter().lat(),map.getCenter().lng());
		init = true;
	}
	
});


