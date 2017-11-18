"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_prompt_1 = require("react-prompt");
var MFAPrompt = (function (_super) {
    __extends(MFAPrompt, _super);
    function MFAPrompt(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            promptTitle: 'Enter code',
            code: '',
        };
        _this.handleCancel = _this.handleCancel.bind(_this);
        _this.handleValidateMFACode = _this.handleValidateMFACode.bind(_this);
        return _this;
    }
    MFAPrompt.prototype.handleCancel = function () {
        this.props.onCancel();
    };
    MFAPrompt.prototype.handleValidateMFACode = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.props.onValidate(code)];
                    case 1:
                        result = _a.sent();
                        this.props.onSuccess(result);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        this.setState({ promptTitle: err_1.message + " Enter code again" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MFAPrompt.prototype.render = function () {
        return (<react_prompt_1.default title={this.state.promptTitle} placeholder="Code" textInputProps={{
            keyboardType: 'numeric',
        }} visible={true} onCancel={this.handleCancel} onSubmit={this.handleValidateMFACode}/>);
    };
    MFAPrompt.propTypes = {
        onValidate: react_1.PropTypes.func.isRequired,
        onCancel: react_1.PropTypes.func.isRequired,
        onSuccess: react_1.PropTypes.func.isRequired,
    };
    MFAPrompt.defaultProps = {
        onValidate: function () { return null; },
        onCancel: function () { return null; },
        onSuccess: function () { return null; },
    };
    return MFAPrompt;
}(react_1.default.Component));
exports.default = MFAPrompt;
//# sourceMappingURL=MFAPrompt.js.map