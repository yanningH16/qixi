var S1 = {
  init: function () {
    S1.Drawing.init('.canvas1');
    document.body.classList.add('body--ready');
    //想说的话
    S1.UI.simulate("#countdown 3");
    S1.Drawing.loop(function () {
      S1.Shape.render();
    });
  }
};




S1.Drawing = (function () {
  var canvas,
    context,
    renderFn,
    requestFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  return {
    init: function (el) {
      canvas = document.querySelector(el);
      context = canvas.getContext('2d');
      this.adjustCanvas();

      window.addEventListener('resize', function (e) {
        S1.Drawing.adjustCanvas();
      });
    },
    loop: function (fn) {
      renderFn = !renderFn ? fn : renderFn;
      this.clearFrame();
      renderFn();
      requestFrame.call(window, this.loop.bind(this));
    },
    adjustCanvas: function () {
      canvas.width = document.body.clientWidth;
      canvas.height = document.documentElement.clientHeight;
    },
    clearFrame: function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    getArea: function () {
      return {
        w: canvas.width,
        h: canvas.height
      };
    },
    drawCircle: function (p, c) {
      // debuggerdebugger
      context.fillStyle = c.render();
      context.beginPath();
      context.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true);
      context.closePath();
      context.fill();
    }
  };
}());


S1.UI = (function () {
  var interval,
    currentAction,
    time,
    maxShapeSize = 30,
    sequence = [],
    cmd = '#';

  function formatTime(date) {
    var h = date.getHours(),
      m = date.getMinutes(),
      m = m < 10 ? '0' + m : m;
    return h + ':' + m;
  }

  function getValue(value) {
    return value && value.split(' ')[1];
  }

  function getAction(value) {
    value = value && value.split(' ')[0];
    return value && value[0] === cmd && value.substring(1);
  }

  function timedAction(fn, delay, max, reverse) {
    clearInterval(interval);
    console.log('max', max)
    currentAction = reverse ? max : 1;
    fn(currentAction);

    if (!max || (!reverse && currentAction < max) || (reverse && currentAction > 0)) {
      interval = setInterval(function () {
        currentAction = reverse ? currentAction - 1 : currentAction + 1;
        fn(currentAction);

        if ((!reverse && max && currentAction === max) || (reverse && currentAction === 0)) {
          clearInterval(interval);
        }
      }, delay);
    }
  }

  function performAction(value) {
    var action,
      value,
      current;

    console.log('value', value)
    // 把要打印的字符分割
    sequence = typeof (value) === 'object' ? value : sequence.concat(value.split('|'));

    timedAction(function (index) {
      current = sequence.shift(); // 现在要展示的字符
      action = getAction(current);
      value = getValue(current);

      switch (action) {
        case 'countdown':
          // 打印倒计时
          value = parseInt(value) || 10;
          value = value > 0 ? value : 10;

          timedAction(function (index) {
            if (index === 0) {
              console.log('index 为0')
              if (sequence.length === 0) {
                setTimeout(function () {
                  document.querySelector('.canvas1').style = "display: none"
                  console.log('init', init)
                  init()
                }, 1000)
                S1.Shape.switchShape(S1.ShapeBuilder.letter(''));
                // 隐藏 canvas
              } else {
                performAction(sequence);
              }
            } else {
              // console.log('如果 index 为0')
              S1.Shape.switchShape(S1.ShapeBuilder.letter(index), true);
            }
          }, 1000, value, true);
          break;

        case 'rectangle':
          value = value && value.split('x');
          value = (value && value.length === 2) ? value : [maxShapeSize, maxShapeSize / 2];

          S1.Shape.switchShape(S1.ShapeBuilder.rectangle(Math.min(maxShapeSize, parseInt(value[0])), Math.min(maxShapeSize, parseInt(value[1]))));
          break;

        case 'circle':
          value = parseInt(value) || maxShapeSize;
          value = Math.min(value, maxShapeSize);
          S1.Shape.switchShape(S1.ShapeBuilder.circle(value));
          break;

        case 'time':
          var t = formatTime(new Date());

          if (sequence.length > 0) {
            S1.Shape.switchShape(S1.ShapeBuilder.letter(t));
          } else {
            timedAction(function () {
              t = formatTime(new Date());
              if (t !== time) {
                time = t;
                S1.Shape.switchShape(S1.ShapeBuilder.letter(time));
              }
            }, 1000);
          }
          break;

        default: {
          S1.Shape.switchShape(S1.ShapeBuilder.letter(current[0] === cmd ? 'HacPai' : current)); // 展示字符
        }
      }
    }, 2000, sequence.length);
  }

  return {
    simulate: function (action) {
      performAction(action);
    }
  };
}());


