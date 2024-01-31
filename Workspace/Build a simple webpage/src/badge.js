"use strict";
exports.__esModule = true;
exports.insertBadge = void 0;
var typescript_svg_1 = require("./typescript.svg");
require("./badge.css");
function insertBadge() {
    var badge = document.querySelector("#badge");
    if (badge) {
        badge.innerHTML = "\n      <div>\n        Powered by&nbsp;\n        <a href=\"https://vitejs.dev\" target=\"_blank\">\n          <img src=\"/vite.svg\" class=\"logo\" alt=\"Vite logo\" />\n        </a>\n        &nbsp;+&nbsp;\n        <a href=\"https://www.typescriptlang.org/\" target=\"_blank\">\n          <img src=\"".concat(typescript_svg_1["default"], "\" class=\"logo\" alt=\"TypeScript logo\" />\n        </a>\n      </div>\n    ");
    }
}
exports.insertBadge = insertBadge;
