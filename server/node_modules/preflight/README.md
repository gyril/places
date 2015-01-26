Preflight
====
Preflight requests middleware.

# Installation

    npm install preflight

# Usage

    preflight = require('preflight');
    ...
    app.use(preflight());

With this middleware enable after CORS and before authentication, every preflight request will return a 200 http code.

# License

MIT License, see LICENSE