const { spawn } = require('child_process');

spawn("curl", ["-O", "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml"]);