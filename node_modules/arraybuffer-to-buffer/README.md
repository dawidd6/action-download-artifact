# arraybuffer-to-buffer

Convert ArrayBuffer to Buffer

# Install

```bash
npm install arraybuffer-to-buffer
```

# Usage

```javascript
var arrayBufferToBuffer = require('arraybuffer-to-buffer');

var ab = new ArrayBuffer(12);
var v = new DataView(ab);
[].slice.call('abc').forEach(function(s, i) {
  v[i] = s.charCodeAt(0);
});

var b = arrayBufferToBuffer(ab);

b.toString('utf8', 0, 3); // 'abc'
```

# License

MIT
