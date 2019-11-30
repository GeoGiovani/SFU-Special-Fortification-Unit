
//Paste these onto HTML file to import jquery library
// <head>
// <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
// </head>
function getTime(position)
{
  console.log('Search time....')
  const API_KEY = '5fa97932916f4a1a9185b0e11aa157a8';
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const URL =
  `https://api.ipgeolocation.io/timezone?apiKey=${API_KEY}&lat=${lat}&long=${lon}`;
  $.getJSON(URL,function(data){
      // if  (error) throw (error);
      const time = data.time_24;
      console.log('time now is: '+time);
      getWeather(position,time);
  });
}

function getLocation()
{
  console.log('getLocation() called');
  if (navigator.geolocation)
  {
    navigator.geolocation.getCurrentPosition(getTime, noLocation);
  }
  else
  {
    alert(`Geolocation is not supported in your browser`);
  };
};

function noLocation(error) {
  if (error)
  {
    console.log('Location unavailable, using SFU location:');
    const position = {'coords':{'latitude':'49.2785182',
                                'longitude':'-122.9198392'}};
    getTime(position);
  };
}

//Sending API request with given geolocation
function getWeather(position,time) {
  console.log('Sending weather API request');
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const APIKEY= `44c3c5b6dfdc148055677bde4d8e396d`;
  const URL =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${APIKEY}`;
    // 'https://fcc-weather-api.glitch.me/api/current?lat='+lat+'&lon='+lon;
  $.getJSON(URL, function(data){
    console.log(data.weather[0].main);
    // console.log(data.weather[0].icon);
    var weather = data.weather[0].main;
    var icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      // $('#label').html(weather);
    const nighttime ='18:00:00';
    if (icon)
      $("#icon").attr("src",icon);
    else {
      $("#icon").attr("src","/image/weather-cloudy.jpg");
    }
    switch (weather) {
      case 'Rain':
        disableWeather();
        if (time<nighttime)
          sun();
        else
          moon();
        rain();
        break;
      case 'Drizzle':
        disableWeather();
        if (time<nighttime)
          sun();
        else
          moon();
        rain();
        break;
      case 'Thunderstorm':
        disableWeather();
        rainLightning();
        break;
      case 'Snow':
        disableWeather();
        snowy();
        break;
      case 'Clouds':
        if (time<nighttime)
          sun();
        else
          moon();
        break;
      case 'Clear':
        if (time<nighttime)
          sun();
        else
          moon();
        break;
    }
  });
};

function rain() {
  var canvas = $('#rain1')[0];
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.visibility = "visible";
  if(canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    ctx.strokeStyle = 'rgba(174,194,224,0.5)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';


    var init = [];
    var maxParts = 1000;
    for(var a = 0; a < maxParts; a++) {
      init.push({
        x: Math.random() * w,
        y: Math.random() * h,
        l: Math.random() * 1,
        xs: -4 + Math.random() * 4 + 2,
        ys: Math.random() * 10 + 10
      })
    }

    var particles = [];
    for(var b = 0; b < maxParts; b++) {
      particles[b] = init[b];
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for(var c = 0; c < particles.length; c++) {
        var p = particles[c];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
        ctx.stroke();
      }
      move();
    }

    function move() {
      for(var b = 0; b < particles.length; b++) {
        var p = particles[b];
        p.x += p.xs;
        p.y += p.ys;
        if(p.x > w || p.y > h) {
          p.x = Math.random() * w;
          p.y = -20;
        }
      }
    }

    setInterval(draw, 300);
  }
};


function rainLightning() {
    var canvas1 = document.getElementById('rain1');
    var canvas2 = document.getElementById('rain2');
    var canvas3 = document.getElementById('rain3');
    canvas1.style.visibility = 'visible';
    canvas2.style.visibility= 'visible';
    canvas3.style.visibility = 'visible';
    var ctx1 = canvas1.getContext('2d');
    var ctx2 = canvas2.getContext('2d');
    var ctx3 = canvas3.getContext('2d');

    var rainthroughnum = 500;
    var speedRainTrough = 25;
    var RainTrough = [];

    var rainnum = 500;
    var rain = [];

    var lightning = [];
    var lightTimeCurrent = 0;
    var lightTimeTotal = 0;

    var w = canvas1.width = canvas2.width = canvas3.width = window.innerWidth;
    var h = canvas1.height = canvas2.height = canvas3.height = window.innerHeight;
    window.addEventListener('resize', function() {
      w = canvas1.width = canvas2.width = canvas3.width = window.innerWidth;
      h = canvas1.height = canvas2.height = canvas3.height = window.innerHeight;
    });

    function random(min, max) {
      return Math.random() * (max - min + 1) + min;
    }

    function clearcanvas1() {
      ctx1.clearRect(0, 0, w, h);
    }

    function clearcanvas2() {
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    }

    function clearCanvas3() {
      ctx3.globalCompositeOperation = 'destination-out';
      ctx3.fillStyle = 'rgba(0,0,0,' + random(1, 30) / 100 + ')';
      ctx3.fillRect(0, 0, w, h);
      ctx3.globalCompositeOperation = 'source-over';
    };

    function createRainTrough() {
      for (var i = 0; i < rainthroughnum; i++) {
        RainTrough[i] = {
          x: random(0, w),
          y: random(0, h),
          length: Math.floor(random(1, 830)),
          opacity: Math.random() * 0.2,
          xs: random(-2, 2),
          ys: random(10, 20)
        };
      }
    }

    function createRain() {
      for (var i = 0; i < rainnum; i++) {
        rain[i] = {
          x: Math.random() * w,
          y: Math.random() * h,
          l: Math.random() * 1,
          xs: -4 + Math.random() * 4 + 2,
          ys: Math.random() * 10 + 10
        };
      }
    }

    function createLightning() {
      var x = random(100, w - 100);
      var y = random(0, h / 4);

      var createCount = random(1, 3);
      for (var i = 0; i < createCount; i++) {
        single = {
          x: x,
          y: y,
          xRange: random(5, 30),
          yRange: random(10, 25),
          path: [{
            x: x,
            y: y
          }],
          pathLimit: random(40, 55)
        };
        lightning.push(single);
      }
    };

    function drawRainTrough(i) {
      ctx1.beginPath();
      var grd = ctx1.createLinearGradient(0, RainTrough[i].y, 0, RainTrough[i].y + RainTrough[i].length);
      grd.addColorStop(0, "rgba(255,255,255,0)");
      grd.addColorStop(1, "rgba(255,255,255," + RainTrough[i].opacity + ")");

      ctx1.fillStyle = grd;
      ctx1.fillRect(RainTrough[i].x, RainTrough[i].y, 1, RainTrough[i].length);
      ctx1.fill();
    }

    function drawRain(i) {
      ctx2.beginPath();
      ctx2.moveTo(rain[i].x, rain[i].y);
      ctx2.lineTo(rain[i].x + rain[i].l * rain[i].xs, rain[i].y + rain[i].l * rain[i].ys);
      ctx2.strokeStyle = 'rgba(174,194,224,0.5)';
      ctx2.lineWidth = 1;
      ctx2.lineCap = 'round';
      ctx2.stroke();
    }

    function drawLightning() {
      for (var i = 0; i < lightning.length; i++) {
        var light = lightning[i];

        light.path.push({
          x: light.path[light.path.length - 1].x + (random(0, light.xRange) - (light.xRange / 2)),
          y: light.path[light.path.length - 1].y + (random(0, light.yRange))
        });

        if (light.path.length > light.pathLimit) {
          lightning.splice(i, 1);
        }

        ctx3.strokeStyle = 'rgba(255, 255, 255, .1)';
        ctx3.lineWidth = 3;
        if (random(0, 15) === 0) {
          ctx3.lineWidth = 6;
        }
        if (random(0, 30) === 0) {
          ctx3.lineWidth = 8;
        }

        ctx3.beginPath();
        ctx3.moveTo(light.x, light.y);
        for (var pc = 0; pc < light.path.length; pc++) {
          ctx3.lineTo(light.path[pc].x, light.path[pc].y);
        }
        if (Math.floor(random(0, 30)) === 1) { //to fos apo piso
          ctx3.fillStyle = 'rgba(255, 255, 255, ' + random(1, 3) / 100 + ')';
          ctx3.fillRect(0, 0, w, h);
        }
        ctx3.lineJoin = 'miter';
        ctx3.stroke();
      }
    };

    function animateRainTrough() {
      clearcanvas1();
      for (var i = 0; i < rainthroughnum; i++) {
        if (RainTrough[i].y >= h) {
          RainTrough[i].y = h - RainTrough[i].y - RainTrough[i].length * 5;
        } else {
          RainTrough[i].y += speedRainTrough;
        }
        drawRainTrough(i);
      }
    }

    function animateRain() {
      clearcanvas2();
      for (var i = 0; i < rainnum; i++) {
        rain[i].x += rain[i].xs;
        rain[i].y += rain[i].ys;
        if (rain[i].x > w || rain[i].y > h) {
          rain[i].x = Math.random() * w;
          rain[i].y = -20;
        }
        drawRain(i);
      }
    }

    function animateLightning() {
      clearCanvas3();
      lightTimeCurrent++;
      if (lightTimeCurrent >= lightTimeTotal) {
        createLightning();
        lightTimeCurrent = 0;
        lightTimeTotal = 200;  //rand(100, 200)
      }
      drawLightning();
    }

    function init() {
      createRainTrough();
      createRain();
      window.addEventListener('resize', createRainTrough);
    }
    init();

    function animloop() {
      animateRainTrough();
      animateRain();
      animateLightning();
      requestAnimationFrame(animloop);
    }

    animloop();
};

// ============ MOON =============


function moon(){

	var meteorSky = document.getElementById('moon');
  meteorSky.style.visibility = 'visible';
  meteorSky.width = window.innerWidth;
  meteorSky.height= window.innerHeight;
	var w = meteorSky.width;//document.body.clientWidth;
	var h = meteorSky.height;//document.body.clientHeight;

	var sky = new nightSky(meteorSky, w, h, {
		silverRiverNum : 1000,
		lineNumMax: 30,
		middleNum:7,
	});
}

function nightSky(id, w, h, options) {
	var self = this;

	// 默认配置
	var defaults = {
		num : 200,///星星数
		silverRiverNum : 800,// 银河数量
		lineNumMax: 20,//流星最多数量
		middleNum:7,///多少分的中间那一份(建议奇数，偶数自动+1)，银河的位置
	}

	///替换默认的数
	if(options) {
		for(var n in options) {
			defaults[n] = options[n]*1;
		}
	}

	self.canvas = id;
	self.context = self.canvas.getContext("2d");
	self.width = w - 2;
	self.height = h - 2;
	self.stars = []; ///星星arr
	self.lineStar = [];//流星数组
	self.allNum = defaults.num + defaults.silverRiverNum;//星星总数

	self.canvas.width = self.width;
	self.canvas.height = self.height;

	///增加星星数组内容
	self.stars = newStar(defaults.num, defaults.silverRiverNum, self.width, self.height, defaults.middleNum);

	var fnAll = setInterval(function(){
		render(self.context, self.width, self.height, self.allNum, self.stars, self.lineStar);
	},50);

	var fnLineStart = setInterval(function(){
 		lineStarbegin(defaults.lineNumMax,self.lineStar, self.width, self.height);
 	},2000);///流星时间

	// next();
	// nextV2();
	// function next() {
	// 	requestAnimationFrame(function(){
	// 		next();
	// 	},50);
	// 	render(self.context, self.width, self.height, self.allNum, self.stars, self.lineStar);
	// }

	// function nextV2() {
	// 	requestAnimationFrame(function(){
	// 		nextV2();
	// 	},2000);
	// 	lineStarbegin(defaults.lineNumMax,self.lineStar, self.width, self.height);
	// }

 	///改变星星的状态
	function render(cxt, w, h, num, stars, lineStar) {
		cxt.clearRect(0,0,w,h);//清空画布

		////绘制星星
		// console.log(self.stars)
		for(var i = 0; i < num; i++) {
			drawStar(cxt, stars[i].x, stars[i].y, stars[i].r, stars[i].alpha);

			///改变星星亮度
			if(stars[i].alpha < 0 || stars[i].alpha > 1) {
				stars[i].valpha = stars[i].valpha * -1;
			}

			stars[i].alpha += stars[i].valpha;

		}
		////绘制流星
		for(var i = 0; i < lineStar.length; i++) {
			drawlineStar(cxt, lineStar[i].x, lineStar[i].y, lineStar[i].r, lineStar[i].len);
			lineStar[i].x += lineStar[i].vx;
			lineStar[i].y += lineStar[i].vy;

			///回收流星
			if(lineStar[i].x - lineStar[i].len > self.width || lineStar[i].y - lineStar[i].len > h) {
				console.log('del')
				lineStar.splice(i,1);///如果流星离开视野之内，销毁流星实例，回收内存
			}
		}
		////绘制月亮
		drawMoon(cxt, w, h);

	}

	///是否增加流星
	function lineStarbegin(lineNumMax,lineStar, w, h) {

		if(!lineStar.length || lineStar.length <= 1) {
			console.log('0');
			newdrawlineStar(lineNumMax,lineStar, w, h);
		}

	}

	////绘制星星
	function drawStar(cxt, x, y, r, alpha) {
		cxt.beginPath();
		var draw = cxt.createRadialGradient(x, y, 0, x, y, r);
		// x0	渐变的开始圆的 x 坐标
		// y0	渐变的开始圆的 y 坐标
		// r0	开始圆的半径
		// x1	渐变的结束圆的 x 坐标
		// y1	渐变的结束圆的 y 坐标
		// r1	结束圆的半径
		draw.addColorStop(0,'rgba(255,255,255,'+ alpha +')');
		draw.addColorStop(1,'rgba(255,255,255,0)');
		cxt.fillStyle  = draw;
		cxt.arc(x, y,  r, 0, Math.PI*2, true);

		// x	圆的中心的 x 坐标。
		// y	圆的中心的 y 坐标。
		// r	圆的半径。
		// sAngle	起始角，以弧度计。（弧的圆形的三点钟位置是 0 度）。
		// eAngle	结束角，以弧度计。
		// counterclockwise	可选。规定应该逆时针还是顺时针绘图。False = 顺时针，true = 逆时针。
		cxt.fill();
		cxt.closePath();

	}

	///画流星
	function drawlineStar(cxt, x, y, r, len) {

		///半圆
		cxt.beginPath();
		var draw = cxt.createRadialGradient(x, y, 0, x, y, r);
		draw.addColorStop(0,'rgba(255,255,255,1)');
		draw.addColorStop(1,'rgba(255,255,255,0)');
		cxt.fillStyle  = draw;
		cxt.arc(x, y, 1, Math.PI / 4, 5 * Math.PI / 4);
		cxt.fill();
		cxt.closePath();

		///三角形
		cxt.beginPath();
		var tra = cxt.createLinearGradient(x - len, y - len, x, y);
		tra.addColorStop(0, 'rgba(0,0,0,0)');
    	tra.addColorStop(1, 'rgba(255,255,255,1)');
		cxt.strokeStyle = tra;/////线的颜色赋值 弄了那么就原来是他们用错api了
		cxt.moveTo(x, y);
		cxt.lineTo(x - len, y - len);
		cxt.fill();
		cxt.stroke();
		cxt.closePath();

	}

	function drawMoon(cxt, w, h) {
		var moon = cxt.createRadialGradient(w - 300, 200, 50, w - 300, 200, 150);

		 //径向渐变
        moon.addColorStop(0, 'rgba(255,255,255,.9)');
        moon.addColorStop(0.01, 'rgba(70,70,80,.9)');
        moon.addColorStop(0.2, 'rgba(40,40,50,.95)');
        moon.addColorStop(0.4, 'rgba(20,20,30,.8)');
        moon.addColorStop(1, 'rgba(0,0,10,0)');

        cxt.beginPath();
        cxt.save()
        cxt.fillStyle = moon;
        cxt.fillRect(0, 0, w, h);
        cxt.restore();
        cxt.fill();
        cxt.closePath();
	}

	///制造星星
	function newStar(num,silverRiverNum,width,height,middleNum) {

		var stars = [];
		/// 恒星
		for(var i = 0; i < num; i++) {
			var x = Math.round(Math.random() * width);
			var y = Math.round(Math.random() * height);

			//避开月亮
			if(y > 100 && y <400) {
				if(x > width - 300 && x < width -250) {
				x = x - 100;
				} else if(x > width - 250 && x < width -200) {
					x = x + 100;
				}
			}

			var star = {
				x: x,
				y: y,
				r:Math.round(Math.random()*4),
				alpha:0,//Math.random(),
				valpha:(Math.random()/70)*(Math.random() > .5 ? -1 : 1),//随机+- 星星透明度改变加速度
			}

			stars.push(star);
		}


		/// 银河 让y的随机值在中间
		for(var n = 0; n < silverRiverNum; n++) {

			var x = Math.round(Math.random() * width);
			var y = getMiddleHight(height, middleNum) + (x /7); ///让它倾斜

			var star2 = {
				x: x,
				y: y,
				r:Math.round(Math.random()*4),
				alpha:0,//Math.random(),
				valpha:(Math.random()/70)*(Math.random() > .5 ? -1 : 1),//随机+- 星星透明度改变加速度
			}

			stars.push(star2);
		}

		return stars;
		// random() 方法可返回介于 0 ~ 1 之间的一个随机数
		// round 就是四舍五入
	}

	///制造流星
	function newdrawlineStar(NumMax,lineStar, w, h) {

		var lineNum = Math.round(Math.random() * NumMax);///随机生成流星数量 最多20

		for(var i = 0; i < lineNum; i++) {
			var speed = Math.round(Math.random()*30);
			var linestar = {
				x:-Math.round(Math.random() * w) / 2,
				y:-Math.round(Math.random() * h) / 2,
				r:Math.round(Math.random()*4),
				vx: speed,
				vy: speed,
				len: Math.random() * 200 + 200,
			}

			lineStar.push(linestar);
		}
	}

	///让银河在中间有点倾斜
	function getMiddleHight(h, n) {
		///n 表示将h分成几分 的中间
		///n 必须是奇数
		///过滤偶数，偶数加1
		///argh 每num分之1的高度
		///addh 该范围的最小值
		///rehieght 随机出0~argh的数 然后加上最小值
		var num = n % 2 == 0 ? n + 1 : n;
		var argh = Math.round(h / num) + 1;
		var addh = argh*Math.floor(num/2); ///除2向下取整
		var rehieght = Math.round(Math.random() * argh) + addh;
		// console.log('h, n,num,argh,addh---'+h, n,num,argh,addh);

		return rehieght;
		// ///分成五分

		// if(rehieght > h*.4 && rehieght < height*.6) {
		// 	return rehieght;
		// } else if(rehieght < h*.4 && rehieght >h*.2) {
		// 	return rehieght + h*.2;
		// } else if(rehieght < h*.2) {
		// 	return rehieght + h*.4;
		// } else if(rehieght > h*.6 && rehieght < h*.8) {
		// 	return rehieght - h*.2;
		// } else if(rehieght > h*.8 && rehieght < h) {
		// 	return rehieght - h*.4;
		// }
	}


}

// ========== MOON ===============
// =========== SUN =============
function sun(){
  document.querySelector('#sun').style.visibility = 'visible';

  // var game = document.getElementById('canvas');
  // var ctx = game.getContext('2d');
  // ctx.beginPath();
  // ctx.rect(5,5,game.width,game.height);
  // ctx.fillStyle = '#ffff66';
  // ctx.fill();

}
// ============= END SUN ============
// =========== SNOW ================
function snowy() {

  (function() {
      var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame ||
      function(callback) {
          window.setTimeout(callback, 1000 / 60);
      };
      window.requestAnimationFrame = requestAnimationFrame;
  })();


  var flakes = [],
      canvas = document.getElementById("snow"),
      ctx = canvas.getContext("2d"),
      flakeCount = 400,
      mX = -100,
      mY = -100

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  canvas.style.visibility = 'visible';

  function snow() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < flakeCount; i++) {
          var flake = flakes[i],
              x = mX,
              y = mY,
              minDist = 150,
              x2 = flake.x,
              y2 = flake.y;

          var dist = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y)),
              dx = x2 - x,
              dy = y2 - y;

          if (dist < minDist) {
              var force = minDist / (dist * dist),
                  xcomp = (x - x2) / dist,
                  ycomp = (y - y2) / dist,
                  deltaV = force / 2;

              flake.velX -= deltaV * xcomp;
              flake.velY -= deltaV * ycomp;

          } else {
              flake.velX *= .98;
              if (flake.velY <= flake.speed) {
                  flake.velY = flake.speed
              }
              flake.velX += Math.cos(flake.step += .05) * flake.stepSize;
          }

          ctx.fillStyle = "rgba(255,255,255," + flake.opacity + ")";
          flake.y += flake.velY;
          flake.x += flake.velX;

          if (flake.y >= canvas.height || flake.y <= 0) {
              reset(flake);
          }


          if (flake.x >= canvas.width || flake.x <= 0) {
              reset(flake);
          }

          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
          ctx.fill();
      }
      requestAnimationFrame(snow);
  };

  function reset(flake) {
      flake.x = Math.floor(Math.random() * canvas.width);
      flake.y = 0;
      flake.size = (Math.random() * 3) + 2;
      flake.speed = (Math.random() * 1) + 0.5;
      flake.velY = flake.speed;
      flake.velX = 0;
      flake.opacity = (Math.random() * 0.5) + 0.3;
  }

  function init() {
      for (var i = 0; i < flakeCount; i++) {
          var x = Math.floor(Math.random() * canvas.width),
              y = Math.floor(Math.random() * canvas.height),
              size = (Math.random() * 3) + 2,
              speed = (Math.random() * 1) + 0.5,
              opacity = (Math.random() * 0.5) + 0.3;

          flakes.push({
              speed: speed,
              velY: speed,
              velX: 0,
              x: x,
              y: y,
              size: size,
              stepSize: (Math.random()) / 30,
              step: 0,
              opacity: opacity
          });
      }

      snow();
  };

  canvas.addEventListener("mousemove", function(e) {
      mX = e.clientX,
      mY = e.clientY
  });

  window.addEventListener("resize",function(){
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  })

  init();
};

function disableWeather(){
  document.querySelector('#sun').style.visibility ='hidden';
  document.querySelector('#snow').style.visibility ='hidden';
  document.querySelector('#rain1').style.visibility ='hidden';
  document.querySelector('#rain2').style.visibility ='hidden';
  document.querySelector('#rain3').style.visibility ='hidden';
  document.querySelector('#moon').style.visibility ='hidden';
}
// ============ END SNOW =============
//When the document is ready, evoke the followed function
$(document).ready(function(){
  getLocation();
  setInterval(getLocation,30000);
  // moon();
  // rain();
  // rainLightning();
  // sun();
  // snowy();
  // disableWeather();
});
