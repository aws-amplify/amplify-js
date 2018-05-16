'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _runtime = require('regenerator-runtime/runtime');

var _runtime2 = _interopRequireDefault(_runtime);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _parser = require('graphql/language/parser');

var _awsAmplify = require('aws-amplify');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var getOperationType = function getOperationType(operation) {
    var doc = (0, _parser.parse)(operation);

    var _doc$definitions = _slicedToArray(doc.definitions, 1),
        operationType = _doc$definitions[0].operation;

    return operationType;
};

var Connect = function (_Component) {
    _inherits(Connect, _Component);

    function Connect(props) {
        _classCallCheck(this, Connect);

        var _this = _possibleConstructorReturn(this, (Connect.__proto__ || Object.getPrototypeOf(Connect)).call(this, props));

        _this.state = _this.getDefaultState();
        _this.subSubscription = null;
        return _this;
    }

    _createClass(Connect, [{
        key: 'getDefaultState',
        value: function getDefaultState() {
            return {
                loading: false,
                data: {},
                errors: [],
                mutation: function mutation() {
                    return console.warn('Not implemented');
                }
            };
        }
    }, {
        key: '_fetchData',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_runtime2.default.mark(function _callee2() {
                var _this2 = this;

                var _props, _props$query, query, _props$query$variable, variables, _props$mutation, mutation, _props$mutation$mutat, mutationVariables, subscription, _props$onSubscription, onSubscriptionMsg, _getDefaultState, data, mutationProp, errors, hasValidQuery, hasValidMutation, hasValidSubscription, response, subsQuery, subsVars, observable;

                return _runtime2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                this._unsubscribe();
                                this.setState({ loading: true });

                                _props = this.props, _props$query = _props.query;
                                _props$query = _props$query === undefined ? {} : _props$query;
                                query = _props$query.query, _props$query$variable = _props$query.variables, variables = _props$query$variable === undefined ? {} : _props$query$variable, _props$mutation = _props.mutation;
                                _props$mutation = _props$mutation === undefined ? {} : _props$mutation;
                                mutation = _props$mutation.query, _props$mutation$mutat = _props$mutation.mutationVariables, mutationVariables = _props$mutation$mutat === undefined ? {} : _props$mutation$mutat, subscription = _props.subscription, _props$onSubscription = _props.onSubscriptionMsg, onSubscriptionMsg = _props$onSubscription === undefined ? function (prevData) {
                                    return prevData;
                                } : _props$onSubscription;
                                _getDefaultState = this.getDefaultState(), data = _getDefaultState.data, mutationProp = _getDefaultState.mutation, errors = _getDefaultState.errors;
                                hasValidQuery = query && getOperationType(query) === 'query';
                                hasValidMutation = mutation && getOperationType(mutation) === 'mutation';
                                hasValidSubscription = subscription && getOperationType(subscription.query) === 'subscription';


                                if (!hasValidQuery && !hasValidMutation && !hasValidSubscription) {
                                    console.warn('No query, mutation or subscription was specified');
                                }

                                if (!hasValidQuery) {
                                    _context2.next = 25;
                                    break;
                                }

                                _context2.prev = 13;

                                data = null;

                                _context2.next = 17;
                                return _awsAmplify.API.graphql({ query: query, variables: variables });

                            case 17:
                                response = _context2.sent;


                                data = response.data;
                                _context2.next = 25;
                                break;

                            case 21:
                                _context2.prev = 21;
                                _context2.t0 = _context2['catch'](13);

                                data = _context2.t0.data;
                                errors = _context2.t0.errors;

                            case 25:

                                if (hasValidMutation) {
                                    mutationProp = function () {
                                        var _ref2 = _asyncToGenerator( /*#__PURE__*/_runtime2.default.mark(function _callee(variables) {
                                            var result;
                                            return _runtime2.default.wrap(function _callee$(_context) {
                                                while (1) {
                                                    switch (_context.prev = _context.next) {
                                                        case 0:
                                                            _context.next = 2;
                                                            return _awsAmplify.API.graphql({ query: mutation, variables: variables });

                                                        case 2:
                                                            result = _context.sent;


                                                            _this2.forceUpdate();
                                                            return _context.abrupt('return', result);

                                                        case 5:
                                                        case 'end':
                                                            return _context.stop();
                                                    }
                                                }
                                            }, _callee, _this2);
                                        }));

                                        return function mutationProp(_x) {
                                            return _ref2.apply(this, arguments);
                                        };
                                    }();
                                }

                                if (hasValidSubscription) {
                                    subsQuery = subscription.query, subsVars = subscription.variables;


                                    try {
                                        observable = _awsAmplify.API.graphql({ query: subsQuery, variables: subsVars });


                                        this.subSubscription = observable.subscribe({
                                            next: function next(_ref3) {
                                                var data = _ref3.value.data;
                                                var prevData = _this2.state.data;

                                                var newData = onSubscriptionMsg(prevData, data);
                                                _this2.setState({ data: newData });
                                            },
                                            error: function error(err) {
                                                return console.error(err);
                                            }
                                        });
                                    } catch (err) {
                                        errors = err.errors;
                                    }
                                }

                                this.setState({ data: data, errors: errors, mutation: mutationProp, loading: false });

                            case 28:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[13, 21]]);
            }));

            function _fetchData() {
                return _ref.apply(this, arguments);
            }

            return _fetchData;
        }()
    }, {
        key: '_unsubscribe',
        value: function _unsubscribe() {
            if (this.subSubscription) {
                this.subSubscription.unsubscribe();
            };
        }
    }, {
        key: 'componentDidMount',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_runtime2.default.mark(function _callee3() {
                return _runtime2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                this._fetchData();

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function componentDidMount() {
                return _ref4.apply(this, arguments);
            }

            return componentDidMount;
        }()
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this._unsubscribe();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var loading = this.state.loading;
            var _props2 = this.props,
                newQueryObj = _props2.query,
                newMutationObj = _props2.mutation;
            var prevQueryObj = prevProps.query,
                prevMutationObj = prevProps.mutation;

            // query

            var _ref5 = newQueryObj || {},
                newQuery = _ref5.query,
                newQueryVariables = _ref5.variables;

            var _ref6 = prevQueryObj || {},
                prevQuery = _ref6.query,
                prevQueryVariables = _ref6.variables;

            var queryChanged = prevQuery !== newQuery || JSON.stringify(prevQueryVariables) !== JSON.stringify(newQueryVariables);

            // mutation

            var _ref7 = newMutationObj || {},
                newMutation = _ref7.query,
                newMutationVariables = _ref7.variables;

            var _ref8 = prevMutationObj || {},
                prevMutation = _ref8.query,
                prevMutationVariables = _ref8.variables;

            var mutationChanged = prevMutation !== newMutation || JSON.stringify(prevMutationVariables) !== JSON.stringify(newMutationVariables);

            if (!loading && (queryChanged || mutationChanged)) {
                this._fetchData();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state,
                data = _state.data,
                loading = _state.loading,
                mutation = _state.mutation,
                errors = _state.errors;


            return this.props.children({ data: data, errors: errors, loading: loading, mutation: mutation }) || null;
        }
    }]);

    return Connect;
}(_react.Component);

exports.default = Connect;