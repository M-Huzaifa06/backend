try {
  require('./server.js');
} catch (e) {
  const fs = require('fs');
  fs.writeFileSync('error_trace.txt', String(e.stack));
}
