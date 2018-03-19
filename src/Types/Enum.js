"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Enum = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _index = require("../TypeSystem/index.js");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_index2.default.createEnum = function (name, container, enumType, enumDefinition) {
  return _index2.default.Enum.extend(name, container, enumType, enumDefinition);
};

_index2.default.Enum = _index2.default.Class.define("$data.Enum", null, null, {
  constructor: function constructor() {
    return _index.Guard.raise(new _index.Exception("Type Error", "Cannot create instance from enum type!"));
  }
}, {
    extend: function extend(name, container, enumType, enumDefinition) {
      if (!enumDefinition) {
        if (!enumType) {
          enumDefinition = container;
          container = undefined;
        } else {
          enumDefinition = enumType;
          enumType = container;
          container = undefined;
        }
      }

      enumType = enumType || _index2.default.Integer;
      enumType = _index.Container.resolveType(enumType);
      var classDefinition = {
        __enumType: {
          get: function get() {
            return enumType;
          }, set: function set() { }, enumerable: false, writable: false
        }
      };

      var getEnumDef = function getEnumDef(value, index) {
        return {
          get: function get() {
            return value;
          }, set: function set() { }, enumMember: true, index: index
        };
      };

      var defaultValue = 0;
      var isValueCalculation = [_index2.default.Byte, _index2.default.SByte, _index2.default.Int16, _index2.default.Integer, _index2.default.Int64].indexOf(enumType) >= 0;
      var hasIndex = false;

      var enumDef = [];
      if (Array.isArray(enumDefinition)) {
        for (var i = 0; i < enumDefinition.length; i++) {
          var enumValA = enumDefinition[i];
          if ((typeof enumValA === "undefined" ? "undefined" : _typeof(enumValA)) === "object" && typeof enumValA.name === "string") {
            enumDef.push({ name: enumValA.name, value: enumValA.value, index: enumValA.index });
            if (typeof enumValA.index !== "undefined") {
              hasIndex = true;
            }
          } else if (typeof enumValA === "string") {
            enumDef.push({ name: enumValA, value: undefined, index: undefined });
          } else {
            return _index.Guard.raise(new _index.Exception("Type Error", "Invalid enum member"));
          }
        }
      } else if ((typeof enumDefinition === "undefined" ? "undefined" : _typeof(enumDefinition)) === "object") {
        for (var enumName in enumDefinition) {
          var enumValO = enumDefinition[enumName];
          if ((typeof enumValO === "undefined" ? "undefined" : _typeof(enumValO)) === "object") {
            enumDef.push({ name: enumName, value: enumValO.value, index: enumValO.index });
            if (typeof enumValO.index !== "undefined") {
              hasIndex = true;
            }
          } else {
            enumDef.push({ name: enumName, value: enumValO, index: undefined });
          }
        }
      }

      if (hasIndex) {
        enumDef.sort(function (a, b) {
          if (a.index < b.index) return -1;
          if (a.index > b.index) return 1;
          return 0;
        });
      }

      var enumOptions = [];
      for (var i = 0; i < enumDef.length; i++) {
        var enumVal = enumDef[i];
        if (isValueCalculation && typeof enumVal.value !== "number" && !enumVal.value) {
          enumVal.value = defaultValue;
        }
        if (typeof enumVal.value === "number") {
          defaultValue = enumVal.value;
        }
        defaultValue++;
        enumOptions.push(enumVal.name);
        classDefinition[enumVal.name] = getEnumDef(enumVal.value, enumVal.index);
      }
      classDefinition.getEnumName = function (enumValue) {
        //var def = enumDef.filter(function (d) {
        //    return d.value === enumValue;
        //})[0];
        //if (def) {
        //    return def.name;
        //}
        return classDefinition.GetFlagValuesIfNeeded(enumValue, true);
      };

      classDefinition.GetFlagValuesIfNeeded = function (value, returnString) {
        var flagSeperator = /[, ]+/;
        var segments = flagSeperator.test(value) ? value.split(flagSeperator) : [value];
        var stringResponse = Array();
        var intResponse = null;
        var inputType = segments.length > 0 ? typeof segments[0] : null;
        var getEnumName = function (enumDef, value) {
          for (var i = 0; i < enumDef.length; i++) {
            if (enumDef[i].value == value) {
              return enumDef[i].name;
            }
          }
          return null;
        };

        for (var segment in segments) {
          if (inputType == "string" && enumOptions.indexOf(segments[segment]) >= 0) {
            var enumMember = enumClass.staticDefinitions.getMember(segments[segment]);
            if (enumMember) {
              intResponse = intResponse === null ? enumMember.get() : intResponse + enumMember.get();
            }
          }
          else {
            var arrayOrdered = Array();
            for (var i = 0; i < enumDef.length; i++) {
              arrayOrdered.push(enumDef[i].value);
            }
            arrayOrdered.sort(function (a, b) { return b - a });

            for (var i = 0; i < arrayOrdered.length; i++) {
              var enumVal = arrayOrdered[i]
              if (enumVal === segments[segment]) {
                var valueToReturn = returnString ? getEnumName(enumDef, value) : value;
                stringResponse.push(valueToReturn);
              }
            }

            if (stringResponse.length == 0) {
              var flagsLeft = segments[segment];
              var found = false;
              do {
                found = false;
                for (var i = 0; i < arrayOrdered.length; i++) {
                  if (arrayOrdered[i] <= flagsLeft) {
                    found = true;
                    flagsLeft -= arrayOrdered[i];
                    if (returnString) {
                      var valueToReturn = getEnumName(enumDef, arrayOrdered[i]);
                      stringResponse.push(valueToReturn);
                    }
                    arrayOrdered.splice(i, 1);
                    break;
                  }
                }
              } while (found && flagsLeft > 0);

              if (!returnString && found && flagsLeft == 0) {
                stringResponse.push(segments[segment]);
              }
            }
          }
        }

        if (inputType == "string" && intResponse !== null) {
          return intResponse;
        }
        else if (stringResponse.length == 1) {
          return stringResponse[0];
        }
        else if (stringResponse.length > 0) {
          return stringResponse.join(', ');
        }

        throw 0;
      };

      var enumClass = _index2.default.Base.extend.call(this, name, container, {}, classDefinition);

      _index2.default.Container.registerConverter(name, {
        'default': function _default(value) {
          return classDefinition.GetFlagValuesIfNeeded(value, false);
        }
      });
      return enumClass;
    },

    hasMetadata: function hasMetadata(key, property) {
      return typeof Reflect !== 'undefined' && Reflect.hasMetadata && Reflect.hasMetadata(key, this, property);
    },
    getAllMetadata: function getAllMetadata(property) {
      var _this = this;

      var result = {};
      if (typeof Reflect !== 'undefined' && Reflect.getMetadataKeys && Reflect.getMetadata) {
        var keys = Reflect.getMetadataKeys(this, property);
        keys.forEach(function (key) {
          result[key] = Reflect.getMetadata(key, _this, property);
        });
      }

      return result;
    },
    getMetadata: function getMetadata(key, property) {
      return typeof Reflect !== 'undefined' && Reflect.getMetadata ? Reflect.getMetadata(key, this, property) : undefined;
    },
    setMetadata: function setMetadata(key, value, property) {
      return typeof Reflect !== 'undefined' && Reflect.defineMetadata && Reflect.defineMetadata(key, value, this, property);
    }
  });

var Enum = exports.Enum = _index2.default.Enum;
exports.default = _index2.default;
