"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityStatus = exports.ActivityType = void 0;
var ActivityType;
(function (ActivityType) {
    ActivityType["RESTAURANT"] = "RESTAURANT";
    ActivityType["TERRASSE"] = "TERRASSE";
    ActivityType["BOITE_NUIT"] = "BOITE_NUIT";
    ActivityType["SHOP"] = "SHOP";
    ActivityType["CORDONNERIE"] = "CORDONNERIE";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var EntityStatus;
(function (EntityStatus) {
    EntityStatus["ACTIVE"] = "ACTIVE";
    EntityStatus["INACTIVE"] = "INACTIVE";
    EntityStatus["SUSPENDED"] = "SUSPENDED";
    EntityStatus["ARCHIVED"] = "ARCHIVED";
})(EntityStatus || (exports.EntityStatus = EntityStatus = {}));
//# sourceMappingURL=index.js.map