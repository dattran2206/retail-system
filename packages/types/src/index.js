"use strict";
// ================================================
// @retail-saas/types - Shared TypeScript Types
// ================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanName = exports.UserRole = exports.TenantStatus = void 0;
// ---- Enums ----
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "ACTIVE";
    TenantStatus["SUSPENDED"] = "SUSPENDED";
    TenantStatus["PENDING"] = "PENDING";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["TENANT_ADMIN"] = "TENANT_ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["CASHIER"] = "CASHIER";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var PlanName;
(function (PlanName) {
    PlanName["FREE"] = "FREE";
    PlanName["PRO"] = "PRO";
    PlanName["ENTERPRISE"] = "ENTERPRISE";
})(PlanName || (exports.PlanName = PlanName = {}));
//# sourceMappingURL=index.js.map