S1.Point = function (args) {
  this.x = args.x;
  this.y = args.y;
  this.z = args.z;
  this.a = args.a;
  this.h = args.h;
};

// 点的颜色
S1.Color = function (r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

S1.Color.prototype = {
  render: function () {
    return 'rgba(' + this.r + ',' + +this.g + ',' + this.b + ',' + this.a + ')';
  }
};


S1.Dot = function (x, y) {
  this.p = new S1.Point({
    x: x,
    y: y,
    z: 5,
    a: 1,
    h: 0
  });

  this.e = 0.07;
  this.S1 = true;

  this.c = new S1.Color(255, 255, 255, this.p.a);

  this.t = this.clone();
  this.q = [];
};

S1.Dot.prototype = {
  clone: function () {
    return new S1.Point({
      x: this.x,
      y: this.y,
      z: this.z,
      a: this.a,
      h: this.h
    });
  },
  _draw: function () {
    this.c.a = this.p.a;
    S1.Drawing.drawCircle(this.p, this.c);
  },
  _moveTowards: function (n) {
    var details = this.distanceTo(n, true),
      dx = details[0],
      dy = details[1],
      d = details[2],
      e = this.e * d;

    if (this.p.h === -1) {
      this.p.x = n.x;
      this.p.y = n.y;
      return true;
    }

    if (d > 1) {
      this.p.x -= ((dx / d) * e);
      this.p.y -= ((dy / d) * e);
    } else {
      if (this.p.h > 0) {
        this.p.h--;
      } else {
        return true;
      }
    }

    return false;
  },
  _update: function () {
    if (this._moveTowards(this.t)) {
      var p = this.q.shift();

      if (p) {
        this.t.x = p.x || this.p.x;
        this.t.y = p.y || this.p.y;
        this.t.z = p.z || this.p.z;
        this.t.a = p.a || this.p.a;
        this.p.h = p.h || 0;
      } else {
        if (this.S1) {
          this.p.x -= Math.sin(Math.random() * 3.142);
          this.p.y -= Math.sin(Math.random() * 3.142);
        } else {
          this.move(new S1.Point({
            x: this.p.x + (Math.random() * 50) - 25,
            y: this.p.y + (Math.random() * 50) - 25
          }));
        }
      }
    }

    d = this.p.a - this.t.a;
    this.p.a = Math.max(0.1, this.p.a - (d * 0.05));
    d = this.p.z - this.t.z;
    this.p.z = Math.max(1, this.p.z - (d * 0.05));
  },
  distanceTo: function (n, details) {
    var dx = this.p.x - n.x,
      dy = this.p.y - n.y,
      d = Math.sqrt(dx * dx + dy * dy);

    return details ? [dx, dy, d] : d;
  },
  move: function (p, avoidStatic) {
    if (!avoidStatic || (avoidStatic && this.distanceTo(p) > 1)) {
      this.q.push(p);
    }
  },
  render: function () {
    this._update();
    this._draw();
  }
};


S1.ShapeBuilder = (function () {
  var gap = 13,
    shapeCanvas = document.createElement('canvas'),
    shapeContext = shapeCanvas.getContext('2d'),
    fontSize = 500,
    fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif';

  function fit() {
    shapeCanvas.width = Math.floor(window.innerWidth / gap) * gap;
    shapeCanvas.height = Math.floor(window.innerHeight / gap) * gap;
    shapeContext.fillStyle = 'red';
    shapeContext.textBaseline = 'middle';
    shapeContext.textAlign = 'center';
  }

  function processCanvas() {
    var pixels = shapeContext.getImageData(0, 0, shapeCanvas.width, shapeCanvas.height).data;
    dots = [],
      pixels,
      x = 0,
      y = 0,
      fx = shapeCanvas.width,
      fy = shapeCanvas.height,
      w = 0,
      h = 0;

    for (var p = 0; p < pixels.length; p += (4 * gap)) {
      if (pixels[p + 3] > 0) {
        dots.push(new S1.Point({
          x: x,
          y: y
        }));

        w = x > w ? x : w;
        h = y > h ? y : h;
        fx = x < fx ? x : fx;
        fy = y < fy ? y : fy;
      }

      x += gap;

      if (x >= shapeCanvas.width) {
        x = 0;
        y += gap;
        p += gap * 4 * shapeCanvas.width;
      }
    }

    return {
      dots: dots,
      w: w + fx,
      h: h + fy
    };
  }

  function setFontSize(S1) {
    shapeContext.font = 'bold ' + S1 + 'px ' + fontFamily;
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function init() {
    fit();
    window.addEventListener('resize', fit);
  }

  // Init
  init();

  return {
    imageFile: function (url, callback) {
      var image = new Image(),
        a = S1.Drawing.getArea();

      image.onload = function () {
        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        shapeContext.drawImage(this, 0, 0, a.h * 0.6, a.h * 0.6);
        callback(processCanvas());
      };

      image.onerror = function () {
        callback(S1.ShapeBuilder.letter('What?'));
      };

      image.src = url;
    },
    circle: function (d) {
      var r = Math.max(0, d) / 2;
      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
      shapeContext.beginPath();
      shapeContext.arc(r * gap, r * gap, r * gap, 0, 2 * Math.PI, false);
      shapeContext.fill();
      shapeContext.closePath();

      return processCanvas();
    },
    letter: function (l) {
      var S1 = 0;

      setFontSize(fontSize);
      S1 = Math.min(fontSize,
        (shapeCanvas.width / shapeContext.measureText(l).width) * 0.8 * fontSize,
        (shapeCanvas.height / fontSize) * (isNumber(l) ? 1 : 0.45) * fontSize);
      setFontSize(S1);

      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
      shapeContext.fillText(l, shapeCanvas.width / 2, shapeCanvas.height / 2);

      return processCanvas();
    },
    rectangle: function (w, h) {
      var dots = [],
        width = gap * w,
        height = gap * h;

      for (var y = 0; y < height; y += gap) {
        for (var x = 0; x < width; x += gap) {
          dots.push(new S1.Point({
            x: x,
            y: y
          }));
        }
      }

      return {
        dots: dots,
        w: width,
        h: height
      };
    }
  };
}());


S1.Shape = (function () {
  var dots = [],
    width = 0,
    height = 0,
    cx = 0,
    cy = 0;

  function compensate() {
    var a = S1.Drawing.getArea();

    cx = a.w / 2 - width / 2;
    cy = a.h / 2 - height / 2;
  }

  return {
    shuffleIdle: function () {
      var a = S1.Drawing.getArea();

      for (var d = 0; d < dots.length; d++) {
        if (!dots[d].S1) {
          dots[d].move({
            x: Math.random() * a.w,
            y: Math.random() * a.h
          });
        }
      }
    },
    switchShape: function (n, fast) {
      // 画图标
      var size,
        a = S1.Drawing.getArea();

      width = n.w;
      height = n.h;

      compensate();

      if (n.dots.length > dots.length) {
        size = n.dots.length - dots.length;
        for (var d = 1; d <= size; d++) {
          dots.push(new S1.Dot(a.w / 2, a.h / 2));
        }
      }

      var d = 0,
        i = 0;

      while (n.dots.length > 0) {
        i = Math.floor(Math.random() * n.dots.length);
        dots[d].e = fast ? 0.25 : (dots[d].S1 ? 0.14 : 0.11);

        if (dots[d].S1) {
          dots[d].move(new S1.Point({
            z: Math.random() * 20 + 10,
            a: Math.random(),
            h: 18
          }));
        } else {
          dots[d].move(new S1.Point({
            z: Math.random() * 5 + 5,
            h: fast ? 18 : 30
          }));
        }

        dots[d].S1 = true;
        dots[d].move(new S1.Point({
          x: n.dots[i].x + cx,
          y: n.dots[i].y + cy,
          a: 1,
          z: 5,
          h: 0
        }));

        n.dots = n.dots.slice(0, i).concat(n.dots.slice(i + 1));
        d++;
      }

      for (var i = d; i < dots.length; i++) {
        if (dots[i].S1) {
          dots[i].move(new S1.Point({
            z: Math.random() * 20 + 10,
            a: Math.random(),
            h: 20
          }));

          dots[i].S1 = false;
          dots[i].e = 0.04;
          dots[i].move(new S1.Point({
            x: Math.random() * a.w,
            y: Math.random() * a.h,
            a: 0.3, //.4
            z: Math.random() * 4,
            h: 0
          }));
        }
      }
    },
    render: function () {
      for (var d = 0; d < dots.length; d++) {
        dots[d].render();
      }
    }
  };
}());
// S1.init();
